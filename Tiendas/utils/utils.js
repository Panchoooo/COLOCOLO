var request = require('request')
const fs = require('fs');
var mysql = require('mysql');
const delay = ms => new Promise(res => setTimeout(res, ms));

// Obtiene info del archivo parametros.txt 
function getOptions(){
    options = {}
    const allFileContents = fs.readFileSync('./Configuracion/parametros.txt', 'utf-8');
    allFileContents.split(/\r?\n/).forEach(line =>  {
        var opts = line.split("=")
        if(opts.length == 2){
        options[opts[0]] = opts[1]
        }
    });
    return options;
}

// Handler para requests
async function getBody(url) {
    try {
        const options = {
            url: url,
            method: 'GET',
        };
        return new Promise(function(resolve, reject) {
            request.get(options, function(err, resp, body) {
            if (err) {
                console.log('Error #5\n'+err);
                reject(err);
            } else {
                resolve(body);
            }
            })
        })
    } catch (error) {
        console.log('Error #3\n'+error)
        return undefined;
    }

}
  
// Handler para querys
async function fquery(con,qry,Producto) {
    try {
        return new Promise(function(resolve, reject) {
            con.query(qry, Producto, function(err,result) {
                if(err){
                    console.log(err);
                    console.log(Producto);

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


// Funcion que recibe una conexion y productos con sus parametros para ser almacenados o actualizados.
async function almacenar(con,Productos){
    console.log("Cantidad de productos a procesar :"+ Productos.length);
    for(var p = 0 ; p < Productos.length ; p++){
        var Producto = Productos[p];
        try {
            rs = await fquery(con,'SELECT best_price from tiendasv2 where store = ? and keey = ?',[Producto[0],Producto[2]]);
            if(rs.length>0  && rs[0].best_price != Producto[10] ){
                //console.log("Actualizacion de Producto "+Producto[2])
                ra = await fquery(con,'INSERT INTO tiendas_log (store,keey,price,fecha) VALUES (?,?,?,NOW())  ',[Producto[0],Producto[2],rs[0].best_price]);
                ra = await fquery(con,'UPDATE tiendasv2 SET best_price = ?,normal_price = ?, last_date = NOW() WHERE store = ? and keey = ?  ',[Producto[10],Producto[8],Producto[0],Producto[2]]);
                var dif = 100-Producto[10]*100/rs[0].best_price;
                var dif2 = 100-Producto[10]*100/Producto[8];
                if( (rs[0].best_price > Producto[10] && (dif>30)) || ( Producto[10] < Producto[8] && (dif2>30) ) ){
                    getBody("http://localhost:5000/send/"+Producto[2]);
                    if(dif > 58 || dif2 > 58){
                        getBody("http://localhost:5001/send/"+Producto[2]);
                    }
                }
            }
            else if(rs.length==0){
                //console.log("Producto nuevo "+Producto[2])
                var dif = 100-Producto[10]*100/Producto[8];
                ra = await fquery(con,'INSERT INTO tiendasv2 (store,category,keey,url,picture_url,category_url,seller,name,normal_price,offer_price,best_price,fecha) VALUES (?,?,?,?,?,?,?,?,?,?,?,NOW())  ',Productos[p]);
                if(Producto[10] < Producto[8] && dif>30){
                    getBody("http://localhost:5000/send/"+Producto[2]);
                    if(dif > 58){
                        getBody("http://localhost:5001/send/"+Producto[2]);
                    }
                }
            }
            //console.log(r)
        } catch (error) {
            console.log('Error #4\n'+error);
        }
    }
}


// Funcion que genera conexion a bdd y obtiene caracteristicas de la tienda 
// in: store | out:con,limite,categories
async function getConfigTienda(store){
    var options = getOptions(); // bdd
    var con = mysql.createConnection({
        host: options["host"],
        user: options["user"],
        password: options["password"],
        database: options["database"],
        port:options["port"]
      });

    var params = await fquery(con,'SELECT limite from parametros where store = ?',[store]);
    var limite = params[0].limite;

    categories = await fquery(con,'SELECT categoria from tienda_categorias WHERE store = ? and activo = 1 ORDER BY id desc',[store]);
    var total = 0;
    var categoriesdict = {}
    if(categories.length > 0){
        for (var c = 0 ; c<categories.length; c++){
            total = 0;
            var categoria = categories[c].categoria;
            category_paths = await fquery(con,'SELECT subcategory from tienda_subcategorias WHERE store = ? and category = ?',[store,categoria]);
            var asignadas = [];
            category_paths.forEach(subcategoria => {
                asignadas.push(subcategoria.subcategory);
            });
            categoriesdict[categoria]=asignadas;
        };
    }
    return [con,limite,categoriesdict];

}

async function getByCategory(con,categoria,asignada,func,limite){
    var total = 0;
    for(var i = 0 ; i<asignada.length; i++){
        p = await func(categoria,asignada[i],limite);
        if(p!=1 && p!=2){
            await almacenar(con,p);
            total += p.length;
        }
    };
    return total
}

async function Monitoriar (store,func){
    var config = await getConfigTienda(store);
    var con = config[0];
    var limite = config[1];
    var categories = config[2];
   
    var totalg = 0;
    var totalc = 0;
    for (const [categoria, asignadas] of Object.entries(categories)) {
        console.log(categoria, asignadas);
        totalc = await getByCategory(con,categoria,asignadas,func,limite);
        totalg += totalc;
        await fquery(con,'UPDATE tienda_categorias SET last_date = NOW(), cantidad = ? WHERE store = ? AND categoria = ? ',[totalc,store,categoria]);
    }

    console.log(totalg)
    process.exit(0);
    return;
}


module.exports = {delay, getBody, getOptions, fquery, almacenar, getConfigTienda, getByCategory,Monitoriar};