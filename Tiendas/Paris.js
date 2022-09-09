var request = require("request")
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var category_paths = [
    ["electro/television", ["Television"], "Electro > Televisión", 1],
    ["electro/television/smart-tv", ["Television"],
     "Electro > Televisión > Smart TV", 1],
    ["electro/television/televisores-led", ["Television"],
     "Electro > Televisión > Televisores LED", 1],
    ["television/televisores-oled-qled", ["Television"],
     "Electro > Televisión > Oled y Qled", 1],
    ["electro/television/soundbar-home-theater", ["StereoSystem"],
     "Electro > Televisión > Soundbar y Home Theater", 1],
    ["electro/audio", ["StereoSystem", "Headphones"],
     "Electro > Audio", 0],
    ["electro/audio/parlantes-bluetooth-portables", ["StereoSystem"],
     "Electro > Audio > Parlantes Bluetooth y Portables", 1],
    ["electro/audio/micro-minicomponentes", ["StereoSystem"],
     "Electro > Audio > Micro y Minicomponentes", 1],
    ["electro/audio/audifonos", ["Headphones"],
     "Electro > Audio > Audífonos", 1],
    ["electro/audio/audifonos-inalambricos", ["Headphones"],
     "Electro > Audio > Audífonos Inalámbricos", 1],
    ["electro/audio-hifi", ["Headphones", "StereoSystem"],
     "Electro > HiFi", 0],
    ["electro/audio-hifi/audifonos", ["Headphones"],
     "Electro > HiFi > Audifonos HiFi", 1],
     ["electro/audio-hifi/home-theater", ["StereoSystem"],
      "Electro > HiFi > Home Cinema", 1],
    ["electro/audio-hifi/audio", ["StereoSystem"],
     "Electro > HiFi > Audio HiFi", 1],
    ["electro/audio-hifi/parlantes", ["StereoSystem"],
     "Electro > HiFi > Parlantes HIFI", 1],
    ["electro/audio-hifi/", ["StereoSystem"],
     "Electro > HiFi > Combos HIFI", 1],
    ["electro/elige-tu-pulgada", ["Television"],
     "Electro > Elige tu pulgada", 1],
    ["tecnologia/computadores", ["Notebook", "Tablet", "AllInOne"],
     "Tecno > Computadores", 0.5],
    ["tecnologia/computadores/notebooks", ["Notebook"],
     "Tecno > Computadores > Notebooks", 1],
    ["tecnologia/computadores/pc-gamer", ["Notebook"],
     "Tecno > Computadores > PC Gamers", 1],
    ["tecnologia/computadores/desktop-all-in-one", ["AllInOne"],
     "Tecno > Computadores > Desktop y All InOne", 1],
    ["tecnologia/computadores/ipad-tablet", ["Tablet"],
     "Tecno > Computadores > iPad y Tablet", 1],
     ["tecnologia/celulares", ["Cell", "Wearables"],
      "Tecno > Celulares", 0],
    ["tecnologia/celulares/smartphones", ["Cell"],
     "Tecno > Celulares > Smartphones", 1],
    ["tecnologia/celulares/basicos", ["Cell"],
     "Tecno > Celulares > Básicos", 1],
    ["tecnologia/wearables/smartwatches", ["Wearable"],
     "Tecno > Wearables > Smartwatches", 1],
    ["tecnologia/wearables/smartband", ["Wearable"],
     "Tecno > Wearables > Smartband", 1],
    ["tecnologia/gamers",
     ["Notebook", "VideoGameConsole", "Keyboard", "Headphones"],
     "Tecno > Gamers", 0.5],
    ["tecnologia/gamer/teclados", ["Keyboard"],
     "Tecno > Gamers > Teclados y Mouse", 1],
    ["tecnologia/gamer/headset", ["Headphones"],
     "Tecno > Gamers > Headset", 1],
    ["tecnologia/consolas-videojuegos", ["VideoGameConsole"],
     "Tecno > Consolas VideoJuegos", 0],
    ["tecnologia/consolas-videojuegos/playstation",
     ["VideoGameConsole"],
     "Tecno > Consolas VideoJuegos > Consolas PlayStation", 1],
    ["tecnologia/consolas-videojuegos/nintendo",
     ["VideoGameConsole"],
     "Tecno > Consolas VideoJuegos > Consolas Nintendo", 1],
    ["tecnologia/impresoras/laser", ["Printer"],
     "Tecno > Impresoras > Impresión Láser", 1],
    ["tecnologia/impresoras/tinta", ["Printer"],
     "Tecno > Impresoras > Impresión de Tinta", 1],
    ["tecnologia/accesorios-fotografia",
     ["MemoryCard"], "Tecno > Accesorios Fotografía", 0],
    ["tecnologia/accesorios-fotografia/tarjetas-memoria",
     ["MemoryCard"],
     "Tecno > Accesorios Fotografía > Tarjetas de Memoria", 1],
    ["tecnologia/accesorios-computacion/monitor-gamer", ["Monitor"],
     "Tecno > Accesorios Computación > Monitores Gamer", 1],
    ["tecnologia/accesorios-computacion/disco-duro",
     ["ExternalStorageDrive"],
     "Tecno > Accesorios Computación > Discos Duros", 1],
    ["tecnologia/accesorios-computacion/proyectores", ["Projector"],
     "Tecno > Accesorios Computación > Proyectores", 1],
    ["tecnologia/accesorios-computacion/mouse-teclados", ["Mouse"],
     "Tecno > Accesorios Computación > Mouse y Teclados", 1],
    ["tecnologia/accesorios-computacion/pendrives", ["UsbFlashDrive"],
     "Tecno > Accesorios Computación > Pendrives", 1],
    ["linea-blanca/refrigeracion", ["Refrigerator"],
     "Línea Blanca > Refrigeración", 1],
    ["linea-blanca/refrigeracion/refrigeradores/", ["Refrigerator"],
     "Línea Blanca > Refrigeración > Refrigeradores", 1],
    ["linea-blanca/refrigeracion/refrigeradores/no-frost/",
     ["Refrigerator"],
     "Línea Blanca > Refrigeración > No Frost", 1],
    ["linea-blanca/refrigeracion/refrigeradores/refrigerador-top-mount/",     ["Refrigerator"],
     "Línea Blanca > Refrigeración > Top Mount", 1],
    ["linea-blanca/refrigeracion/refrigeradores/refrigerador-bottom-freezer/",
     ["Refrigerator"],
     "Línea Blanca > Refrigeración > Bottom Freezer", 1],
    ["linea-blanca/refrigeracion/refrigeradores/refrigerador-side-by-side",
     ["Refrigerator"],
     "Línea Blanca > Refrigeración > Side by Side", 1],
     ["linea-blanca/refrigeracion/frio-directo", ["Refrigerator"],
      "Línea Blanca > Refrigeración > Frío Directo", 1],
     ["linea-blanca/refrigeracion/freezer", ["Refrigerator"],
      "Línea Blanca > Refrigeración > Freezer", 1],
    ["linea-blanca/refrigeracion/frigobar-cavas", ["Refrigerator"],
     "Línea Blanca > Refrigeración > Frigobares y Cavas", 1],
    ["linea-blanca/lavado-secado", ["WashingMachine", "DishWasher"],
     "Línea Blanca > Lavado y Secado", 0.5],
    ["linea-blanca/lavado-secado/todas", ["WashingMachine"],
     "Línea Blanca > Lavado y Secado > Todas las Lavadoras", 1],
    ["linea-blanca/lavado-secado/lavadoras-secadoras",
     ["WashingMachine"],
     "Línea Blanca > Lavado y Secado > Lavadora-Secadoras", 1],
    ["linea-blanca/lavado-secado/secadoras-centrifugas",
     ["WashingMachine"],
     "Línea Blanca > Lavado y Secado > Secadoras y Centrifugas", 1],
    ["linea-blanca/lavado-secado/lavavajillas",
     ["DishWasher"],
     "Línea Blanca > Lavado y Secado > Lavavajillas", 1],
    ["linea-blanca/cocina", ["Oven", "Stove"],
     "Línea Blanca > Cocinas", 0],
    ["linea-blanca/cocina/encimeras", ["Oven"],
     "Línea Blanca > Cocinas > Encimeras", 1],
    ["linea-blanca/cocina/hornos-empotrables", ["Oven"],
     "Línea Blanca > Cocinas > Hornos y Microondas empotrables", 1],
    ["linea-blanca/electrodomesticos", ["Oven"],
     "Línea Blanca > Electrodomésticos", 0],
    ["linea-blanca/electrodomesticos/microondas", ["Oven"],
     "Línea Blanca > Electrodomésticos > Microondas", 1],
    ["linea-blanca/climatizacion",
     ["SpaceHeater", "WaterHeater", "AirConditioner"],
     "Línea Blanca > Climatización", 0],
    ["linea-blanca/climatizacion/aires-acondicionado",
     ["AirConditioner"],
     "Línea Blanca > Climatización > Aire Acondicionado", 1],
    ["linea-blanca/estufas", ["SpaceHeater"],
     "Línea Blanca > Estufas", 1],
    ["linea-blanca/estufas/electricas", ["SpaceHeater"],
     "Línea Blanca > Estufas > Estufas Eléctricas", 1],
    ["linea-blanca/electrodomesticos/aspiradoras-enceradoras",
     ["VacuumCleaner"],
     "Línea Blanca > Electrodomésticos > Aspiradoras y Enceradoras",
     1],
    ["electro/television/accesorios-televisores",
     ["CellAccesory"],
     "Electro > Televisión > Accesorios para TV",
     1],
    ["muebles/oficina/sillas/sillas-gamer", ["GAMING_CHAIR"],
     "Muebles > Oficina > Sillas de Escritorio", 1],
    ["tecnologia/gamers/escritorios-gamer/", ["GAMING_DESK"],
     "Tecno > Gamer > Escritorios Gamer", 1]
]

