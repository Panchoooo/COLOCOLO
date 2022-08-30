const express = require("express");
var mysql = require('mysql');
const TelegramBot = require('node-telegram-bot-api')
const delay = ms => new Promise(res => setTimeout(res, ms));

let users = ['-1001672119836'];
var token = "5703951768:AAEaYU2Jg3R76J1vWr2Us4U1a9BtsL6QOdc" ; 
var puerto = 5000
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
})


function upd(id){
    try 
    {
        con.query('UPDATE tiendas SET avisado = 1, fecha = now()  WHERE id ='+id, function(err,result) {
            if(err) throw err
        });
    } catch (error) {
        console.log(error)
    }
}






var mensajes = []
function select(id){
    try {
        var qry = "SELECT * from tiendas WHERE keey = '"+id+"'"
        console.log(qry)
        con.query(qry, function(err,result) {
            if(err) throw err

            try {
                var body = ""
                for(var i = 0; i < result.length ; i++){
                    var name = result[i].name
                    var store = result[i].store
                    var url = result[i].url
                    var picture_urls = result[i].picture_urls

                    var ofertaPrice = result[i].offer_price
                    var normalPrice = result[i].normal_price

                    const formatter = new Intl.NumberFormat('cl-CL', {
                        style: 'currency',
                        currency: 'CLP'
                      })

                    var porcentaje = 100-(ofertaPrice*100/normalPrice)
                    normalPrice = formatter.format(normalPrice) // “$1,000.00”
                    ofertaPrice = formatter.format(ofertaPrice) // “$1,000.00”
                    cat = ""
                    if(porcentaje >= 90){
                        cat = "🔥 SuperOferta 🔥"
                    }
                    else if(porcentaje >= 80){
                        cat = "❗Rango S ❗"
                    }
                    else if(porcentaje >= 70){
                        cat = "🅰 Rango A 🅰"
                    }
                    else if(porcentaje >= 60){
                        cat = "🅱 Rango B 🅱"
                    }
                    else{
                        cat = "😇 Rango C 😇"
                    }


                }
                body = cat+"\n"+store+"\n"+
                name+"\
                \nPrecio: "+normalPrice+" - Oferta: "+ofertaPrice+" \
                \n\n<a href='"+url+"'><b>PRODUCTO</b></a> - <a href='"+url+"'><b>CATEGORIA</b></a>\n\
                \n<a href='https://www.google.com/search?q="+name+"'>Google</a> - <a href='https://knasta.cl/results?q="+name+"'>Knasta</a> - <a href='https://www.solotodo.cl/search?search="+name+"'>Solotodo</a>"
                console.log(body)
                try{
                    bot.sendMessage(users[0],body,{disable_web_page_preview:false,parse_mode:"HTML"})
                }
                catch (error) {
                    console.log(error)
                }
            } catch (error) {
            }

        });

        con.close()
    } catch (error) {
        console.log(error)
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


const app = express();
app.set("port", process.env.PORT || puerto);
app.get("/", (req, res) => {
    res.send('Hello World');
});


var ids = []
app.get("/send/:id", (req, res) => {
    const id = req.params.id;
    ids.push(id)
    res.send("Enviado !")
});

app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);


app.get("/apagar", (req, res) => {
    process.exit(0)
});

app.use(express.static('public'));

async function check_mensajes(){

    console.log("Enviar mensajes")
    while(true){
        try {
            if(mensajes.length>0){
                console.log("mensajes encontrados "+mensajes.length)
                try {
                    var msj = mensajes.shift()
                    bot.sendMessage(users[0],msj,{disable_web_page_preview:false,parse_mode:"HTML"})
                } catch (error) {
                    console.log(error)
                    await delay(5000)                    
                }
            }else{
                await delay(5000)
            }     
        } catch (error) {
            
        }


    }

}

check_ids()

async function check_ids(){
    console.log("Enviar mensajes")
    while(true){
        try {
            if(ids.length>0){
                console.log("mensajes encontrados "+ids.length)
                try {
                    var id = ids.shift()
                    select(id)
                    await delay(2000)
                } catch (error) {
                    console.log(error)
                    await delay(5000)                    
                }
            }else{
                console.log("mensajes no encontrados "+ids.length)
                await delay(5000)
            }     
        } catch (error) {
            
        }


    }

}
