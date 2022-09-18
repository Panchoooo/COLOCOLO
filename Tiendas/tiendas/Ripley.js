const jsdom = require('jsdom');
var mysql = require('mysql');
const { JSDOM } = jsdom;
const utils = require("../utils/utils.js");
var store = "Ripley";
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
    var path = 'https://simple.ripley.cl';

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
            break;
        }    

        // Request para obtener datos
        category_url = path+"/"+category_path+'/?page='+(page );
        console.log(category_url);
        response = await utils.getBody(category_url);
        dom = new JSDOM(response);
        items = dom.window.document.getElementsByClassName('catalog-container')[0]; // Div con los N productos
        if(items != undefined && items.childElementCount>0){
            for(var i = 0 ; i < items.childElementCount; i++){
                var item = items.children[i].children[0];
                
                seller = "";
                if(item.getElementsByClassName("catalog-product-name-container").length > 0){
                    seller = item.getElementsByClassName("catalog-product-name-container")[0].textContent;
                }                
                name = item.getElementsByClassName("catalog-product-details__name")[0].textContent;
                price_tags = item.getElementsByClassName("catalog-prices__list")[0];
                if(price_tags.childElementCount == 1){
                    normal_price = utils.NumberFormat(price_tags.children[0].textContent);
                    offer_price = normal_price;
                }
                if(price_tags.childElementCount == 2){
                    normal_price = utils.NumberFormat(price_tags.children[0].textContent);
                    offer_price = utils.NumberFormat(price_tags.children[1].textContent);
                }
                if(price_tags.childElementCount == 3){
                    normal_price = utils.NumberFormat(price_tags.children[0].textContent);
                    offer_price = utils.NumberFormat(price_tags.children[2].textContent);
                }

                best_price = offer_price;
                if(offer_price > normal_price){
                    best_price = normal_price;
                }

                Producto = [store,category,item.id,path+item.href,item.getElementsByClassName("lazyload")[0].getAttribute("data-src"),category_url,seller,name,normal_price,offer_price,best_price];
                console.log(Producto);
            }
        }
        else if(items != undefined && page != 0 &&  items.childElementCount==0){
            break;
        }else{
            console.log("Error con la categoria "+category+" | "+category_path);
            break;
        }

        console.log('Items cargado de la categoria '+category+' | '+category_path+'  Pagina:'+page);
        page+=1;

    }

    return Productos;
}

