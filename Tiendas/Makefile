run:
	pm2 start bottelegram.js 
	
	pm2 start getUrls.py --name "getUrls-Lider" --interpreter=python3 -- Lider
	pm2 start getUrls.py --name "getUrls-AbcDin" --interpreter=python3 -- AbcDin
	pm2 start getUrls.py --name "getUrls-Paris" --interpreter=python3 -- Paris
	pm2 start Monitor.py --name "Monitor-Lider" --interpreter=python3 -- Lider
	pm2 start Monitor.py --name "Monitor-AbcDin" --interpreter=python3 -- AbcDin
	pm2 start Monitor.py --name "Monitor-Paris" --interpreter=python3 -- Paris
