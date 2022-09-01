
# SuperFastPython.com
# example of a mutual exclusion (mutex) lock for processes
from time import sleep
from random import random
from multiprocessing import Process
from multiprocessing import Lock
 



from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper import categories
from storescraper.store import Store
from storescraper.product import Product
from storescraper.stores.paris import Paris
from storescraper.stores.lider import Lider
from storescraper.stores.la_polar import LaPolar
from storescraper.stores.absolutec import Absolutec
from storescraper.stores.mercado_libre_chile import MercadoLibreChile
from storescraper.stores import *
import mysql.connector
import sys
import requests

from storescraper.utils import get_store_class_by_name, chunks


def is_integer_num(n):
    if isinstance(n, int):
        return True
    if isinstance(n, float):
        return n.is_integer()
    return False

def enviar(id):
    try: 
        print('http://localhost:5000/send/'+str(id))
        r = requests.get('http://localhost:5000/send/'+str(id))
        print(r.json())
        print("Finalizado\n")
    except Exception as e: print(e)


def querySelect(qry):
    mydb = mysql.connector.connect(
        host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
        user="diego",
        password="AVNS__QSFdINp_Fa9wILf0KO",
        database="tiendas",
        port= "25060"
    )
    mycursor = mydb.cursor()
    mycursor.execute(qry)
    r = mycursor.fetchall()
    mydb.close()
    return r


def queryInsert(qry,val):
    mydb = mysql.connector.connect(
        host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
        user="diego",
        password="AVNS__QSFdINp_Fa9wILf0KO",
        database="tiendas",
        port= "25060"
    )
    mycursor = mydb.cursor()
    mycursor.execute(qry, val)
    mydb.commit()
    print(mycursor.rowcount, "record inserted.")
    mydb.close()
                        

def Hebra(lock, identifier, tienda,n):

    categoria = identifier
    print("Se ha iniciado Tienda: "+n+" | Categoria: "+categoria)
    diccionario = {}

    myresult = []
    with lock:
        myresult = querySelect( "Select * from tiendas where (store = '"+n+"' and category = '"+categoria+"') " )

    for x in myresult:
        diccionario[x[6]] = x[9]

    while(True ):
            r = tienda.discover_entries_for_category(categoria)
            print(str(identifier)+" | Tienda: "+n+" | Categoria: "+categoria+" | r:"+str(len(r)))
            if(len(r)>0):
                flag_delay = True
                for url in r:
                    res = tienda.products_for_url(url)
                    if(len(res)>0):
                        #print(res[0])
                        producto = res[0]
                        
                        po = float(producto.offer_price)
                        pn = float(producto.normal_price)
                        if( (producto.key is not None ) and ('"' in producto.key )):
                            producto.key = producto.key.replace('"','')
                        key = producto.key

                        if(not( producto.key in diccionario )):
                            video = ''
                            picture_urls = ''

                            if( not(producto.video_urls  is None ) and len(producto.video_urls) > 0):
                                video = producto.video_urls[0].replace('"','')
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
                            if( (producto.sku is not None ) and ('"' in producto.sku )):
                                producto.sku = producto.sku.replace('"','')
                            if( (producto.ean is not None ) and ('"' in producto.ean )):
                                producto.ean = producto.ean.replace('"','')
                            if( (producto.description is not None ) and ('"' in producto.description )):
                                producto.description = producto.description.replace('"','')
                            if( (producto.seller is not None ) and ('"' in producto.seller )):
                                producto.seller = producto.seller.replace('"','')

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
                            flag_delay = False
                            diccionario[producto.key] = po
                            try:
                                with lock:
                                    sql = 'INSERT INTO tiendas (name, store, category, url, discovery_url,keey, stock, normal_price, offer_price, sku, ean, description,picture_urls,video_urls, seller,fecha) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,NOW())'
                                    queryInsert(sql,val)
                                    if( po<pn  and (100-po*100/pn)>30 ):
                                        enviar(producto.key)
                            except Exception as e: 
                                if("Duplicate entry" in str(e)):
                                    if( po<diccionario[producto.key]  and ( 100-po*100/diccionario[producto.key] )>30 ):
                                        with lock:
                                            sql = 'UPDATE tiendas SET (offer_price = '+po+') where key="'+key+'"'
                                            querySelect(sql)
                                            enviar(producto.key)
                        else:
                            if( po<diccionario[producto.key]  and ( 100-po*100/diccionario[producto.key] )>30 ):
                                with lock:
                                    sql = 'UPDATE tiendas SET (offer_price = '+po+') where key="'+key+'"'
                                    querySelect(sql)
                                    enviar(producto.key)
                    #else:
                        #print(res)
                        #print(categoria+" | 3 No se encontraron elementos en la url del producto" )
                if(flag_delay):
                    sleep(10)
                    #print(categoria+" | 2 No se encontraron elementos nuevos en la categoria" )
            else:
                #break
                sleep(60)
                #print(categoria+" | 1 No se encontraron elementos en la categoria" )
        #except:
        #    Hebra(lock, identifier, tienda,n)

if __name__ == '__main__':

    tipo =  sys.argv[1]
    tienda = None
    diccionario = []

    if(tipo == "Lider"):
        tienda = Lider()
    if(tipo == "Paris"):
        tienda = Paris()
    if(tipo == "Ripley"):
        tienda = Ripley()
    if(tipo == "AbcDin"):
        tienda = AbcDin()
    if(tipo == "Hites"):
        tienda = Hites()
    if(tipo == "LaPolar"):
        tienda = LaPolar()
    if(tipo == "MercadoLibre"):
        tienda = MercadoLibreChile()
    if(tipo == "Absolutec"):
        tienda = Absolutec()
    else:
        tienda = get_store_class_by_name(tipo)

    categorias =  tienda.categories()
    print(len(categorias))
    if( len( sys.argv ) > 2 != None):
        test = sys.argv[2]
        print("test"+test)
        test = test.split("-")
        print(test)
        cats = []
        for t in test:
            #categorias =  [tienda.categories()[int(test)]]
            cats.append(categorias[int(t)])
        categorias = cats
    print(categorias)

    if(tienda != None):
        lock = Lock()
        processes = [Process(target=Hebra, args=(lock, i, tienda,tipo)) for i in categorias]
        for process in processes:
            process.start()
        for process in processes:
            process.join()
            