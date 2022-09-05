
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
        #print(e)
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
        #print(mycursor.rowcount, "Record inserted successfully into table")
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
        #print(mycursor.rowcount, "Record inserted successfully into table")
    except:
        #print("duplicado")
        return


def Hebra( identifier, tienda,n):

    print("Se ha iniciado Tienda: "+n+" | Categoria: "+identifier)
    try:
        r = tienda.discover_entries_for_category(identifier)
    except:
        return
    if(len(r)>0):
        val = []
        for url in r:
            print(url)
            val.append((n,identifier,url))
        sql = 'INSERT IGNORE INTO tiendas ( store, category, url,fecha,last_date) VALUES (%s,%s, %s,NOW(),NOW() )'
        queryInsert(sql,val)
        #print(categoria+" | 1 No se encontraron elementos en la categoria" )

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


