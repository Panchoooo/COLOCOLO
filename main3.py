
from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper.store import Store
from storescraper.product import Product
from storescraper.stores.paris import Paris
from storescraper.stores.lider import Lider
from storescraper.stores.abcdin import AbcDin
import mysql.connector
import sys
import requests

tipo =  sys.argv[1]


tienda = None
diccionario = []

mydb = mysql.connector.connect(
    host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
    user="doadmin",
    password="AVNS_fh12ouJEjX8o4mU-0xs",
    database="tiendas",
    port= "25060"
)


def is_integer_num(n):
    if isinstance(n, int):
        return True
    if isinstance(n, float):
        return n.is_integer()
    return False


if(tipo == "Lider"):
    tienda = Lider()
if(tipo == "Paris"):
    tienda = Paris()
if(tipo == "Ripley"):
    tienda = Ripley()
if(tipo == "AbcDin"):
    tienda = AbcDin()

categorias =  tienda.categories()
if( len( sys.argv ) > 2 != None):
    test = sys.argv[2]
    categorias =  [tienda.categories()[int(test)]]



mycursor = mydb.cursor()
sql = "Select * from tiendas where (store = '"+tipo+"')"
mycursor.execute(sql)
myresult = mycursor.fetchall()

for x in myresult:
    diccionario.append(x[6])

def enviar(id):
                           
    try: 
        print('http://localhost:5000/send/'+str(id))
        r = requests.get('http://localhost:5000/send/'+str(id))
        print(r.json())
        print("Finalizado\n")
    except Exception as e: print(e)

def Hebra(categoria):
    while(True):
            print(current_process().name,categoria) # Nombre de la hebra actual
            r = tienda.discover_entries_for_category(categoria)
            #   self.name = name
            #   self.store = store
            #   self.category = category
            #   self.url = url
            #   self.discovery_url = discovery_url
            #   self.key = key
            #   self.stock = stock
            #   self.normal_price = normal_price
            #   self.offer_price = offer_price
            #       #   self.currency = currency
            #       #   self.part_number = part_number
            #   self.sku = sku
            #   self.ean = ean
            #   self.description = description
            #       #   self.cell_plan_name = cell_plan_name
            #       #   self.cell_monthly_payment = cell_monthly_payment
            #   self.picture_urls = picture_urls
            #       #   self.condition = condition
            #       #   self.positions = positions or {}
            #   self.video_urls = video_urls
            #       #   self.review_count = review_count
            #       #   self.review_avg_score = review_avg_score
            #       #   self.flixmedia_id = flixmedia_id
            #       #   self.has_virtual_assistant = has_virtual_assistant
            #   self.seller = seller

            if(len(r)>0):
                flag_delay = True
                for url in r:
                    res = tienda.products_for_url(url)
                    if(len(res)>0):
                        producto = res[0]
                        if(not( producto.key in diccionario )):
                            video = ''
                            if( not(producto.video_urls  is None ) and len(producto.video_urls) > 0):
                                video = producto.video_urls[0].replace('"','')
                            picture_urls = ''
                            if( not(producto.picture_urls  is None ) and len(producto.picture_urls) > 0):
                                picture_urls = producto.picture_urls[0].replace('"','')

                            if( (producto.name is not None ) and ('"' in producto.name )):
                                producto.name = producto.name.replace('"','')
                            if( (producto.store is not None ) and ('"' in producto.store )):
                                producto.store = producto.store.replace('"','')
                            if( (producto.category is not None ) and ('"' in producto.category )):
                                producto.category = producto.category.replace('"','')
                            if( (producto.url is not None ) and ('"' in producto.url )):
                                producto.url = producto.url.replace('"','')
                            if( (producto.discovery_url is not None ) and ('"' in producto.discovery_url )):
                                producto.discovery_url = producto.discovery_url.replace('"','')
                            if( (producto.key is not None ) and ('"' in producto.key )):
                                producto.key = producto.key.replace('"','')
                            if( (producto.sku is not None ) and ('"' in producto.sku )):
                                producto.sku = producto.sku.replace('"','')
                            if( (producto.ean is not None ) and ('"' in producto.ean )):
                                producto.ean = producto.ean.replace('"','')
                            if( (producto.description is not None ) and ('"' in producto.description )):
                                producto.description = producto.description.replace('"','')

                            if( (producto.seller is not None ) and ('"' in producto.seller )):
                                producto.seller = producto.seller.replace('"','')

                            key = producto.key
                            val = (
                                    producto.name,
                                    producto.store,
                                    categoria,
                                    producto.url,
                                    producto.discovery_url,
                                    key,
                                    producto.stock,
                                    float(producto.normal_price),
                                    float(producto.offer_price),
                                    producto.sku,
                                    producto.ean,
                                    producto.description,
                                    picture_urls,
                                    video,
                                    producto.seller
                            )
                            try:
                                #mydb.reconnect()
                                try:
                                    mycursor = mydb.cursor()
                                except:
                                    mydb.reconnect()
                                    mycursor = mydb.cursor()

                                sql = 'INSERT INTO tiendas (name, store, category, url, discovery_url,keey, stock, normal_price, offer_price, sku, ean, description,picture_urls,video_urls, seller,fecha) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,NOW())'
                                mycursor.execute(sql, val)
                                mydb.commit()
                                mycursor.close()
                                print(mycursor.rowcount, "record inserted.")
                                flag_delay = False
                                diccionario.append(producto.key)

                                po = float(producto.offer_price)
                                pn = float(producto.normal_price)
                                #if( po<pn  and (100-po*100/pn)>30 ):
                                enviar(producto.key)
                                sleep(1)
                            except Exception as e: 
                                print(e)
                                diccionario.append(producto.key)
                                sleep(1)
                        else:
                            po = float(producto.offer_price)
                            pn = float(producto.normal_price)
                            #if( po<pn  and (100-po*100/pn)>30 ):
                            enviar(producto.key)
                    else:
                        print(res)
                        print(categoria+" | 2 No se encontraron elementos" )
                        sleep(0.5)

                if(flag_delay):
                    sleep(30)
  
            else:
                print(categoria+" | 1 No se encontraron elementos" )
                sleep(60)


    return 

if __name__ == '__main__':
    if(tienda != None):

        print(categorias)
        pool = Pool(processes=len(categorias))
        result = pool.apply_async(Hebra)
        print (pool.map(Hebra,categorias))
    else:
        print("Error tipo")



