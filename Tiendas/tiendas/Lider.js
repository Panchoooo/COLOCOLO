const utils = require("../utils/utils.js");
var mysql = require('mysql');

var store = "Lider";
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



//getBySubCategory("Decohogar","Decohogar/Decoración/Alfombras",1);
async function getBySubCategory(category,category_path,limite){

    console.log('\nSe ha iniciado la categoria '+category+ ' | '+category_path+'');
    var path = 'https://apps.lider.cl/catalogo/bff/category';

    var url = null;     
    var price_tags = null;  
    var offer_price = null;  
    var normal_price = null;      
    var best_price = null;     
    var Producto = null  
    var Productos = [] 
    var page = 0;
    var sorters = [
        '',
        'price_asc',
        'price_desc',
        'discount_asc',
        'discount_desc',
    ]
    for( var s = 0 ; s<sorters.length; s++){

        var data = JSON.stringify({
            "categories": category_path,
            "page": 1,
            "facets": [],
            "sortBy": sorters[s],
            "hitsPerPage": 1000
          })
    
        var res = await utils.requestUtils(path,data,"POST");
        var data = JSON.parse(res);
        if(data['products'] == null || data['products'] == undefined ){
            console.log("ERROR")
        }
        var productos = data['products'];
        for(var p = 0; p < data['products'].length || p<2; p++){
            if(Productos.includes(productos[p]['sku'])){
                continue;
            }
            var url = "https://www.lider.cl/catalogo/product/sku/"+productos[p]['sku'];

            var price_container = productos[p]['price'];
            var normal_price = price_container['BasePriceReference']; 
            var offer_price = 0;
            if(price_container['BasePriceTLMC'] != 0){
                offer_price = price_container['BasePriceTLMC'];
            }
            else if(price_container['BasePriceSales'] != 0){
                offer_price = price_container['BasePriceSales'];
            }else{
                offer_price = normal_price;
            }
            ;
            var best_price = offer_price;
            if(offer_price>normal_price){
                best_price = normal_price;
            }

            Producto = [store,category,productos[p]['sku'],url,productos[p]['images']['defaultImage'],null,null,productos[p]['displayName'],normal_price,offer_price,best_price];
            
            Productos.push(Producto);
        }
        
        console.log('Items cargado de la categoria '+category+' | '+category_path+'  Sort:'+sorters[s]+' , Cantidad:'+  productos.length);
    }
    
    return Productos;
}

