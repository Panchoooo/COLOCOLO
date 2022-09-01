const puppeteer = require('puppeteer');
const express = require("express");
var request = require('request');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({ attrkey: "ATTR" });
const delay = ms => new Promise(res => setTimeout(res, ms));
const fs = require('fs');
var portbot = 5000;
var flag_nombre = false;

var last_date = "Sin fecha";
var last_fecha = "Sin fecha";
var browser = null;
var flag_tipo = 0 ;
var nombre_producto = "";
var monitor =  -1;
var puerto = -1;
var skus = [];
var limite_sku = 20;
var carrito = [];
var banned = 0;
var ips = [ "http://snkrpancho.ddns.net:8000","http://diegomonitor.ddns.net:8000"]
//var ips = [ "http://diegomonitor.ddns.net:8000"]

change_monitor(process.argv[2],process.argv[3]);

function LeerArchivo(i){
    var producto = []
    const allFileContents = fs.readFileSync('monitores.txt', 'utf-8');
    allFileContents.split(/\r?\n/).forEach((line,index) =>  {
        if(index == parseInt(i)-1 ){
            producto = line.split(";")
        }
    });
    return producto
}
async function change_monitor(i,puertobot){
    monitor = i;
    puerto = parseInt(puertobot)+parseInt(i);
    portbot = puertobot;
    skus = []
    var producto = LeerArchivo(i)
    nombre_producto = producto[0];
    flag_tipo = producto[1];
    if(flag_tipo == 0){
        skus = [parseInt(producto[3])]
        limite_sku = parseInt(producto[2]);
    }
    if(flag_tipo == 1){
        skus = producto[2].split(",").map(x => +x)
    }
}
function añadirtxt(str,nombre_archivo){
    fs.appendFile(nombre_archivo, str, (err) => {
    if (err) throw err;
    });
}

async function PageAdd(sku,page){
    try {
        await page.goto("https://nikeclprod.myvtex.com/checkout/cart/add?sku="+sku+"&qty=1&seller=1&redirect=false&sc=1",{waitUntil: 'networkidle2'});
        console.log(sku)
    } catch (error) {
    }
}
async function Addsku(inicio,page){
    try {
        await PageAdd(inicio,page)
        var c = await page.evaluate(() =>{
            return document.getElementsByTagName('body')[0].childElementCount;
        })
        return c
    } catch (error) {
        console.log("Fallo al agregar...",error)
    }
}
async function CargarCarro(){
    totalProductos = 0;
    var page = await browser.newPage();
    try {
        if(flag_tipo == 0 || flag_tipo == 2){
            for(var i = 0 ; i<limite_sku;i){
                var sku = parseInt(skus[0])+i;
                var r = await Addsku(sku,page)
                if(r == 0){
                    i++
                    totalProductos+=1;
                }else{
                    page.close()
                     page = await browser.newPage(); 
                }
            }
        }
        if(flag_tipo == 1){
            for(var i = 0 ; i<skus.length;i++){
                var r = await Addsku(sku,page)
                if(r == 0){
                    i++
                    totalProductos+=1;
                }else{
                    page.close()
                     page = await browser.newPage(); 
                }
            }
        }
    } catch (error) {
        console.log("error1",error)   
    }
    await page.close();
}



async function CheckCargado(inicio) {
    var flag_encontre = -1;
    const page = await browser.newPage();
    await Addsku(inicio,page)

    try {
        await page.goto("https://nikeclprod.myvtex.com/api/checkout/pub/orderForm?refreshOutdatedData=true",{waitUntil: 'networkidle2'});
        var services = await page.evaluate(() =>{
            var wea = [];
            var elementos = document.getElementsByClassName('folder');
            var flag_weas = 0;
            var comp = '<items>'
            for(var i = 0 ; i<elementos.length ; i++){
                if(elementos[i].textContent.slice(0,comp.length) == comp && flag_weas == 1){
                    wea.push(elementos[i].textContent)
                }
                if(elementos[i].textContent.slice(0,comp.length) == comp && flag_weas == 0){
                    flag_weas = 1;
                }
            }
            return wea;
        })
        if(services.length != 0){
            parser.parseString(services[0], function(error, result) {
                if(error === null) {
                    var ordenes = result["items"]["OrderItemResponse"];
                    for(var i =0 ; i<ordenes.length;i++){
                        flag_encontre = 1;
                    }
                }
                else {
                    console.log(error);
                }
            });
        }
    } catch (error) {
        console.log("error",error)  
    }
    await page.close();
    return flag_encontre;
};


