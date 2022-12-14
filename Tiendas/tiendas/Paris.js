const jsdom = require('jsdom');
const { JSDOM } = jsdom;
var mysql = require('mysql');
const utils = require("../utils/utils.js");

var store = "Paris";
var options = utils.getOptions(); // bdd
var con = mysql.createConnection({
    host: options["host"],
    user: options["user"],
    password: options["password"],
    database: options["database"],
    port:options["port"]
  });
async function main(){
    var a = 0;
    while(a == 0){
        await utils.Monitoriar(con,store,getBySubCategory);
    }
}
main()



async function getBySubCategory(category,category_path,limite){

    console.log('\nSe ha iniciado la categoria '+category+ ' | '+category_path+'');
    var path = 'https://www.paris.cl';

    var category_url = null;
    var response = null;
    var dom = null;
    var items = null;
    var item = null;        
    var productodiv = null;     
    var picture_urls = null;        
    var key = null;     
    var url = null;     
    var seller = null;     
    var name = null;     
    var name = null;     
    var price_tags = null;  
    var offer_price = null;  
    var normal_price = null;      
    var best_price = null;     
    var Producto = null  
    var Productos = [] 
    var page = 0;
    while( page <= limite){
        if(page == limite){
            console.log("Se ha alcanzado el limite");
            //await utils.almacenar(Productos)
            return Productos;
        }    

        // Request para obtener datos
        category_url = path+"/"+category_path+'/?sz=60&start='+(page * 40);
        response = await utils.getBody(category_url);
        dom = new JSDOM(response);
        items = dom.window.document.getElementById('search-result-items'); // Div con los N productos

        if(page == 0 && (items == undefined || items.childElementCount == 0)){
            console.log('Error #1 con la categoria '+category+ ' | '+ category_url);
            return -1
        }
        else if(page != 0 && (items.childElementCount == 0)){
            page = 0;
            return Productos;
        }
        else if(page != 0 && (items == undefined)){
            console.log('Error #2 con la categoria '+category+ ' | '+ category_url);
            return -2
        }else{
            for(var i = 0 ; i < items.childElementCount ; i++){

                // Contenedores
                item = items.children[i];
                productodiv = item.getElementsByClassName('product-tile ')[0];
                key = productodiv.id;

                if( Productos.includes(key)){
                    continue;
                }
                // Atributos - Generales
                picture_urls = productodiv.getElementsByClassName('img-prod')[0].getAttribute('data-src').split("?sw=")[0];
                url = item.getElementsByTagName('a')[0].href;
                if(!item.getElementsByTagName('a')[0].href.includes('https://www.paris.cl')){
                    url = path+item.getElementsByTagName('a')[0].href;
                }
                name = item.getElementsByClassName('ellipsis_text')[0].textContent.replace('"','');
                seller = item.getElementsByClassName('brand-product-plp')[0].textContent;

                // Atributos - Precios
                price_tags = item.getElementsByClassName('price__text');
                if(price_tags.length == 2){
                    offer_price = parseFloat(price_tags[0].textContent.trim().replace('$','').split('.').join(''));
                    normal_price = parseFloat(price_tags[1].textContent.trim().replace('$','').split('.').join(''));
                    var price_tags2 = item.getElementsByClassName('price__text-sm');
                    if(price_tags2.length != 0){
                        normal_price = parseFloat(price_tags2[0].textContent.trim().replace('$','').split('.').join(''));
                    }
                }
                else if(price_tags.length == 1){
                    offer_price = parseFloat(price_tags[0].textContent.trim().replace('$','').split('.').join(''));
                    normal_price = parseFloat(price_tags[0].textContent.trim().replace('$','').split('.').join(''));

                    var price_tags2 = item.getElementsByClassName('price__text-sm');
                    if(price_tags2.length != 0){
                        normal_price = parseFloat(price_tags2[0].textContent.trim().replace('$','').split('.').join(''));
                    }
                }else{
                    console.log("Check tipo 1 "+url);
                    continue;
                }

                best_price = offer_price;
                if(offer_price > normal_price){
                    best_price = normal_price;
                }

                if(best_price=='N/A' || isNaN(best_price)){
                    console.log("Check tipo 2 "+url);
                    continue;
                }
                else if(normal_price=='N/A' || isNaN(normal_price)){
                    normal_price = best_price;
                }

                // Arreglo Producto
                Producto = [store,category,key,url,picture_urls,category_url,seller,name,normal_price,offer_price,best_price];
                Productos.push(Producto);
            }
            console.log('Items cargado de la categoria '+category+' | '+category_path+'  Pagina:'+page+' , Cantidad:'+  items.childElementCount+ ' , Cargados:'+Productos.length);
            page+=1;
        }

    }
}

