
# SuperFastPython.com
# example of a mutual exclusion (mutex) lock for processes
from re import A
from time import sleep
import random

from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper.stores import *
import mysql.connector
import sys
import requests
from storescraper.utils import get_store_class_by_name, chunks

from multiprocessing import Lock


def enviar(id):
    try: 
        r = requests.get('http://localhost:5000/send/'+str(id))
    except Exception as e: print(e)

def querySelect(qry):
    try:
        mycursor = mydb.cursor()
        mycursor.execute(qry)
        r = mycursor.fetchall()
        mydb.commit()
        return r
    except Exception as e: 
        print(e)
        return []

def queryInsert(qry,val):

    mydb = mysql.connector.connect(
        host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
        user="diego",
        password="AVNS__QSFdINp_Fa9wILf0KO",
        database="tiendas",
        port= "25060"
    )
    mycursor = mydb.cursor()
    mycursor.executemany(qry, val)
    mydb.commit()
    print(mycursor.rowcount, "Record inserted successfully into table")
    #print(mycursor.rowcount, "record inserted.")
    mydb.close()

def queryInsert2(qry,val):
    try:

        mydb = mysql.connector.connect(
            host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
            user="diego",
            password="AVNS__QSFdINp_Fa9wILf0KO",
            database="tiendas",
            port= "25060"
        )
        mycursor = mydb.cursor()
        mycursor.executemany(qry, val)
        mydb.commit()
        print( "Record inserted successfully into table")
        mydb.close()
        #print(mycursor.rowcount, "record inserted.")
    except mysql.connector.Error as my_error:
        print(my_error)


def Hebra( identifier, tienda,n):

    print("Se ha iniciado Tienda: "+n+" | Categoria: "+identifier)
    r = tienda.discover_entries_for_category(identifier)
    print(str(identifier)+" | Tienda: "+n+" | Categoria: "+identifier+" | r:"+str(len(r)))
    if(len(r)>0):
        val = []
        for url in r:
            print(url)
            val.append((n,identifier,url))
        sql = 'INSERT IGNORE INTO tiendas ( store, category, url,fecha) VALUES (%s,%s, %s,NOW())'
        queryInsert(sql,val)
        #print(categoria+" | 1 No se encontraron elementos en la categoria" )

def HebraCat(lock, cat, tienda,tipo):
    vals = []
    try:
        while True:
            with lock:
                vals = []
                res = querySelect("SELECT * from tiendas where store = '"+tipo+"' and category='"+cat+"'")
            if(len(res)>0):
                for r in res:
                    url = r[4]
                    cargado = r[14]

                    producto = tienda.products_for_url(url)[0]
                    np = float(producto.normal_price)
                    op = float(producto.offer_price)
                    bp = np
                    if(op<np):
                        bp = op

                    if(cargado == 0 ):
                        print(tipo+ " | Nuevo producto | key: "+producto.key)
                        picture_urls = ""
                        if( not(producto.picture_urls  is None ) and len(producto.picture_urls) > 0):
                            picture_urls = producto.picture_urls[0].replace('"','')
                        sql = "UPDATE tiendas SET name = %s, stock = %s, keey=%s, normal_price = %s, offer_price = %s, best_price = %s, sku = %s, picture_urls =%s, seller=%s, fecha = NOW(), cargado = 1 WHERE url = '"+url+"'"
                        
                        with lock:
                            queryInsert2(sql,[(
                                producto.name,
                                producto.stock,
                                producto.key,
                                np,
                                op,
                                bp,
                                producto.sku,
                                picture_urls,
                                producto.seller
                            )])
                    else:
                        print(cat+ " | Producto existente | key: "+producto.key)

                        if(bp < r[9]):
                            #print("Nueva Oferta !")

                            if( not(producto.picture_urls  is None ) and len(producto.picture_urls) > 0):
                                picture_urls = producto.picture_urls[0].replace('"','')
                            vals.append((
                                producto.name,
                                producto.stock,
                                producto.key,
                                np,
                                op,
                                bp,
                                producto.sku,
                                picture_urls,
                                producto.seller
                            ))
                            sql = "UPDATE tiendas SET name = %s, stock = %s, keey=%s, normal_price = %s, offer_price = %s, best_price = %s, sku = %s, picture_urls =%s, seller=%s, fecha = NOW(), cargado = 1 WHERE url = '"+url+"'"
                            sql2 = 'INSERT IGNORE INTO tiendas_log ( store, category, keey,price,fecha) VALUES (%s,%s, %s,%s,NOW())'
                            
                            with lock:
                                queryInsert2(sql,vals)
                                queryInsert2(sql2,[(
                                    tipo,
                                    cat,
                                    producto.key,
                                    bp
                                )])
                        #else:
                            #print("Mantiene su precio")
                                
                print("\n\nCargando "+cat+" denuevo....")
            else:
                print("\n\nNo se encontraron datos de la categoria "+cat)
                sleep(30)

    except KeyboardInterrupt:
        pass

if __name__ == '__main__':

    tipo =  sys.argv[1]
    tienda = get_store_class_by_name(tipo)
    categorias =  tienda.categories()

    lock = Lock()
    #HebraCat(lock,categorias[0],tienda,tipo)
    
    
    processes = [Process(target=HebraCat, args=(lock, i, tienda,tipo)) for i in categorias]
    for process in processes:
        process.start()
    for process in processes:
        process.join()
    exit(1)            