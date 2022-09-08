const puppeteer = require('puppeteer');
const express = require("express");
var request = require('request');
const { exec } = require("child_process");

const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api')
let users = ['-1001578014454'];
var token = null ; 
var i = process.argv[2];
var monitores = []
var puerto = 4000

var carrostxt = "";
function LeerArchivo(){
    carrostxt = "";
    var producto = 0;
    const allFileContents = fs.readFileSync('monitores.txt', 'utf-8');
    allFileContents.split(/\r?\n/).forEach((line,index) =>  {
        producto += 1;
        carrostxt += "Monitor "+ (index+1) + " | "+line.split(";").join(" ") + "\n\n";
    });
    return producto;
}

var cantidad = LeerArchivo();


if( i == 1){
    token = '5175295388:AAGkp3YHnJLW2NZOX2cAudw1qxWNPZHLRRE'
   // token = '5173216820:AAEjDXKCK3VopsN8YjvujYC_iP_gscs-bDY' 
    puerto = 5000;
    for(var m = 1; m <= cantidad ; m++){
        monitores.push(5000+m)
    }
}
if( i == 2){
    token = '5173216820:AAEjDXKCK3VopsN8YjvujYC_iP_gscs-bDY' 
    puerto = 6000;
    for(var m = 1; m <= cantidad ; m++){
        monitores.push(6000+m)
    }
}
if( i == 3){
    token = '5109726161:AAEdv4kKJoFuN5Fyq_-GLtLB_KxKkcvO-Tg'
    puerto = 7000;
    for(var m = 1; m <= cantidad ; m++){
        monitores.push(7000+m)
    }
}

const bot = new TelegramBot(token, { polling: true })


function isNumeric(n) { 
    return !isNaN(parseFloat(n)) && isFinite(n); 
  }

bot.onText(/\/register/, (msg, match) => {
    const chatId = msg.chat.id
    console.log(chatId)
    var flag = 0;
    for(var i = 0 ; i< users.length ; i++){
        if(users[i] == chatId){
            bot.sendMessage(chatId, 'Ya estas registrado !.')
            flag = 1;
        }
    }
    if(flag==0){
        users.push(chatId)
        console.log('user registered')
        bot.sendMessage(chatId, 'Done.')
    }   
})

bot.onText(/\/users/, (msg, match) => {
    const chatId = msg.chat.id
    var msj = ""
    for(var i = 0; i<users.length;i++){
        msj+= users[i]+"\n";
    }

    if(users.length>0){
        bot.sendMessage(chatId,msj)
    }else{
        bot.sendMessage(chatId,"No hay usuarios registrados")
    }
})


async function wsp(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendMessage(users[i],msj, {disable_web_page_preview:true,parse_mode:"HTML"})
    }
}

async function getEstados(){
    monitores.forEach((element,index) => {

        var monitor = element
        var options = {
            'method': 'GET',
            'url': 'http://localhost:'+monitor+'/get',
            'headers': {
            }
        };
        request(options, function (error, response) {
            if (error){
                for(var i = 0 ; i < users.length ; i++){
                    var msje = "Error con el monitor: "+(index+1)+" | Puerto: "+monitor;
                    bot.sendMessage(users[i],msje)
                }
            }else{
                console.log(response.body);
                for(var i = 0 ; i < users.length ; i++){
                    bot.sendMessage(users[i],response.body)
                }
            }   
        });
    });

}
async function getCarros(id){
    monitores.forEach((element,index) => {

        var monitor = element
        var options = {
            'method': 'GET',
            'url': 'http://localhost:'+monitor+'/getCarrito',
            'headers': {
            }
        };
        request(options, function (error, response) {
            if (error){
                var msje = "Error con el monitor: "+(index+1)+" | Puerto: "+monitor;
                bot.sendMessage(id,msje)

            }else{
                console.log(response.body)
                bot.sendMessage(id,response.body, {parse_mode:"HTML"})
            }   
        });
    });

}
async function getCarro(indice,id){

    var monitor = monitores[indice-1]
    var options = {
        'method': 'GET',
        'url': 'http://localhost:'+monitor+'/getCarrito',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error){
            var msje = "Error con el monitor: "+(indice)+" | Puerto: "+monitor;
            bot.sendMessage(id,msje)

        }else{
            console.log(response.body)
            bot.sendMessage(id,response.body, {parse_mode:"HTML"})
        }   
    });

}

async function uptCarro(indice,id,tipo,chat){
    var tipos = ['add','remove']
    var txt = ['agregado','removido']
    var monitor = monitores[indice-1]
    var options = {
        'method': 'GET',
        'url': 'http://localhost:'+monitor+'/'+tipos[tipo]+'/'+id,
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error){
            var msje = "Error con el monitor: "+(indice)+" | Puerto: "+monitor;
            bot.sendMessage(chat,msje)

        }else{
            console.log(response.body)
            wsp("Sku: "+id+" "+txt[tipo]+" al monitor "+monitor);
        }   
    });

}


