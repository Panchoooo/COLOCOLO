
from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper.store import Store
from storescraper.product import Product
from storescraper.stores.falabella import Falabella
import mysql.connector
import requests


mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="tiendas"
    )

def enviar(id):
    try:
        r = requests.get('http://localhost:5000/send/'+str(id))
        print(r.json())
        print("Finalizado\n")
    except Exception as e: print(e)

def Hebra(categoria):
    try:
        mycursor = mydb.cursor()
        print(current_process().name) # Nombre de la hebra actual
        a = Falabella()
        mycursor.execute("SELECT * FROM tiendas where category = '"+categoria+"'")

        myresult = mycursor.fetchall()

        for x in myresult:
            o_url = x[4]
            o_offer_price = x[9]
            res = a.products_for_url(o_url)
            if(len(res)>0 ):
                producto = res[0]
                if(int(producto.offer_price) <= int(o_offer_price) and x[17] == 0):
                    enviar(x[0])
                if(int(producto.offer_price) < int(o_offer_price) and x[17] == 1):
                    enviar(x[0])
    except Exception as e: print(e)
    return 

if __name__ == '__main__':
    a = Falabella()
    print(a.categories())
    c = a.categories()

    pool = Pool(processes=len(c))
    result = pool.apply_async(Hebra)
    #print( result.get(timeout=10) )
    try:
        while True:
            print (pool.map(Hebra, [c[0]]))
    except:
        print("ERROR GENERAL")
