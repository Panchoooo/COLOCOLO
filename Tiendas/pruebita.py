
# SuperFastPython.com
# example of a mutual exclusion (mutex) lock for processes
from time import sleep
from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper.stores import *
import mysql.connector
import sys
import requests
from storescraper.utils import get_store_class_by_name, chunks

mydb = mysql.connector.connect(
    host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
    user="diego",
    password="AVNS__QSFdINp_Fa9wILf0KO",
    database="tiendas",
    port= "25060"
)

def enviar(id):
    try: 
        r = requests.get('http://localhost:5000/send/'+str(id))
    except Exception as e: print(e)


def querySelect(qry):
    try:
        mycursor = mydb.cursor()
        mycursor.execute(qry)
        r = mycursor.fetchall()
        return r
    except:
        return []

def queryInsert(qry,val):
    try:
        mycursor = mydb.cursor()
        mycursor.execute(qry, val)
        mydb.commit()
        #print(mycursor.rowcount, "record inserted.")
        return 1
    except:
        return -1

def Hebra( identifier, tienda,n):

    print("Se ha iniciado Tienda: "+n+" | Categoria: "+identifier)
    r = tienda.discover_entries_for_category(identifier)
    print(str(identifier)+" | Tienda: "+n+" | Categoria: "+identifier+" | r:"+str(len(r)))
    if(len(r)>0):
        for url in r:
            print(url)
            res = tienda.products_for_url(url)
            if(len(res)>0):
                producto = res[0]
                po = float(producto.offer_price)
                pn = float(producto.normal_price)
                key = producto.key
                qr = querySelect("SELECT offer_price,normal_price,name FROM tiendas WHERE keey = '"+key+"'")
                if(len(qr)==0):
                    video = ''
                    picture_urls = ''
                    if( not(producto.video_urls is None ) and len(producto.video_urls) > 0):
                        video = producto.video_urls[0].replace('"','')
                    if( not(producto.picture_urls  is None ) and len(producto.picture_urls) > 0):
                        picture_urls = producto.picture_urls[0].replace('"','')
                    val = (
                            producto.name,
                            producto.store,
                            identifier,
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
                    sql = 'INSERT INTO tiendas (name, store, category, url, discovery_url,keey, stock, normal_price, offer_price, sku, ean, description,picture_urls,video_urls, seller,fecha) VALUES (%s,%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,%s,NOW())'
                    queryInsert(sql,val)
                    if( po<pn  and (100-po*100/pn)>30 ):
                        enviar(producto.key)
                else:
                    if( po<qr[0][0] and ((100-(po*100/qr[0][1]))>30) ):
                        sql = 'UPDATE tiendas SET (offer_price = '+str(po)+') where key="'+key+'"'
                        querySelect(sql)
                        enviar(producto.key)
            #else:
                #print(categoria+" | 3 No se encontraron elementos en la url del producto" )
    else:
        sleep(60)
        #print(categoria+" | 1 No se encontraron elementos en la categoria" )

if __name__ == '__main__':

    tipo =  sys.argv[1]
    tienda = None

    tienda = get_store_class_by_name(tipo)
    categorias =  tienda.categories()
    #print(len(categorias))
    if( len( sys.argv ) > 2 != None):
        test = sys.argv[2]
        #print("test"+test)
        test = test.split("-")
        #print(test)
        cats = []
        for t in test:
            #categorias =  [tienda.categories()[int(test)]]
            cats.append(categorias[int(t)])
        categorias = cats
    print(categorias)

    for c in categorias:
        Hebra( c, tienda,tipo)