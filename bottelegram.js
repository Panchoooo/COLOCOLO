const puppeteer = require('puppeteer');
const express = require("express");
var request = require('request');
const { exec } = require("child_process");
var mysql = require('mysql');
const fs = require('fs');
const TelegramBot = require('node-telegram-bot-api')

let users = ['-1001784145985'];
var token = "5703951768:AAEaYU2Jg3R76J1vWr2Us4U1a9BtsL6QOdc" ; 
var puerto = 5000

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "tiendas"
  });

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
function select(id){
    try {
        var qry = 'SELECT * from tiendas WHERE id = '+id
        console.log(qry)
        con.query(qry, function(err,result) {
            if(err) throw err

            try {
                for(var i = 0; i < result.length ; i++){
                    var name = result[i].name
                    var store = result[i].store
                    var category = result[i].category
                    var url = result[i].url
                    var normal_price = result[i].normal_price
                    var offer_price = result[i].offer_price
                    var picture_urls = result[i].picture_urls
                    console.log(result[i])
                    var body = "Producto: "+name+"\
                    \n<b>Precio original: "+normal_price+" - Precio Oferta: "+offer_price+" </b>\
                    \nLink: "+url
                    const opts = {
                        'caption': body,
                        'parse_mode': 'HTML'
                    };
                      
                    bot.sendPhoto(users[0], picture_urls , opts);   
                }
                return result; 
            } catch (error) {
                return -1
            }

        });
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
app.get("/send/:id", (req, res) => {
    const id = req.params.id;
    upd(id)
    select(id)
    res.send("Enviado !")
});

app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);


app.get("/apagar", (req, res) => {
    process.exit(0)
});

app.use(express.static('public'));
