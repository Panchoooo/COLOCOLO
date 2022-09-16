const express = require("express");
var mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api')
const delay = ms => new Promise(res => setTimeout(res, ms));

let users = [];
var i = process.argv[2];
var token = null ; 
var puerto = null;
var msj = "" ;
var f = true;
/*
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tiendas"
  });*/
var con = mysql.createConnection({
    host:"db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
    user:"diego",
    password:"AVNS__QSFdINp_Fa9wILf0KO",
    database:"tiendas",
    port:"25060"
});


if( i == 1){
     token = "5703951768:AAEaYU2Jg3R76J1vWr2Us4U1a9BtsL6QOdc" ; 
   // token = '5173216820:AAEjDXKCK3VopsN8YjvujYC_iP_gscs-bDY' 
   
   users = ['-1001672119836'];
   puerto = 5000;

}
if( i == 2){
    token = '5350995896:AAHtDA-l1rBR6GfWxMMUuxrurJuARcqXhUo' ;
  users = ['-1001665102492'];

    puerto = 5001;

}
if( i == 3){
    token = '5175295388:AAGkp3YHnJLW2NZOX2cAudw1qxWNPZHLRRE' ;
  users = ['-1001578014454'];

    puerto = 5002;
    f = false;

}



const formatter = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' });

var mensajes = [];
async function select(){
    try {
        
        var id = ids.shift();

        var qry = "SELECT * from tiendasv2 WHERE keey = ?";
        var result = await fquery(qry,[id]);

        var qry2 = "SELECT * from tiendas_log WHERE keey = ? order by fecha desc";
        var result_log = await fquery(qry2,[id]);


        try {
            var body = "";
            for(var i = 0; i < result.length ; i++){
                var name = result[i].name;
                var store = result[i].store;
                var url = result[i].url;
                var picture_urls = result[i].picture_url;
                var ofertaPrice = result[i].best_price;
                var normalPrice = result[i].normal_price;
                

                var porcentaje = parseInt(100-(ofertaPrice*100/normalPrice));
                //normalPrice = formatter.format(normalPrice).replace(",",".").replace("CLP","$") // “$1,000.00”
                //ofertaPrice = formatter.format(ofertaPrice).replace(",",".").replace("CLP","$") // “$1,000.00”
                ofertaPrice = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(ofertaPrice).split(".")[0].replace(",",".");
                normalPrice = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(normalPrice).split(".")[0].replace(",",".");


                var cat = "";
                if(porcentaje >= 90){
                    cat = "🔥 SuperOferta 🔥";
                }
                else if(porcentaje >= 80){
                    cat = "❗Rango S ❗";
                }
                else if(porcentaje >= 70){
                    cat = "🅰 Rango A 🅰";
                }
                else if(porcentaje >= 60){
                    cat = "🅱 Rango B 🅱";
                }
                else{
                    cat = "😇 Rango C 😇";
                }


            }
            

            var log = "";
            if(result_log.length > 0){
                log = "\n\nHistorial de ofertas ⚖️\n"
                for(var rl = 0; rl < result_log.length ; rl++){
                    var p = new Intl.NumberFormat('en', { style: 'currency', currency: 'USD' }).format(result_log[rl].price).split(".")[0].replace(",",".");
                    var f = new Date(result_log[rl].fecha)
                    date = f.getDate();
                    month = f.getMonth() + 1; // take care of the month's number here ⚠️
                    year = f.getFullYear();
                    if (date < 10) {
                        date = '0' + date;
                    }
                    if (month < 10) {
                    month = '0' + month;
                    }
                    var ft = `${date}/${month}/${year}`
                    log+=ft + " "+p+"\n";
                }
            }


            body = cat+"\n<b>"+store+"</b>\n"+
            name+"\
            \n"+normalPrice+" → <b>"+ofertaPrice+" ( "+porcentaje+"% )</b> \
            \n\n<a href='"+picture_urls+"'><b>👉🏻</b></a> <a href='"+url+"'><b> VER PRODUCTO</b></a>"+log+"\n\n<a href='https://www.google.com/search?q="+name+"'>Google</a> - <a href='https://knasta.cl/results?q="+name+"'>Knasta</a> - <a href='https://www.solotodo.cl/search?search="+name+"'>Solotodo</a>"
            //console.log(body)
            try{
                bot.sendMessage(users[0],body,{disable_web_page_preview:false,parse_mode:"HTML"});
            }
            catch (error) {
                console.log(error);
            }

        } catch (error) {
            console.log(error);
        }

    } catch (error) {
        console.log(error);

    }
}


const bot = new TelegramBot(token, { polling: true });


function isNumeric(n) { 
    return !isNaN(parseFloat(n)) && isFinite(n); 
  }

bot.onText(/\/register/, (msg, match) => {
    const chatId = msg.chat.id;
    console.log(chatId);
    var flag = 0;
    for(var i = 0 ; i< users.length ; i++){
        if(users[i] == chatId){
            bot.sendMessage(chatId, 'Ya estas registrado !.');
            flag = 1;
        }
    }
    if(flag==0){
        users.push(chatId);
        console.log('user registered');
        bot.sendMessage(chatId, 'Done.');
    }   
})

bot.onText(/\/users/, (msg, match) => {
    const chatId = msg.chat.id;
    var msj = "";
    for(var i = 0; i<users.length;i++){
        msj+= users[i]+"\n";
    }

    if(users.length>0){
        bot.sendMessage(chatId,msj);
    }else{
        bot.sendMessage(chatId,"No hay usuarios registrados");
    }
})