var categories = [
    "Tablet",
    "Television",
    "Projector",
    "Notebook",
    "Refrigerator",
    "Printer",
    "Oven",
    "VacuumCleaner",
    "WashingMachine",
    "Cell",
    "Camera",
    "StereoSystem",
    "OpticalDiskPlayer",
    "ExternalStorageDrive",
    "UsbFlashDrive",
    "MemoryCard",
    "VideoGameConsole",
    "Monitor",
    "AllInOne",
    "AirConditioner",
    "WaterHeater",
    "SolidStateDrive",
    "SpaceHeater",
    "Wearable",
    "Mouse",
    "Keyboard",
    "KeyboardMouseCombo",
    "Headphones",
    "ComputerCase",
    "DishWasher",
    "CellAccesory",
    "GAMING_CHAIR",
    "GAMING_DESK"
]


async function getBody(url) {
    try {
        const options = {
            url: url,
            method: "GET",
        };
        return new Promise(function(resolve, reject) {
            request.get(options, function(err, resp, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
            })
        })
    } catch (error) {
     
        console.log("Error #3\n"+error)
        return undefined;
    }

}


async function getByCategory(category,category_path){

    console.log("Se ha iniciado la categoria "+category+ " | "+category_path)
    var path = "https://www.paris.cl/";

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

    while( page < 40){
        
        // Request para obtener datos
        category_url = path+category_path+"/?sz=40&start="+(page * 40);
        response = await getBody(category_url);
        dom = new JSDOM(response);
        items = dom.window.document.getElementById("search-result-items"); // Div con los N productos

        if(page == 0 && (items == undefined || items.childElementCount == 0)){
            console.log("Error #1 con la categoria "+category+ " | "+ category_url)
            return
        }
        else if(page != 0 && (items.childElementCount == 0)){
            page = 0
        }
        else if(page != 0 && (items == undefined)){
            console.log("Error #2 con la categoria "+category+ " | "+ category_url)
            return
        }


        for(var i = 0 ; i < items.childElementCount ; i++){

            // Contenedores
            item = items.children[i];
            productodiv = item.getElementsByClassName("product-tile ")[0];

            // Atributos - Generales
            picture_urls = productodiv.getElementsByClassName("img-prod")[0].getAttribute("data-src")
            key = productodiv.id;
            url = path+item.getElementsByTagName("a")[0].href
            name = item.getElementsByClassName("ellipsis_text")[0].textContent;
            seller = item.getElementsByClassName("brand-product-plp")[0].textContent;

            // Atributos - Precios
            price_tags = item.getElementsByClassName("price__text")
            if(price_tags.length == 2){
                offer_price = parseFloat(price_tags[0].textContent.replace("\n","").replace("$","").replace(".",""));
                normal_price = parseFloat(price_tags[1].textContent.replace("\n","").replace("$","").replace(".",""));
            }
            else if(price_tags.length == 1){
                offer_price = parseFloat(price_tags[0].textContent.replace("\n","").replace("$","").replace(".",""));
                normal_price = parseFloat(price_tags[0].textContent.replace("\n","").replace("$","").replace(".",""));
            }
            best_price = offer_price;
            if(offer_price > normal_price){
                best_price = normal_price
            }

            // Arreglo Producto
            Producto = [key,url,picture_urls,category_url,seller,name,normal_price,offer_price,best_price];
            Productos.push(Producto)
        }

        console.log("Items cargado de la categoria "+category+" | "+category_path+"  Pagina:"+page+" , Cantidad:"+  items.childElementCount+ " , Cargados:"+Productos.length)

        page+=1;
    }
}


async function Monitoriar(categoria,asignadas){

    while(true){
        for(var i = 0 ; asignadas.length; i++){
            await getByCategory(categoria,asignadas[i])
        };
    }
}

function LoadCategorias(){

    categories.forEach(categoria => {
        var asignadas = []
        category_paths.forEach(subcategoria => {
            var subpath = subcategoria[0]
            if( subcategoria[1].includes(categoria)){
                asignadas.push(subpath)
            }
        });
        if(asignadas.length > 0){
            Monitoriar(categoria,asignadas)
        }
    });

}

LoadCategorias()