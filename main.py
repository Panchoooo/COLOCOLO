
from multiprocessing import Pool
from multiprocessing import Process, current_process
from time import sleep
from storescraper.store import Store
from storescraper.product import Product
from storescraper.stores.falabella import Falabella
import mysql.connector


mydb = mysql.connector.connect(
    host="localhost",
    user="root",
    password="",
    database="tiendas"
    )



def Hebra(categoria):
    try:

        mycursor = mydb.cursor()

        print(current_process().name) # Nombre de la hebra actual
        a = Falabella()
        r = a.discover_entries_for_category(categoria)

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
        print("print r: ")



        for url in r:
            res = a.products_for_url(url)
            if(len(res)>0):
                print(res[0])
                producto = res[0]
                video = ''
                if( len(producto.video_urls) > 0):
                    video = producto.video_urls[0]
                    if( (video is not None ) and ('"' in video) ):
                        video = video.replace('"','')
                picture_urls = ''
                if( len(producto.picture_urls) > 0):
                    picture_urls = producto.picture_urls[0]
                    if( (picture_urls is not None ) and ('"' in picture_urls) ):
                        picture_urls = picture_urls.replace('"','')

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


                sql = 'INSERT INTO tiendas (name, store, category, url, discovery_url,  stock, normal_price, offer_price, sku, ean, description,picture_urls,video_urls, seller,fecha) VALUES (%s,%s,   %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s,NOW())'
                val = (
                        producto.name,
                        producto.store,
                        categoria,
                        producto.url,
                        producto.discovery_url,
                        producto.stock,
                        producto.normal_price,
                        producto.offer_price,
                        producto.sku,
                        producto.ean,
                        producto.description,
                        picture_urls,
                        video,
                        producto.seller
                )
                mycursor.execute(sql, val)
                mydb.commit()
                print(mycursor.rowcount, "record inserted.")

                print("\n")
    except Exception as e: print(e)
    return 

if __name__ == '__main__':
    a = Falabella()
    print(a.categories())
    c = a.categories()

    pool = Pool(processes=len(c))
    result = pool.apply_async(Hebra)
    #print( result.get(timeout=10) )
    print (pool.map(Hebra, [c[-1]]))