function crearURL(sku,cantidad){
    return "https://www.nike.cl/checkout/cart/add?sku="+sku+"&qty="+cantidad+"&seller=1&redirect=true&sc=1";
}function crearURLf(sku,cantidad){
    return "https://www.nike.cl/checkout/cart/add?sku="+sku+"&qty="+cantidad+"&seller=1&redirect=false&sc=1";
}
function crearURL2(sku,cantidad){
    var a = "http://localhost:3000/abrir/"+sku;
    console.log(a)
    return a;
}

async function apagarCarro(indice){

    var monitor = monitores[indice-1]
    console.log("MONITOR A APAGAR: "+monitor)
    var options = {
        'method': 'GET',
        'url': 'http://localhost:'+monitor+'/apagar',
        'headers': {
        }
    };
    request(options, function (error, response) {
        if (error){
            var msje = "Error con el monitor: "+(indice)+" | Puerto: "+monitor;
            bot.sendMessage(users[0],msje)

        } 
    });

}


bot.onText(/\/estados/, (msg, match) => {
    getEstados()
})
bot.onText(/\/todos/, (msg, match) => {
    const chatId = msg.chat.id;
    getCarros(chatId)
})
bot.onText(/\/toditos/, (msg, match) => {
    wsp(carrostxt)
})
bot.onText(/\/carro(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    getCarro(busqueda,chatId)
});

bot.onText(/\/add(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    var weas = busqueda.split(" ");
    if(weas.length==2){
        if(isNumeric(weas[0]) && isNumeric(weas[1])){
            var monitor = weas[0];
            var sku = weas[1];
            uptCarro(monitor,sku,0);
        }else{
            wsp("FORMATO INCORRECTO")
        }
    }else{
        wsp("FORMATO INCORRECTO")
    }
});



async function añadirtxt(str,nombre_archivo){
    fs.appendFile("monitores.txt", str, (err) => {
    if (err) throw err;
        console.log("Completed!");
    });

}
bot.onText(/\/agregarmonitor(.*)/, async (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    await añadirtxt("\n"+busqueda)
    cantidad +=1;
    monitores.push(puerto+cantidad)
    var comando = "node Monitor.js "+cantidad+" "+puerto;
    var command = "gnome-terminal ";
    for(var i = 1 ; i < 2 ; i++){
        command += `--tab --title="Bot `+i+`" --command="bash -c 'cd ~/Escritorio/Monitor; `+comando+`; $SHELL'" `
    }
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
    LeerArchivo()
});


bot.onText(/\/apagar(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    if(isNumeric(busqueda)){
        var monitor = busqueda;
        apagarCarro(monitor);
    }else{
        wsp("FORMATO INCORRECTO")
    }
});

bot.onText(/\/remove(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    var weas = busqueda.split(" ");
    if(weas.length==2){
        if(isNumeric(weas[0]) && isNumeric(weas[1])){
            var monitor = weas[0];
            var sku = weas[1];
            wsp("Solicitud de remover Sku ");
            uptCarro(monitor,sku,1);
        }else{
            wsp("FORMATO INCORRECTO")
        }
    }else{
        wsp("FORMATO INCORRECTO")
    }
});


bot.onText(/\/apuesta(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    var weas = busqueda.split(" ");
    if(weas.length==2){
        wsp(weas[Math.floor(Math.random()*weas.length)])
    }else{
        wsp("FORMATO INCORRECTO")
    }
});
function getRandomInt(min, max) { 
    return Math.floor(Math.random() * (max - min)) + min; 
  }
bot.onText(/\/monto(.*)/, (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length);
    var weas = busqueda.split(" ");
    if(weas.length==2){
        wsp(getRandomInt(parseInt(weas[0]), parseInt(weas[1]) ))
    }else{
        wsp("FORMATO INCORRECTO")
    }
});

