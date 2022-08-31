import logging

import time
import json

from collections import defaultdict
from decimal import Decimal
from bs4 import BeautifulSoup

from storescraper.categories import GAMING_CHAIR
from storescraper.flixmedia import flixmedia_video_urls
from storescraper.product import Product
from storescraper.store import Store
from storescraper.utils import html_to_markdown, session_with_proxy, \
    HeadlessChrome
from storescraper import banner_sections as bs


class LaPolar(Store):
    @classmethod
    def categories(cls):
        return [
            'Notebook',
            'Tablet',
            'Television',
            'OpticalDiskPlayer',
            'Cell',
            'Printer',
            'ExternalStorageDrive',
            'Mouse',
            'Keyboard',
            'UsbFlashDrive',
            'StereoSystem',
            'Headphones',
            'VideoGameConsole',
            'WashingMachine',
            'Refrigerator',
            'Stove',
            'Oven',
            'DishWasher',
            'VacuumCleaner',
            'WaterHeater',
            'SpaceHeater',
            'AirConditioner',
            'Wearable',
            GAMING_CHAIR
        ]

    @classmethod
    def discover_entries_for_category(cls, category, extra_args=None):
        category_paths = [
            ['notebooks', ['Notebook'],
             'Inicio > Tecnología > Computadores > Notebooks', 1],
            ['tablet', ['Tablet'],
             'Inicio > Tecnología > Computadores > Tablet', 1],
            ['televisores', ['Television', 'StereoSystem'],
             'Inicio > Tecnología > Televisores', 0.5],
            ['led', ['Television'],
             'Inicio > Tecnología > Televisores > LED', 1],
            ['smart-tv', ['Television'],
             'Inicio > Tecnología > Televisores > Smart TV', 1],
            ['oled-i-qled-i-curvo', ['Television'],
             'Inicio > Tecnología > Televisores > OLED | QLED | Curvo', 1],
            ['dvd-i-blu-ray', ['OpticalDiskPlayer'],
             'Inicio > Teconología > Televisores > DVD | Blu-Ray', 1],
            ['smartphones', ['Cell'],
             'Inicio > Tecnología > Celulares > Smartphones', 1],
            ['telefonos-basicos', ['Cell'],
             'Inicio > Tecnología > Celulares > Teléfonos Básicos', 1],
            ['todo-impresoras', ['Printer'],
             'Inicio > Tecnología > Computadores > Impresoras', 1],
            ['disco-duro-externo', ['ExternalStorageDrive'],
             'Inicio > Tecnología > Accesorios Computación > '
             'Disco Duro Externo',
             1],
            ['mouse-i-teclados', ['Mouse', 'Keyboard'],
             'Inicio > Tecnología > Accesorios Computación > Mouse | Teclados',
             0.5],
            ['pendrives', ['UsbFlashDrive'],
             'Inicio > Tecnología > Accesorios Computación > Pendrives', 1],
            ['audio', ['StereoSystem'],
             'Inicio > Tecnología > Audio', 0],
            ['minicomponentes', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Minicomponentes', 1],
            ['parlantes-portátiles', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Parlantes Portátiles', 1],
            ['soundbar', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Soundbar', 1],
            ['equipos-de-musica', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Equipos de música', 1],
            ['karaoke', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Karaoke', 1],
            ['home-theater', ['StereoSystem'],
             'Inicio > Tecnología > Audio > Home Theater', 1],
            ['audifonos', ['Headphones'],
             'Inicio > Tecnología > Audio > Audífonos', 1],
            ['consolas', ['VideoGameConsole'],
             'Inicio > Tecnología > Videojuegos > Todo Consolas', 1],
            ['lavado-y-secado', ['WashingMachine'],
             'Inicio > Línea Blanca > Lavado y Secado', 1],
            ['lavadoras', ['WashingMachine'],
             'Inicio > Línea Blanca > Lavado y Secado > Lavadoras', 1],
            ['lavadoras-secadoras', ['WashingMachine'],
             'Inicio > Línea Blanca > Lavado y Secado > Lavadoras-Secadoras',
             1],
            ['secadoras', ['WashingMachine'],
             'Inicio > Línea Blanca > Lavado y Secado > Secadoras', 1],
            ['centrifugas', ['WashingMachine'],
             'Inicio > Línea Blanca > Lavado y Secado > Centrífugas', 1],
            ['refrigeradores', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores', 1],
            ['side-by-side', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores > Side by Side', 1],
            ['no-frost', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores > No Frost', 1],
            ['frio-directo', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores > Frío Directo', 1],
            ['frigobar', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores > Frigobar', 1],
            ['freezer', ['Refrigerator'],
             'Inicio > Línea Blanca > Refrigeradores > Freezer', 1],
            ['cocinas-a-gas', ['Stove'],
             'Inicio > Línea Blanca > Cocina > Cocinas a Gas', 1],
            ['encimeras', ['Stove'],
             'Inicio > Línea Blanca > Cocina > Encimeras', 1],
            ['hornos-y-microondas', ['Oven'],
             'Inicio > Línea Blanca > Cocina > Microondas', 1],
            ['hornos-electricos', ['Oven'],
             'Inicio > Línea Blanca > Cocina > Hornos Eléctricos', 1],
            ['lavavajillas', ['DishWasher'],
             'Inicio > Línea Blanca > Cocina > Lavavajillas', 1],
            ['aspiradoras', ['VacuumCleaner'],
             'Inicio > Línea Blanca > Electrodomésticos > Aspiradoras', 1],
            ['calefont-y-termos', ['WaterHeater'],
             'Inicio > Línea Blanca > Climatización > Calefont y Termos', 1],
            ['estufas-a-parafina', ['SpaceHeater'],
             'Inicio > Línea Blanca > Climatización > Estufas a Parafina', 1],
            ['estufas-a-gas', ['SpaceHeater'],
             'Inicio > Línea Blanca > Climatización > Estufas a Gas', 1],
            ['estufas-electricas', ['SpaceHeater'],
             'Inicio > Línea Blanca > Climatización > Estufas Eléctricas', 1],
            ['enfriadores', ['AirConditioner'],
             'Inicio > Línea Blanca > Climatización > Enfriadores', 1],
            ['accesorios-telefonos', ['Wearable'],
             'Inicio > Tecnología > Celulares > Accesorios Teléfonos', 0],
            ['sillas-gamer', [GAMING_CHAIR],
             'Inicio > Tecnología > Mundo Gamer > Sillas Gamer', 1]

            ['mujer/ropa-mujer', "Mujer", '', 1],
            ['mujer/zapatos-mujer', "Mujer", '', 1],
            ['mujer/ropa-interior-y-pijamas', "Mujer", '', 1],
            ['mujer/ropa-deportiva-mujer', "Mujer", '', 1],
            ['mujer/accesorios', "Mujer", '', 1],
            ['novedades-moda-mujer', "Mujer", '', 1],
            ['hombre/ropa-hombre', "Hombre",'',1 ],
            ['hombre/ropa-deportiva-hombre', "Hombre",'',1 ],
            ['hombre/zapatos-hombre', "Hombre",'',1 ],
            ['hombre/accesorios', "Hombre",'',1 ],
            ['deportes/bicicletas-y-scooters', "Deportes", "", 1],
            ['deportes/mundo-fitness', "Deportes", "", 1],
            ['deportes/zapatillas', "Deportes", "", 1],
            ['deportes/camping', "Deportes", "", 1],
            ['deportes/aire-libre', "Deportes", "", 1],
            ['deportes/accesorios-deportivos', "Deportes", "", 1],
            ['deportes/ropa-deportiva-mujer', "Deportes", "", 1],
            ['deportes/ropa-deportiva-hombre', "Deportes", "", 1],
            ['belleza/perfumes',  "Belleza", "", 1 ],
            ['belleza/maquillaje',  "Belleza", "", 1 ],
            ['belleza/cuidado-de-la-piel',  "Belleza", "", 1 ],
            ['belleza/cuidado-personal',  "Belleza", "", 1 ],
            ['belleza/cuidado-capilar',  "Belleza", "", 1 ],
            ['dormitorio/camas-europeas', "Dormitorio" , "", 1],
            ['dormitorio/camas-americanas', "Dormitorio" , "", 1],
            ['dormitorio/camas-funcionales', "Dormitorio" , "", 1],
            ['dormitorio/colchones', "Dormitorio" , "", 1],
            ['dormitorio/box-sprin', "Dormitorio" , "", 1],
            ['dormitorio/muebles-dormitorio', "Dormitorio" , "", 1],
            ['dormitorio/ropa-de-cama', "Dormitorio" , "", 1],
            ['dormitorio/descanso-infantil', "Dormitorio" , "", 1],
            ['muebles/muebles-dormitorio', "Muebles", "", 1],
            ['muebles/terraza', "Muebles", "", 1],
            ['muebles/organizadores', "Muebles", "", 1],
            ['muebles/comedor', "Muebles", "", 1],
            ['muebles/living/juegos-de-living', "Muebles", "", 1],
            ['muebles/living/sofas-seccionales', "Muebles", "", 1],
            ['muebles/living/sofas-y-sillones', "Muebles", "", 1],
            ['muebles/living/sofa-cama-i-futones', "Muebles", "", 1],
            ['muebles/living/sitiales', "Muebles", "", 1],
            ['muebles/living/pouf-y-banquetas', "Muebles", "", 1],
            ['muebles/living/mesas-de-living', "Muebles", "", 1],
            ['muebles/living/mesas-de-centro', "Muebles", "", 1],
            ['muebles/living/fundas-para-sillones', "Muebles", "", 1],
            ['hogar/menaje-cocina', "Hogar", "", 1],
            ['hogar/menaje-mesa', "Hogar", "", 1],
            ['hogar/parrillas', "Hogar", "", 1],
            ['hogar/alfombras', "Hogar", "", 1],
            ['hogar/decoracion', "Hogar", "", 1],
            ['hogar/bano', "Hogar", "", 1],
            ['hogar/terraza', "Hogar", "", 1],
            ['hogar/playa', "Hogar", "", 1],
            ['ninos/ropa-infantil', "Ninos", "", 1],
            ['ninos/zapatos-ninos', "Ninos", "", 1],
            ['ninos/espacio-bebe', "Ninos", "", 1],
            ['ninos/coches', "Ninos", "", 1],
            ['ninos/sillas-de-auto', "Ninos", "", 1],
            ['ninos/descanso-infantil', "Ninos", "", 1],
            ['ninos/juguetes', "Ninos", "", 1],
            ['zapatos/zapatillas', "Zapatos","",1],
            ['zapatos/zapatos-mujer', "Zapatos","",1],
            ['zapatos/zapatos-hombre', "Zapatos","",1],
            ['zapatos/zapatos-ninos', "Zapatos","",1],
            ['otras-lineas/super-combos', "Otras-lineas","",1],
            ['otras-lineas/mascotas', "Otras-lineas","",1],
            ['otras-lineas/otras-categorias', "Otras-lineas","",1],
            ['otras-lineas/salud-y-bienestar', "Otras-lineas","",1],
            ['🔥-outlet-online/hogar-en-oferta', "outlet","",1],
            ['🔥-outlet-online/tecnologia-en-oferta', "outlet","",1],
            ['🔥-outlet-online/electrohogar-en-oferta', "outlet","",1],
            ['🔥-outlet-online/deporte-en-oferta', "outlet","",1],
            ['🔥-outlet-online/moda-mujer-en-oferta', "outlet","",1],
            ['🔥-outlet-online/moda-hombre-en-oferta', "outlet","",1],
            ['🔥-outlet-online/mundo-infantil-en-oferta', "outlet","",1],
            ['🔥-outlet-online/belleza-en-oferta', "outlet","",1],
            ['🔥-outlet-online/calzado-en-oferta', "outlet","",1],
        ]

        session = session_with_proxy(extra_args)

        product_entries = defaultdict(lambda: [])

        for e in category_paths:
            category_path, local_categories, section_name, category_weight = e

            if category not in local_categories:
                continue

            url = 'https://www.lapolar.cl/on/demandware.store/' \
                  'Sites-LaPolar-Site/es_CL/Search-UpdateGrid?' \
                  'cgid={}&srule=most-popular&start=0&sz=150' \
                .format(category_path)

            response = session.get(url).text
            soup = BeautifulSoup(response, 'html.parser')

            products = soup.findAll('div', 'lp-product-tile')

            if not products:
                logging.warning('Empty category path: {} - {}'.format(
                    category, category_path))

            for idx, container in enumerate(products):
                product_url = 'https://www.lapolar.cl{}' \
                    .format(container.find('a')['href'])
                product_entries[product_url].append({
                    'category_weight': category_weight,
                    'section_name': section_name,
                    'value': idx + 1
                })

        return product_entries

    @classmethod
    def discover_urls_for_keyword(cls, keyword, threshold, extra_args=None):
        session = session_with_proxy(extra_args)
        product_urls = []

        url = 'https://www.lapolar.cl/on/demandware.store/' \
              'Sites-LaPolar-Site/es_CL/Search-UpdateGrid?' \
              'q={}&srule=product-outstanding' \
              '&start=0&sz=1000'.format(keyword)

        response = session.get(url).text
        soup = BeautifulSoup(response, 'html.parser')

        products = soup.findAll('div', 'lp-product-tile')

        if not products:
            return []

        for container in products:
            product_url = 'https://www.lapolar.cl{}' \
                .format(container.find('a')['href'])
            product_urls.append(product_url)

            if len(product_urls) == threshold:
                return product_urls

        return product_urls

    @classmethod
    def products_for_url(cls, url, category=None, extra_args=None):
        session = session_with_proxy(extra_args)
        response = session.get(url)

        if not response.ok:
            return []

        page_source = response.text

        soup = BeautifulSoup(page_source, 'html.parser')

        name = soup.find('div', 'product-name').text.strip()
        sku = soup.find('span', 'sku-code-value').text.strip()

        prices = soup.find('div', 'prices')
        la_polar_card = prices.find('p', 'js-tlp-price')

        if prices.find('p', 'la-polar'):
            highlighted_price = prices.find('p', 'la-polar')
        else:
            highlighted_price = prices.find('p', 'internet')
        highlighted_price = highlighted_price.find(
            'span', 'price-value') \
            .text.strip().replace('$', '').replace('.', '')
        highlighted_price = Decimal(highlighted_price)

        if la_polar_card:
            offer_price = highlighted_price

            normal_price = prices.find('p', 'internet').find(
                'span', 'price-value').text.strip() \
                .replace('$', '').replace('.', '')
            normal_price = Decimal(normal_price)
        else:
            offer_price = normal_price = highlighted_price

        description = html_to_markdown(
            str(soup.find('div', 'description-wrapper')))

        picture_containers = soup.findAll('div', 'primary-image')
        picture_urls = [
            picture.find('img')['src'].replace(' ', '%20')
            for picture in picture_containers]

        if 'reacondicionado' in name.lower():
            condition = 'https://schema.org/RefurbishedCondition'
        else:
            condition = 'https://schema.org/NewCondition'

        flixmedia_id = None
        video_urls = None

        if 'LG' in name and '//media.flixfacts.com/js/loader.js' in \
                response.text:
            details_tab = soup.find('div', 'details-tab')
            for label in details_tab.findAll('div', 'attr-label'):
                if label.text.strip() == 'Modelo:':
                    model = label.parent.find('div', 'attr-value').text.strip()
                    video_urls = flixmedia_video_urls(model)
                    if video_urls is not None:
                        flixmedia_id = model
                    break

        variation_container = soup.find('div', 'swatch-wrapper')
        variations = []

        if variation_container:
            variations = variation_container.findAll('a')

        products = []

        if variations:
            for variation in variations:
                variation_url = variation['href']
                variation_data = json.loads(session.get(variation_url).text)
                attributes = variation_data["product"]["variationAttributes"]

                for attribute in attributes:
                    if attribute["displayName"] != "Compañía":
                        continue
                    values = attribute["values"]
                    for value in values:
                        if value["selectable"]:
                            sv_data = json.loads(
                                session.get(value["url"]).text)
                            svas = sv_data[
                                "product"]["variationAttributes"]
                            for sva in svas:
                                if sva["displayName"] != "Color":
                                    continue
                                for v in sva["values"]:
                                    if v["selected"]:
                                        v_name = "{} {} ({})".format(
                                            name, value["displayValue"],
                                            v["displayValue"])
                                        v_sku = "{}-{}".format(
                                            sku, sv_data["product"][
                                                "selectedVariantID"])
                                        vis = sv_data[
                                            "product"]["images"]["large"]
                                        vpu = [i["url"] for i in vis]
                                        products.append(Product(
                                            v_name,
                                            cls.__name__,
                                            category,
                                            url,
                                            url,
                                            v_sku,
                                            stock,
                                            normal_price,
                                            offer_price,
                                            'CLP',
                                            sku=v_sku,
                                            description=description,
                                            picture_urls=vpu,
                                            condition=condition))

            return products
        else:
            add_to_cart_button = soup.find('button', 'add-to-cart')
            if 'AGOTADO' in add_to_cart_button.text.upper():
                stock = 0
            else:
                stock = -1

        p = Product(
            name,
            cls.__name__,
            category,
            url,
            url,
            sku,
            stock,
            normal_price,
            offer_price,
            'CLP',
            sku=sku,
            description=description,
            picture_urls=picture_urls,
            condition=condition,
            flixmedia_id=flixmedia_id,
            video_urls=video_urls
        )

        return [p]

    @classmethod
    def banners(cls, extra_args=None):
        sections_data = [
            [bs.HOME, 'Home', bs.SUBSECTION_TYPE_HOME,
             'https://www.lapolar.cl/']
        ]

        session = session_with_proxy(extra_args)
        banners = []

        for section, subsection, subsection_type, url in sections_data:
            response = session.get(url)
            soup = BeautifulSoup(response.text, 'html.parser')

            if subsection_type == bs.SUBSECTION_TYPE_HOME:
                with HeadlessChrome(images_enabled=True) as driver:
                    driver.set_window_size(1920, 1080)
                    driver.get(url)

                    pictures = []
                    banner_container = driver.find_element_by_class_name(
                        'slick-list')

                    controls = driver \
                        .find_element_by_class_name('slick-dots') \
                        .find_elements_by_tag_name('li')

                    for control in controls:
                        control.click()
                        time.sleep(2)
                        pictures.append(banner_container.screenshot_as_base64)

                    soup = BeautifulSoup(driver.page_source, 'html.parser')

                    images = soup.find('div', 'slick-track') \
                        .findAll('div', 'slick-slide')

                    images = [a for a in images if
                              'slick-cloned' not in a['class']]

                    assert len(images) == len(pictures)

                    for index, image in enumerate(images):
                        key = None
                        key_options = image.findAll('img', 'responsive_prod')

                        destination_urls = [d['href'] for d in
                                            image.findAll('a')]
                        destination_urls = list(set(destination_urls))

                        for key_option in key_options:
                            if 'llamado_logo_img' in key_option['class']:
                                continue
                            key = key_option['src']
                            break

                        if not key:
                            if not destination_urls:
                                continue
                            key = destination_urls[0]

                        banners.append({
                            'url': url,
                            'picture': pictures[index],
                            'destination_urls': destination_urls,
                            'key': key,
                            'position': index + 1,
                            'section': section,
                            'subsection': subsection,
                            'type': subsection_type
                        })
            elif subsection_type == bs.SUBSECTION_TYPE_CATEGORY_PAGE:
                iframe = soup.find('iframe', 'full')
                if iframe:
                    content = session.get(iframe['src'])
                    soup = BeautifulSoup(content.text, 'html.parser')
                    picture_base_url = 'https://www.lapolar.cl{}'
                else:
                    picture_base_url = url + '{}'

                images = soup.findAll('div', 'swiper-slide')

                if not images:
                    images = soup.findAll('div', 'item')

                for index, image, in enumerate(images):
                    picture = image.find('picture')
                    if not picture:
                        picture_url = picture_base_url.format(
                            image.find('img')['src'])
                    else:
                        picture_url = picture_base_url.format(
                            image.findAll('source')[-1]['srcset']
                        )
                    destination_urls = [image.find('a')['href']]

                    banners.append({
                        'url': url,
                        'picture_url': picture_url,
                        'destination_urls': destination_urls,
                        'key': picture_url,
                        'position': index + 1,
                        'section': section,
                        'subsection': subsection,
                        'type': subsection_type
                    })
        return banners
