
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
    mycursor = mydb.cursor()
    mycursor.executemany(qry, val)
    mydb.commit()
    print(mycursor.rowcount, "Record inserted successfully into table")
    #print(mycursor.rowcount, "record inserted.")


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

if __name__ == '__main__':

    tipo =  sys.argv[1]
    tienda = None

    tienda = get_store_class_by_name(tipo)
    categorias =  tienda.categories()
    print(categorias)

    f = False
    if(f):
        for c in categorias:
            val = (
                tipo,
                c,
                tipo+"-"+c
            )
            sql = 'INSERT INTO tienda_categorias (store,category,keyuniqe,last_date) VALUES (%s,%s,%s,NOW())'
            queryInsert(sql,val)
            print("Categoria "+c+" agregada")

    
    while True:
        for c in categorias:
            Hebra(c,tienda,tipo)