bot.onText(/\/colo colo/, (msg, match) => {
    wsp("ALL IN COLO COLO")
    
    wspb("Fotos/coloam.jpeg")
})
async function wspa(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendAnimation(users[i],msj)
    }
}async function wspb(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendPhoto(users[i],msj)
    }
}async function wspc(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendMessage(users[i],msj,{disable_web_page_preview:true,parse_mode:"HTML"})
    }
}
async function wspv(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendVideo(users[i],msj)
    }
}
var bn = ["https://todoimagenesde.com/wp-content/uploads/2021/03/BuenasNoches17.gif","https://c.tenor.com/HNL9Pkh4D9MAAAAd/buenas-noches-jesus.gif","https://i.pinimg.com/originals/67/54/2f/67542f5185f9847a75e398f5f92759ed.gif","https://img1.picmix.com/output/pic/normal/8/6/2/4/4784268_0cb02.gif","https://img1.picmix.com/output/pic/normal/0/3/1/8/6868130_4aa3a.gif",]
bot.onText(/\/buenas noches/, (msg, match) => {
    wspa(bn[Math.floor(Math.random()*bn.length)])
})
bot.onText(/\/siu/, (msg, match) => {
    wspa("https://media3.giphy.com/media/hryis7A55UXZNCUTNA/giphy.gif")
})
bot.onText(/\/U/, (msg, match) => {
    wspb("https://i.ytimg.com/vi/2Y7FImfvcW4/maxresdefault.jpg")
})
bot.onText(/\/chile/, (msg, match) => {
    wsp("ALL IN CHILE !!!!")
})
bot.onText(/\/ayuda/, (msg, match) => {
    wspb("https://i.pinimg.com/564x/3b/9f/03/3b9f0327f26307fa3aa2e0868e9399fc.jpg")
})
bot.onText(/\/aspiradora/, (msg, match) => {
    wspb("https://ripleycl.imgix.net/http%3A%2F%2Fs3.amazonaws.com%2Fimagenes-sellers-mercado-ripley%2F2020%2F11%2F18153353%2FURSASPIRTRAPE0_001.jpg?w=750&h=555&ch=Width&auto=format&cs=strip&bg=FFFFFF&q=60&trimcolor=FFFFFF&trim=color&fit=fillmax&ixlib=js-1.1.0&s=5e209857e6f4f56bb2bd8eabd684e96a")

    wsp("https://simple.ripley.cl/aspiradora-trapeadora-robot-ursus-trotter-filtro-hepa-mpm00015367154?gclid=Cj0KCQjw3IqSBhCoARIsAMBkTb00HrRJ2QHL283TITG3pX4sBjWiEfHaA6YgIMIb_g7Udu78wZ5U-xQaAp7ZEALw_wcB&color_80=negro&s=mdco")
})
bot.onText(/\/silla gamer/, (msg, match) => {
    wspb('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9h4985bDarNdFuGWsuWeb0xVodAySFcGGbwDDCrqVvNtEr8EhTjBKJerY6osg6da8lgI&usqp=CAU')
})
bot.onText(/\/travis/, (msg, match) => {
    wspb('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9h4985bDarNdFuGWsuWeb0xVodAySFcGGbwDDCrqVvNtEr8EhTjBKJerY6osg6da8lgI&usqp=CAU')
    wspb('Fotos/sad.jpg')
    wspb('Fotos/sad2.jpg')
    wspb('Fotos/sad3.jpg')
    wspb('Fotos/sad4.jpg')
    wspb('Fotos/sad5.jpg')
    wspb('Fotos/sad6.jpg')
})

bot.onText(/\/recuerdalo/, (msg, match) => {
    wspb('Fotos/doit.png')
})

bot.onText(/\/amague/, (msg, match) => {
    const nombre = "Nike Air Max 1 / Cj Talla: 5 - Color: Amarillo";
    const sku = 30701;
    const monitor = 1;
    var msj = 'Monitor '+monitor+' | Producto: <b>'+nombre+'</b> | SKU: '+sku+' | <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><b>Comprar</b></a> | <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"><b>BAT</b></a>  \n'
    wspc(msj)
})
bot.onText(/\/finiquito/, (msg, match) => {
    var posibles = ["Diegordito","Katalina","Pancho"];
    wsp(posibles[Math.floor(Math.random()*posibles.length)]+" ha sido despedido :(")
})

const app = express();
app.set("port", process.env.PORT || puerto);
app.get("/", (req, res) => {
    res.send('Hello World');
});
app.get("/send/:monitor/:nombre/:sku", (req, res) => {
    const nombre = req.params.nombre;
    const sku = req.params.sku;
    const monitor = req.params.monitor;
    var msj = 'Monitor '+monitor+' | Producto: <b>'+nombre+'</b> | SKU: '+sku+' \n\n <a href="'+crearURL(sku,1)+'"><b>COMPRAR</b></a>   |   <a href="https://blank.page/?sku='+sku+'"><b>COMPRAR SNKRS</b> </a>\n'
    wsp(msj)
    res.send("Enviado !")
});
app.get("/vpn/:msj", (req, res) => {
    var msj = req.params.msj;
    msj = "VPN ha cambiado ! | Conectado a : "+msj;
    wsp(msj)
    res.send("Enviado !")
});
app.get("/send2/:monitor/:msj", (req, res) => {
    var msj = req.params.msj;
    var monitor = req.params.monitor;
    var mensaje = "Monitor "+monitor+" dice: "+msj
    wsp(mensaje)
    res.send("Enviado !")
});



app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);


app.get("/apagar", (req, res) => {
    process.exit(0)
});

app.use(express.static('public'));
