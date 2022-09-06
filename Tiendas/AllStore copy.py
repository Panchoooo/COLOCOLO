
# SuperFastPython.com
# example of a mutual exclusion (mutex) lock for processes
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

mydb = mysql.connector.connect(
    host="db-mysql-nyc1-93755-do-user-12336633-0.b.db.ondigitalocean.com",
    user="diego",
    password="AVNS__QSFdINp_Fa9wILf0KO",
    database="tiendas",
    port= "25060"
)

def enviar(id):
    try: 
        requests.get('http://localhost:5000/send/'+str(id))
    except Exception as e: print(e)

def querySelect(qry):
    try:
        try:
            mycursor = mydb.cursor()
        except:
            mydb.reconnect()
            mycursor = mydb.cursor()
            
        mycursor.execute(qry)
        r = mycursor.fetchall()
        mydb.commit()
        return r
    except Exception as e: 
        print(e)
        return []

def queryInsert(qry,val):
    try:
        try:
            mycursor = mydb.cursor()
        except:
            mydb.reconnect()
            mycursor = mydb.cursor()
            
        mycursor.executemany(qry, val)
        mydb.commit()
        print(mycursor.rowcount, "Record inserted successfully into table")
    except:
        return
        #print("error")

def queryInsert2(qry,val):
    try:
        try:
            mycursor = mydb.cursor()
        except:
            mydb.reconnect()
            mycursor = mydb.cursor()
        mycursor.execute(qry, val)
        mydb.commit()
        print(mycursor.rowcount, "Record inserted successfully into table")
    except Exception as e: 
        print(e)
        return []

def Hebra( identifier, tienda,n):

    print("Se ha iniciado Tienda: "+n+" | Categoria: "+identifier)
    try:
        r = tienda.discover_entries_for_category(identifier)
    except:
        print("Error en discover_entries_for_category")
        return
    if(len(r)>0):
        val_add = []
        val_upd = []
        mensajes = []
        for url in r:
            producto = r[url][0]
            best_price = producto['offer_price']
            if(producto['offer_price'] > producto['normal_price']):
                best_price = producto['normal_price']
            sql = "SELECT * from tiendasv2 WHERE store= '"+n+"' and keey='"+producto['key']+"'"
            exist = querySelect(sql)
            if(len(exist) == 0):
                print("NUEVO PRODUCTO")
                val_add.append((
                    n,
                    producto['key'],
                    identifier,
                    producto['seller'],
                    producto['name'],
                    url,
                    producto['picture_url'],
                    producto['category_url'],
                    producto["normal_price"],
                    producto['offer_price'],
                    best_price
                ))
                #sql = 'INSERT INTO tiendasv2 (store, keey,category,seller,name, url, picture_url, category_url, normal_price, offer_price, best_price ,fecha) VALUES (%s,%s,%s, %s, %s,%s,%s,%s,%s,%s,%s,NOW() ) on duplicate key update fecha = now() '
                #queryInsert2(sql,val)
                #try:
                #    if( 100-(best_price*100/producto["normal_price"]) > 30 ):
                #        enviar(producto.key)
                #except:
                #    print("error te")

                if( 100-(best_price*100/producto["normal_price"]) > 30 ):
                    mensajes.append(producto.key)
            else:
                print("PRODUCTO YA EXISTENTE")
                if(best_price < exist[0][11]):
                    val_upd.append((best_price,producto['key']))
                    #queryInsert2("UPDATE tiendasv2 SET last_date = NOW() , best_price = %s WHERE keey = %s",(best_price,producto['key']))
                    #try:
                    #    if( 100-(best_price*100/producto["normal_price"]) > 30 ):
                    #        enviar(producto.key)
                    #except:
                    #    print("error te2")
                    if( 100-(best_price*100/producto["normal_price"]) > 30 ):
                        mensajes.append(producto.key)
        queryInsert(sql,val_add)
        queryInsert(sql,val_upd)
        for m in mensajes:
            enviar(m)


if __name__ == '__main__':

    tipo =  sys.argv[1]
    tienda = None

    tienda = get_store_class_by_name(tipo)
    categorias =  tienda.categories()
    print(categorias)

    f = False
    if( len( sys.argv ) > 2 != None):
        if(sys.argv[2]=="1"):
            f=  True

    if(f):
        for c in categorias:
            val = (
                tipo,
                c,
                tipo+"-"+c
            )
            sql = 'INSERT INTO tienda_categorias (store,category,keyuniqe,last_date) VALUES (%s,%s,%s,NOW())'
            queryInsert2(sql,val)
            #print("Categoria "+c+" agregada")

    try:
        while True:
            for c in categorias:
                Hebra(c,tienda,tipo)
                sql = "UPDATE tienda_categorias SET last_date = NOW() where store='"+tipo+"' AND category = '"+c+"'"
                querySelect(sql)
    except KeyboardInterrupt:
        pass