async function CheckCarro(page){
    var carro_aux = [] 
    var elementos = 0 ;
    await refresh(page);
    await page.goto("http://nikeclprod.myvtex.com/api/checkout/pub/orderForm?refreshOutdatedData=true");
    //await page.screenshot({ path: 'fullpage'+monitor+'.png', fullPage: true });
    var services = await page.evaluate(() =>{
        var wea = [];
        var elementos = document.getElementsByClassName('folder');
        var flag_weas = 0;
        var comp = '<items>'
        for(var i = 0 ; i<elementos.length ; i++){
            if(elementos[i].textContent.slice(0,comp.length) == comp ){
                if(flag_weas == 1){
                    wea.push(elementos[i].textContent)
                    break
                }
                flag_weas = 1
            }
        }
        return wea;
    })
    //console.log(services)
   // añadirtxt(last_date+"\n",monitor+".txt")
   // await delay(50)
    var flag_aviso = 0;
    if(services.length != 0){
        parser.parseString(services[0], function(error, result) {
            if(error === null) {
                var ordenes = result["items"]["OrderItemResponse"];
                for(var i =0 ; i<ordenes.length;i++){
                    var available = ordenes[i]["availability"][0];
                    var sku =  ordenes[i]["id"][0];
                    var name =  "'"+ordenes[i]["name"]+"'";
                    if(available == "available" ){
                        flag_aviso = 1;
                        enviarMSJ(name,sku)
                        carro_aux.push([name,true,sku])        
                    }
                    else{
                        carro_aux.push([name,false,sku])        
                    }
                    elementos+=1;
                //    añadirtxt(sku+" | "+name+" | "+available+"\n",monitor+".txt")
                }
            }
            else {
                console.log(error);
            }
        })
    }

    if(flag_aviso  == 1  ){
        OpenRequest(carro_aux)
        //await delay(1000)
        flag_aviso = 0;
    }


    //añadirtxt("\n\n",monitor+".txt")
    last_fecha = getDate();

    carrito = carro_aux
    console.log("Monitor: " + monitor + " | Ultimo check : "+ last_date);
    console.log("Elementos actuales: " + carrito.length + " | "+ elementos)
    if(carrito.length == 0){
        return 0;
    }
    return 1;
}


