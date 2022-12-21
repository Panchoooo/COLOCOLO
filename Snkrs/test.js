const fetch = require("node-fetch");
const express = require("express");
var request = require('request');
const delay = ms => new Promise(res => setTimeout(res, ms));
var portbot = 4000;
var flag_nombre = false;

var last_date = "Sin fecha";
var last_fecha = "Sin fecha";
var nombre_producto = "";
var monitor =  -1;
var puerto = 6000;
var skus = [];
var carrito = [];
var ips = [ "http://franciscoo.ddns.net:8000","http://nikemonitor.ddns.net:8000"]
var skus = [
  /*73281,
  73284,
  73272,
  73283,
  73276,
  73278,
  73273,
  73277,
  73282,
  73279,
  73275,
  73280,
  73285,
  73274*/
];



async function add(sku,cookie){
  let status; 
  return  await fetch("https://nikeclprod.myvtex.com/checkout/cart/add?sku="+sku+"&qty=1&seller=1&redirect=false&sc=1", {
    "headers": {
      "accept": "*/*",
      "accept-language": "es-ES,es;q=0.9",
      "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "VTEXSC=sc=1; ISSMB=ScreenMedia=0&UserAcceptMobile=False; __cf_bm=byALTxiGWAgHcVj5myTxUIn8Ff_5iMF0Z8g1gZBe0Qs-1671609190-0-AYlp2u7NWwGhsu4EGcWIe7yy1fWsz9MOQWBQNCTO577pxKIYEo8QifyUM6YRpu4k3+zlbpdO1DAawlKG9oywPMvCFkvId+KwzSAJbNYQ2+mY; VtexRCSessionIdv7=82081975-abcf-418b-adc0-3d8982e0e0af; _gcl_au=1.1.230227777.1671609192; _gid=GA1.2.1775711552.1671609192; checkout.vtex.com=__ofid="+cookie+"; janus_sid=9bf74326-3058-4750-976b-25b4732da334; _clck=1t1jovx|1|f7l|0; VtexRCMacIdv7=3277b34c-a668-40e8-be83-afebeceba79b; _fbp=fb.1.1671609193555.1320889555; VtexWorkspace=master%3A-; .ASPXAUTH=09DE913AD9CA0F7491FC30694354D57836F48349984EE2713C997AF9B850CBA6A374273981D6FADF92F88CFCE4EF9053B72DAB52252A78AB1A32227261BB196E2244E9F1D87E0EB0AEB7B3BD026F154A5E07667000C6B233E38A4A7946EBDFF9F8C99BA3A8E1659A24B0E7E944FCB3646618A0C19A5DFA7DE09B81B10E0B69FCC890D51757FA42AD9FBE64D71EEC80EE61A858CAF8A247E9FC99221AC0EBF9DB4B9E3C2B; _hjFirstSeen=1; _hjIncludedInSessionSample=0; _hjSession_198829=eyJpZCI6IjJhMWJmZTk3LTU3ODAtNDg3Mi1iZGExLWRhNGM5ODI2Yzk4ZCIsImNyZWF0ZWQiOjE2NzE2MDkxOTQyODEsImluU2FtcGxlIjpmYWxzZX0=; _hjAbsoluteSessionInProgress=0; _fw_crm_v=758b20ba-fa7e-4b79-8ab8-e3bf638d4d65; joe-chnlcustid=e41bf157-066a-4c4f-91d2-bb7b0760147d; _hjSessionUser_198829=eyJpZCI6Ijk3OGQzZTRlLTIyMjgtNTcxZS1iM2FkLTE1ZTNkY2I0YjZjMSIsImNyZWF0ZWQiOjE2NzE2MDkxOTQyNDUsImV4aXN0aW5nIjp0cnVlfQ==; SGTS=7E2E221D28038CE76BBC9B2EE9225AF7; blueID=17f12995-3df0-47d9-9463-c513a49f4340; VtexIdclientAutCookie_nikeclprod=eyJhbGciOiJFUzI1NiIsImtpZCI6IkQ5Rjg3MjZDOUVBQ0Q4ODA2NDFBMzBBNENCRjRDM0ZGMTkwNUVEMjUiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJkaWVnb2hlLmRoQGdtYWlsLmNvbSIsImFjY291bnQiOiJuaWtlY2xwcm9kIiwiYXVkaWVuY2UiOiJ3ZWJzdG9yZSIsInNlc3MiOiI3NGE4YTk0Mi04NDViLTQ2ODMtOTQ2MS03YjNiMDUyZjUxNjIiLCJleHAiOjE2NzE2OTU3NzgsInVzZXJJZCI6IjhkM2MyZmZlLTk0NzktNDRhYi1hMzRhLTJhMzAwZTdmZTYyYSIsImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjEyY2ZkZmNmLWMyMWUtNDE0Zi04ZjljLTJkMTUzZDNjMjk5YSJ9.k2XfNsWP_LIFKqyX4NQGkKuX9f1XoRE87zo5WlWr_3yrdtVNsEjAoooFva4RM37L4ryKnYQViCjEQO7tw0fRoA; VtexIdclientAutCookie_461d783e-3521-49e0-8222-8f5b3f9e2907=eyJhbGciOiJFUzI1NiIsImtpZCI6IkQ5Rjg3MjZDOUVBQ0Q4ODA2NDFBMzBBNENCRjRDM0ZGMTkwNUVEMjUiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJkaWVnb2hlLmRoQGdtYWlsLmNvbSIsImFjY291bnQiOiJuaWtlY2xwcm9kIiwiYXVkaWVuY2UiOiJ3ZWJzdG9yZSIsInNlc3MiOiI3NGE4YTk0Mi04NDViLTQ2ODMtOTQ2MS03YjNiMDUyZjUxNjIiLCJleHAiOjE2NzE2OTU3NzgsInVzZXJJZCI6IjhkM2MyZmZlLTk0NzktNDRhYi1hMzRhLTJhMzAwZTdmZTYyYSIsImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjEyY2ZkZmNmLWMyMWUtNDE0Zi04ZjljLTJkMTUzZDNjMjk5YSJ9.k2XfNsWP_LIFKqyX4NQGkKuX9f1XoRE87zo5WlWr_3yrdtVNsEjAoooFva4RM37L4ryKnYQViCjEQO7tw0fRoA; vtex_session=eyJhbGciOiJFUzI1NiIsImtpZCI6IkVDRTBEREMzMTkyRTdFQzgxQkU0RDg3QTRDQjY4NDNGQTQ0M0M2OTgiLCJ0eXAiOiJqd3QifQ.eyJhY2NvdW50LmlkIjoiNDYxZDc4M2UtMzUyMS00OWUwLTgyMjItOGY1YjNmOWUyOTA3IiwiaWQiOiJkNjUxZDAyNS05NTFkLTQxOGYtOTliOC02OGYwZmU0ODgxNmIiLCJ2ZXJzaW9uIjozLCJzdWIiOiJzZXNzaW9uIiwiYWNjb3VudCI6InNlc3Npb24iLCJleHAiOjE2NzIzMDA1NzksImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjU2NGExYjgwLTc1ZGYtNDI4ZS1iYzE5LTI2ZmY4YmFlYmVkYiJ9.DYEuoY2c1ep8ZUyG08NOLGcduccRsznahqu_p7r7cvp3E3CLdShzVKhOHklCFlac0EaozGzT5CK5czRkRsSL_g; vtex_segment=eyJjYW1wYWlnbnMiOm51bGwsImNoYW5uZWwiOiIxIiwicHJpY2VUYWJsZXMiOm51bGwsInJlZ2lvbklkIjpudWxsLCJ1dG1fY2FtcGFpZ24iOm51bGwsInV0bV9zb3VyY2UiOm51bGwsInV0bWlfY2FtcGFpZ24iOm51bGwsImN1cnJlbmN5Q29kZSI6IkNMUCIsImN1cnJlbmN5U3ltYm9sIjoiJCIsImNvdW50cnlDb2RlIjoiQ0hMIiwiY3VsdHVyZUluZm8iOiJlcy1DTCIsImFkbWluX2N1bHR1cmVJbmZvIjoiZXMtQ0wiLCJjaGFubmVsUHJpdmFjeSI6InB1YmxpYyJ9; IPI=UsuarioGUID=8d3c2ffe-9479-44ab-a34a-2a300e7fe62a&UrlReferrer=https%3a%2f%2fwww.google.com%2f; nike_UserData=%7B%22UserId%22%3A%228d3c2ffe-9479-44ab-a34a-2a300e7fe62a%22%2C%22IsReturningUser%22%3Afalse%2C%22IsUserDefined%22%3Atrue%2C%22IsPJ%22%3Afalse%2C%22FirstName%22%3A%22Diego%22%2C%22LastName%22%3A%22Herrera%22%2C%22Gender%22%3A%22masculino%22%2C%22Email%22%3A%22diegohe.dh@gmail.com%22%7D; validatedLogin=true; nike_WishList={\"dunk\":{\"name\":\"dunk\",\"products\":[144]}}; i18next=es; locale=es-CL; nike_UserData_Prods={\"added\":[7595],\"saved\":[642,2287,2288,2300,2252,2246,3680,5560,5909,7385,6198,7447]}; cto_bundle=SyW0EF9HajVITnN4Z3R1R2FkOVNFS01RYUdBcTRMTkE2N21YTiUyRm02VnNjemNpM3dJdHZSbTdSTG1JMjJpRUxzdk5zMFlhTjdLTHVQb3pUYkg1YyUyRkljM0N1YSUyRlJoUU1UTThMdlFBWXR4NThaMUtDZjhDWnNDeERKb00lMkZnaVU0byUyQnZDankwMDFrTmtISVEyTk1VQngwWmpwdkVRJTNEJTNE; _ga_Y8C1V760ZG=GS1.1.1671609192.1.1.1671610010.4.0.0; _ga=GA1.1.1640312158.1671609192; _clsk=1jkivyv|1671610608743|27|0|k.clarity.ms/collect",
      "Referer": "https://www.nike.cl/dv3464-300-air-force-1-low-sp/p",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": null,
    "method": "GET"
  }).then((res) => { 
    status = res.status; 
    return status 
  })
  .catch((err) => {
    // handle error
    console.error(err);
  });;
}

async function check(cookie){
  let status; 
  return await fetch("https://nikeclprod.myvtex.com/api/checkout/pub/orderForm/"+cookie+"?refreshOutdatedData=true", {
    "headers": {
      "accept": "application/json, text/javascript, */*; q=0.01",
      "accept-language": "es-ES,es;q=0.9",
      "content-type": "application/json; charset=UTF-8",
      "sec-ch-ua": "\"Not?A_Brand\";v=\"8\", \"Chromium\";v=\"108\", \"Google Chrome\";v=\"108\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-requested-with": "XMLHttpRequest",
      "cookie": "VTEXSC=sc=1; ISSMB=ScreenMedia=0&UserAcceptMobile=False; __cf_bm=byALTxiGWAgHcVj5myTxUIn8Ff_5iMF0Z8g1gZBe0Qs-1671609190-0-AYlp2u7NWwGhsu4EGcWIe7yy1fWsz9MOQWBQNCTO577pxKIYEo8QifyUM6YRpu4k3+zlbpdO1DAawlKG9oywPMvCFkvId+KwzSAJbNYQ2+mY; VtexRCSessionIdv7=82081975-abcf-418b-adc0-3d8982e0e0af; _gcl_au=1.1.230227777.1671609192; _gid=GA1.2.1775711552.1671609192; checkout.vtex.com=__ofid="+cookie+"; janus_sid=9bf74326-3058-4750-976b-25b4732da334; _clck=1t1jovx|1|f7l|0; VtexRCMacIdv7=3277b34c-a668-40e8-be83-afebeceba79b; _fbp=fb.1.1671609193555.1320889555; VtexWorkspace=master%3A-; .ASPXAUTH=09DE913AD9CA0F7491FC30694354D57836F48349984EE2713C997AF9B850CBA6A374273981D6FADF92F88CFCE4EF9053B72DAB52252A78AB1A32227261BB196E2244E9F1D87E0EB0AEB7B3BD026F154A5E07667000C6B233E38A4A7946EBDFF9F8C99BA3A8E1659A24B0E7E944FCB3646618A0C19A5DFA7DE09B81B10E0B69FCC890D51757FA42AD9FBE64D71EEC80EE61A858CAF8A247E9FC99221AC0EBF9DB4B9E3C2B; _hjFirstSeen=1; _hjIncludedInSessionSample=0; _hjSession_198829=eyJpZCI6IjJhMWJmZTk3LTU3ODAtNDg3Mi1iZGExLWRhNGM5ODI2Yzk4ZCIsImNyZWF0ZWQiOjE2NzE2MDkxOTQyODEsImluU2FtcGxlIjpmYWxzZX0=; _hjAbsoluteSessionInProgress=0; _fw_crm_v=758b20ba-fa7e-4b79-8ab8-e3bf638d4d65; joe-chnlcustid=e41bf157-066a-4c4f-91d2-bb7b0760147d; _hjSessionUser_198829=eyJpZCI6Ijk3OGQzZTRlLTIyMjgtNTcxZS1iM2FkLTE1ZTNkY2I0YjZjMSIsImNyZWF0ZWQiOjE2NzE2MDkxOTQyNDUsImV4aXN0aW5nIjp0cnVlfQ==; SGTS=7E2E221D28038CE76BBC9B2EE9225AF7; blueID=17f12995-3df0-47d9-9463-c513a49f4340; VtexIdclientAutCookie_nikeclprod=eyJhbGciOiJFUzI1NiIsImtpZCI6IkQ5Rjg3MjZDOUVBQ0Q4ODA2NDFBMzBBNENCRjRDM0ZGMTkwNUVEMjUiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJkaWVnb2hlLmRoQGdtYWlsLmNvbSIsImFjY291bnQiOiJuaWtlY2xwcm9kIiwiYXVkaWVuY2UiOiJ3ZWJzdG9yZSIsInNlc3MiOiI3NGE4YTk0Mi04NDViLTQ2ODMtOTQ2MS03YjNiMDUyZjUxNjIiLCJleHAiOjE2NzE2OTU3NzgsInVzZXJJZCI6IjhkM2MyZmZlLTk0NzktNDRhYi1hMzRhLTJhMzAwZTdmZTYyYSIsImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjEyY2ZkZmNmLWMyMWUtNDE0Zi04ZjljLTJkMTUzZDNjMjk5YSJ9.k2XfNsWP_LIFKqyX4NQGkKuX9f1XoRE87zo5WlWr_3yrdtVNsEjAoooFva4RM37L4ryKnYQViCjEQO7tw0fRoA; VtexIdclientAutCookie_461d783e-3521-49e0-8222-8f5b3f9e2907=eyJhbGciOiJFUzI1NiIsImtpZCI6IkQ5Rjg3MjZDOUVBQ0Q4ODA2NDFBMzBBNENCRjRDM0ZGMTkwNUVEMjUiLCJ0eXAiOiJqd3QifQ.eyJzdWIiOiJkaWVnb2hlLmRoQGdtYWlsLmNvbSIsImFjY291bnQiOiJuaWtlY2xwcm9kIiwiYXVkaWVuY2UiOiJ3ZWJzdG9yZSIsInNlc3MiOiI3NGE4YTk0Mi04NDViLTQ2ODMtOTQ2MS03YjNiMDUyZjUxNjIiLCJleHAiOjE2NzE2OTU3NzgsInVzZXJJZCI6IjhkM2MyZmZlLTk0NzktNDRhYi1hMzRhLTJhMzAwZTdmZTYyYSIsImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjEyY2ZkZmNmLWMyMWUtNDE0Zi04ZjljLTJkMTUzZDNjMjk5YSJ9.k2XfNsWP_LIFKqyX4NQGkKuX9f1XoRE87zo5WlWr_3yrdtVNsEjAoooFva4RM37L4ryKnYQViCjEQO7tw0fRoA; vtex_session=eyJhbGciOiJFUzI1NiIsImtpZCI6IkVDRTBEREMzMTkyRTdFQzgxQkU0RDg3QTRDQjY4NDNGQTQ0M0M2OTgiLCJ0eXAiOiJqd3QifQ.eyJhY2NvdW50LmlkIjoiNDYxZDc4M2UtMzUyMS00OWUwLTgyMjItOGY1YjNmOWUyOTA3IiwiaWQiOiJkNjUxZDAyNS05NTFkLTQxOGYtOTliOC02OGYwZmU0ODgxNmIiLCJ2ZXJzaW9uIjozLCJzdWIiOiJzZXNzaW9uIiwiYWNjb3VudCI6InNlc3Npb24iLCJleHAiOjE2NzIzMDA1NzksImlhdCI6MTY3MTYwOTM3OSwiaXNzIjoidG9rZW4tZW1pdHRlciIsImp0aSI6IjU2NGExYjgwLTc1ZGYtNDI4ZS1iYzE5LTI2ZmY4YmFlYmVkYiJ9.DYEuoY2c1ep8ZUyG08NOLGcduccRsznahqu_p7r7cvp3E3CLdShzVKhOHklCFlac0EaozGzT5CK5czRkRsSL_g; vtex_segment=eyJjYW1wYWlnbnMiOm51bGwsImNoYW5uZWwiOiIxIiwicHJpY2VUYWJsZXMiOm51bGwsInJlZ2lvbklkIjpudWxsLCJ1dG1fY2FtcGFpZ24iOm51bGwsInV0bV9zb3VyY2UiOm51bGwsInV0bWlfY2FtcGFpZ24iOm51bGwsImN1cnJlbmN5Q29kZSI6IkNMUCIsImN1cnJlbmN5U3ltYm9sIjoiJCIsImNvdW50cnlDb2RlIjoiQ0hMIiwiY3VsdHVyZUluZm8iOiJlcy1DTCIsImFkbWluX2N1bHR1cmVJbmZvIjoiZXMtQ0wiLCJjaGFubmVsUHJpdmFjeSI6InB1YmxpYyJ9; IPI=UsuarioGUID=8d3c2ffe-9479-44ab-a34a-2a300e7fe62a&UrlReferrer=https%3a%2f%2fwww.google.com%2f; nike_UserData=%7B%22UserId%22%3A%228d3c2ffe-9479-44ab-a34a-2a300e7fe62a%22%2C%22IsReturningUser%22%3Afalse%2C%22IsUserDefined%22%3Atrue%2C%22IsPJ%22%3Afalse%2C%22FirstName%22%3A%22Diego%22%2C%22LastName%22%3A%22Herrera%22%2C%22Gender%22%3A%22masculino%22%2C%22Email%22%3A%22diegohe.dh@gmail.com%22%7D; validatedLogin=true; nike_WishList={\"dunk\":{\"name\":\"dunk\",\"products\":[144]}}; i18next=es; _gat_UA-207294747-1=1; locale=es-CL; _clsk=1jkivyv|1671609702194|15|0|k.clarity.ms/collect; cto_bundle=jPcmnl9HajVITnN4Z3R1R2FkOVNFS01RYUdKUHMwMWYwenVXS2diajR5Zjhjc1A3VFQwdlN6dkpmWTY0SVF1dEV6VzU5RkhRSkE2WVdSeEdTaUpla2F3ZjdGYldEdWNvOFU2M1dNUVlnTCUyRkt0eVhsZEJGQUElMkJDQUJzYmNkRmtjZGJXQmJVT0RseFVpVkJ5RXBYRXViSml0bnZnJTNEJTNE; nike_UserData_Prods={\"added\":[],\"saved\":[642,2287,2288,2300,2252,2246,3680,5560,5909,7385,6198,7447]}; _ga=GA1.2.1640312158.1671609192; _ga_Y8C1V760ZG=GS1.1.1671609192.1.1.1671609711.1.0.0",
      "Referer": "https://www.nike.cl/dv3464-300-air-force-1-low-sp/p",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": "{\"expectedOrderFormSections\":[\"items\",\"totalizers\",\"clientProfileData\",\"shippingData\",\"paymentData\",\"sellers\",\"messages\",\"marketingData\",\"clientPreferencesData\",\"storePreferencesData\",\"giftRegistryData\",\"ratesAndBenefitsData\",\"openTextField\",\"commercialConditionData\",\"customData\"]}",
    "method": "POST"
  }).then((res) => { 
    status = res.status; 
    return res.json() 
  })
  .catch((err) => {
    // handle error
    console.error(err);
  });


}


async function iniciar(cookie){

  for(var i = 0 ; i < skus.length ; i++){
    while( await add(skus[i],cookie) != 200 ){
      await add(skus[i],cookie)
    };
  }

}

async function CheckCarro(cookie){

  await add(0,cookie)
  var json =await check(cookie);
  var items = json["items"]
  var carro_aux = [];
  var flag_aviso = 0;

  for(var i = 0 ; i < items.length ; i++){
    var name = json["items"][i]["name"];
    var sku = json["items"][i]["id"];
    if(json["items"][i]["availability"] == "available"){
      flag_aviso = 1;
      carro_aux.push([name,true,sku]);
      enviarMSJ(name,sku);
    }else{
      carro_aux.push([name,false,sku]);
    }
  }

  if(flag_aviso  == 1  ){
      OpenRequest(carro_aux);
      flag_aviso = 0;
  }
  last_fecha = getDate();
  //console.log(last_fecha)
  carrito = carro_aux;
  return 1;
}

(async () => {

  var cookie = "ee17e10f16104797af25dc60b946da80";

  //await iniciar(cookie);
  var end = 0;

  console.log("Iniciando lectura... ")
  while(end != -1){
      try {
          result = await CheckCarro(cookie);
      } catch (error) {
          await delay(1000)
          console.log("Error general",error)  ;
      }
  }

})();









const app = express();
app.set("port", process.env.PORT || puerto);

app.get("/", (req, res) => {
    res.send('Hello World');
});
app.get("/get", (req, res) => {
    res.send("Monitor "+monitor+" | Ultimo monitoreo: "+ last_date);
});
app.get("/getCarrito", (req, res) => {
    console.log(carrito)
    var msj = "Monitor "+monitor+" | Ultima fecha: "+last_fecha+"\nNombre: "+nombre_producto+"\n";
    carrito.forEach(element => {
        var elemento = element;
        msj += 'Producto: <b>'+elemento[0]+'</b> | SKU: '+elemento[2]+' | <a href="'+crearURL(elemento[2],1)+'"><b>Comprar</b></a>\n'
    });
    res.send(msj);
});
app.get("/apagar", (req, res) => {
    process.exit(0)
});
app.listen(app.get("port"), () => 
  console.log("app running on port", app.get("port"))
);





function getDate(){
  let date_ob = new Date();
  let date = ("0" + date_ob.getDate()).slice(-2);
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let year = date_ob.getFullYear();
  let hours = date_ob.getHours();
  let minutes = date_ob.getMinutes();
  let seconds = date_ob.getSeconds();
  last_date = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
  return last_date;
}

async function enviarMSJ(nombre,sku){
  var options = null;
  try {
      if(nombre == null || nombre == ""){
          nombre = nombre_producto;
      }
      
      if(nombre.includes("/")){
          nombre = nombre.split("/","")
          nombre = nombre.join("")
      }
      

      if(flag_nombre == true){
            options = {
              'method': 'GET',
              'url': 'http://localhost:'+portbot+'/send/'+monitor+'/'+nombre_producto+'/'+sku,
              'headers': {
              }
          };
      }        
      if(flag_nombre == false){
            options = {
              'method': 'GET',
              'url': 'http://localhost:'+portbot+'/send/'+monitor+'/'+nombre+'/'+sku,
              'headers': {
              }
          };
      }
      request(options, function (error, response) {
          if (error){
              console.log(error)
          }else{
              console.log(response.body);
          }   
      });
  } catch (error) {
      console.log(error)
  }
}

function OpenRequest(skus){

  var skustxt;
  var carrotrue = [];
  for(var j = 0 ; j < skus.length ; j++){
      if(skus[j][1] == true){
          carrotrue.push(skus[j][2])
      }
  }
  skustxt = carrotrue.join(";");
  console.log("Enviando solicitud ! | " + skustxt)
  for(var i = 0 ; i < ips.length ; i ++){
      var options = {
          'method': 'GET',
          'url': ips[i]+'/open/'+skustxt,
          'headers': {
          }
      };

      request(options, function (error, response) {
          if (error){
              console.log(error)
          }else{
              console.log(response.body);
          }   
      });  


  }
}


function crearURL(sku,cantidad){
  return "https://nike.cl/checkout/cart/add?sku="+sku+"&qty="+cantidad+"&seller=1&redirect=false&sc=1";
}