async function wsp(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendMessage(users[i],msj, {disable_web_page_preview:true,parse_mode:"HTML"});
    }
}

async function fquery(qry,Producto) {
    try {

        return new Promise(function(resolve, reject) {
            con.query(qry, Producto, function(err,result) {
                if(err){
                    console.log(err)
                    resolve(-1);
                }
                resolve(result);
            }); 
        })
    } catch (error) {
        console.log('Error #3\n'+error);
        return undefined;
    }

}


bot.onText(/\/addcat(.*)/,  (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length).split(" ");
    console.log(busqueda)

    if(busqueda.length==2){
        fquery("INSERT INTO tienda_categorias (store,categoria,activo) values (?,?,?)",[busqueda[0],busqueda[1],1]);
        
        bot.sendMessage(users[0],busqueda[0]+" | Categoria: "+busqueda[1]+" insertada",{disable_web_page_preview:false,parse_mode:"HTML"});
    }else{
        bot.sendMessage(users[0],"Error formato",{disable_web_page_preview:false,parse_mode:"HTML"});

    }
});

bot.onText(/\/delcat(.*)/,  (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length).split(" ");
    console.log(busqueda);

    if(busqueda.length==2){
        fquery("Delete from tienda_categorias where store = ? and categoria = ?",[busqueda[0],busqueda[1],1]);
        bot.sendMessage(users[0],busqueda[0]+" | Categoria: "+busqueda[1]+" eliminada",{disable_web_page_preview:false,parse_mode:"HTML"});
    }else{
        bot.sendMessage(users[0],"Error formato",{disable_web_page_preview:false,parse_mode:"HTML"});

    }
});

bot.onText(/\/delsubcat(.*)/,  (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length).split(" ");
    console.log(busqueda);

    if(busqueda.length==3){
        fquery("Delete from tienda_subcategorias where store = ? and category = ? and subcategory = ?",[busqueda[0],busqueda[1],busqueda[2]]);
        bot.sendMessage(users[0],busqueda[0]+" | Categoria: "+busqueda[1]+" eliminada",{disable_web_page_preview:false,parse_mode:"HTML"});
    }else{
        bot.sendMessage(users[0],"Error formato",{disable_web_page_preview:false,parse_mode:"HTML"});

    }
});

bot.onText(/\/addsubcat(.*)/,  (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length).split(" ");
    console.log(busqueda);

    if(busqueda.length==3){
        fquery("INSERT INTO tienda_subcategorias (store,category,catkey,subcategory) values (?,?,?,?)",[busqueda[0],busqueda[1],busqueda[0]+"-"+busqueda[1],busqueda[2],1]);
        bot.sendMessage(users[0],busqueda[0]+" | Categoria: "+busqueda[1]+" | Subcategoria: "+busqueda[2]+" insertada",{disable_web_page_preview:false,parse_mode:"HTML"});
    }else{
        bot.sendMessage(users[0],"Error formato",{disable_web_page_preview:false,parse_mode:"HTML"});

    }
});

bot.onText(/\/getT(.*)/,  async (msg, match) =>{
    const chatId = msg.chat.id;
	var busqueda = match[1].slice(1,match[1].length).split(" ");
    console.log(busqueda);

    if(busqueda.length==1){
        var categories = await fquery("SELECT categoria,activo from tienda_categorias where store = ?",[busqueda[0]]);
        var body = "Información de la tienda "+busqueda[0]+"\n\n";

        for (var c = 0 ; c<categories.length; c++){
            var categoria = categories[c].categoria;
            body+="Categoria: "+categoria+" | Activo : "+categories[c].activo+"\n";
            var category_paths = await fquery('SELECT subcategory from tienda_subcategorias WHERE store = ? and category = ?',[busqueda[0],categoria]);
            category_paths.forEach(subcategoria => {
                body+="- SubCategoria: "+subcategoria.subcategory+"\n";
            });
            body+="\n"
        }
        bot.sendMessage(users[0],body,{disable_web_page_preview:false,parse_mode:"HTML"});

    }else{
        bot.sendMessage(users[0],"Error formato",{disable_web_page_preview:false,parse_mode:"HTML"});

    }
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
            wsp("FORMATO INCORRECTO");
        }
    }else{
        wsp("FORMATO INCORRECTO");
    }
});


async function wspa(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendAnimation(users[i],msj);
    }
}async function wspb(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendPhoto(users[i],msj);
    }
}async function wspc(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendMessage(users[i],msj,{disable_web_page_preview:true,parse_mode:"HTML"});
    }
}
async function wspv(msj){
    for(var i = 0 ; i < users.length ; i++){
        bot.sendVideo(users[i],msj)
    }
}


const app = express();
app.set("port", process.env.PORT || puerto);
app.get("/", (req, res) => {
    res.send('Hello World');
});


var ids = [];
app.get("/send/:id", (req, res) => {
    const id = req.params.id;
    ids.push(id);
    res.send("Enviado !");
});


app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);


app.get("/apagar", (req, res) => {
    process.exit(0);
});

app.use(express.static('public'));

if(f){
    check_ids();
}


async function check_ids(){
    console.log("Enviar mensajes");

    while(true){
        try {
            if(ids.length>0){
                console.log("mensajes encontrados "+ids.length);
                try {
                    await select();
                    await delay(3000);
                } catch (error) {
                    console.log(error);
                    await delay(5000);                
                }
            }else{
                console.log("mensajes no encontrados "+ids.length);
                await delay(5000);
            }     
        } catch (error) {
            await delay(5000);
        }


    }

}