(async () => {

    browser = await puppeteer.launch({
        headless: true,
        args: ['--user-agent=<user_agent_string>','--no-sandbox','--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
   // await page.goto("https://nikeclprod.myvtex.com",{waitUntil: 'networkidle2',timeout:10000});

    console.log("Monitor: "+monitor+" | Puerto: "+puerto+ " | PuertoBot: "+portbot+" Nombre:"+nombre_producto+" | Limite: "+limite_sku)
    var flag_encontre = await CheckCargado(skus[0]);
    while(flag_encontre != 1){
        console.log("Sku "+skus[0]+" no disponible aun "+ flag_encontre)
        await delay(10000)
        flag_encontre = await CheckCargado(skus[0])
    }
    await enviarMSJ(nombre_producto,skus[0])
    await CargarCarro(page)

    var end = 0;
    while(end != -1){
        try {
            result = await CheckCarro(page);
        } catch (error) {
            await delay(1000)
            console.log("Error general",error)  
        }
    }
})();










const app = express();
app.set("port", process.env.PORT || puerto);

app.get("/", (req, res) => {
    res.send('Hello World');
});
app.get("/get", (req, res) => {
    res.send("Monitor "+monitor+" | Ultimo monitoreo: "+ last_date);
});
app.get("/getCarrito", (req, res) => {
    console.log(carrito)
    var msj = "Monitor "+monitor+" | Ultima fecha: "+last_fecha+"\nNombre: "+nombre_producto+"\n";
    carrito.forEach(element => {
        var elemento = element;
        msj += 'Producto: <b>'+elemento[0]+'</b> | SKU: '+elemento[2]+' | <a href="'+crearURL(elemento[2],1)+'"><b>Comprar</b></a>\n'
    });
    res.send(msj);
});
app.get("/apagar", (req, res) => {
    process.exit(1)
});
app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);















function getDate(){
    let date_ob = new Date();
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours();
    let minutes = date_ob.getMinutes();
    let seconds = date_ob.getSeconds();
    last_date = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
    return last_date;
}
async function refresh(){
    const page = await browser.newPage();
    try {
        await page.goto("http://nikeclprod.myvtex.com/checkout/cart/add?sku=0&qty=1&seller=1&redirect=false&sc=1");  
        
    } catch (error) {
    }
    await page.close();
}

async function refresh2(page){
    var contador = 0;
    var limite = -5;
    try {
        await page.goto("https://nikeclprod.myvtex.com/checkout/cart/add?sku=0&qty=1&seller=1&redirect=false&sc=1");  
        var c = await page.evaluate(() =>{
            return document.getElementsByTagName('body')[0].childElementCount;
        })
        while(c > 0 && limite != contador){
            contador-=1;
            await page.goto("https://nikeclprod.myvtex.com/checkout/cart/add?sku=0&qty=1&seller=1&redirect=false&sc=1");  
            var c = await page.evaluate(() =>{
                if(document.getElementsByClassName("large-font")[0]!=undefined && document.getElementsByClassName("large-font")[0].children[0].textContent == "You do not have access to nikeclprod.myvtex.com." ){
                    return "BAN"
                }
                if(document.getElementsByTagName("h2")[0] !=undefined && document.getElementsByTagName("h2")[0].textContent == 'Lo sentimos, ha ocurrido un error al procesar su solicitud.'){
                    return "Error"
                }
                return document.getElementsByTagName('body')[0].childElementCount;
            })
            console.log("c: "+c)
            if(c == "BAN" ){
                console.log("Sku 0 | Ban")
                await delay(1000)
            }
            else if(c == "Error"){
                console.log("Sku "+contador+" | Error culiaito")
                c = 1
            }
            else if(c > 0){
                console.log("C > 0")
                await delay(2000)
            }
        }
    } catch (error) {
        console.log(error)
    }
}


async function refresh3(page,a){

    await page.goto("https://nikeclprod.myvtex.com/checkout/cart/add?sku=0&qty=1&seller=1&redirect=false&sc=1");  
    while(true){
        try {
            await page.reload({waitUntil: 'load'});
            //await page.screenshot({ path: 'fullpage'+a+'.png', fullPage: true });
        } catch (error) {
            console.log(error)
            await delay(1000)
        }
    }

}


async function enviarMSJ(nombre,sku){
    var options = null;
    try {
        if(nombre == null || nombre == ""){
            nombre = "nulo";
        }
        
        if(nombre.includes("/")){
            nombre = nombre.split("/","")
            nombre = nombre.join("")
        }
        

        if(flag_nombre == true){
             options = {
                'method': 'GET',
                'url': 'http://localhost:'+portbot+'/send/'+monitor+'/'+nombre_producto+'/'+sku,
                'headers': {
                }
            };
        }        
        if(flag_nombre == false){
             options = {
                'method': 'GET',
                'url': 'http://localhost:'+portbot+'/send/'+monitor+'/'+nombre+'/'+sku,
                'headers': {
                }
            };
        }
        request(options, function (error, response) {
            if (error){
                console.log(error)
            }else{
                console.log(response.body);
            }   
        });
    } catch (error) {
        console.log(error)
    }
}
async function ChangeVPN(){
    var options = {
        'method': 'GET',
        'url': 'http://localhost:4000/changevpn',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error){
            console.log(error)
        }else{
            console.log(response.body);
        }   
    });
}
function OpenRequest(skus){

    var skustxt;
    var carrotrue = [];
    for(var j = 0 ; j < skus.length ; j++){
        if(skus[j][1] == true){
            carrotrue.push(skus[j][2])
        }
    }
    skustxt = carrotrue.join(";");
    console.log(skustxt)
    console.log("Enviando solicitud !")
    for(var i = 0 ; i < ips.length ; i ++){
        var options = {
            'method': 'GET',
            'url': ips[i]+'/open/'+skustxt,
            'headers': {
            }
        };

        request(options, function (error, response) {
            if (error){
                console.log(error)
            }else{
                console.log(response.body);
            }   
        });  


    }
 }
function crearURL(sku,cantidad){
    return "https://nikeclprod.myvtex.com/checkout/cart/add?sku="+sku+"&qty="+cantidad+"&seller=1&redirect=false&sc=1";
}