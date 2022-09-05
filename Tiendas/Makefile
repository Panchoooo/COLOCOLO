run:
	pm2 start node bottelegram.js 
	
	pm2 start getUrls --interpreter=python3 -- Lider
	pm2 start getUrls --interpreter=python3 -- AbcDin
	pm2 start getUrls --interpreter=python3 -- Hites
	pm2 start getUrls --interpreter=python3 -- Paris
	pm2 start getUrls --interpreter=python3 -- LaPolar
	
	pm2 start Monitor --interpreter=python3 -- Lider
	pm2 start Monitor --interpreter=python3 -- AbcDin
	pm2 start Monitor --interpreter=python3 -- Hites
	pm2 start Monitor --interpreter=python3 -- Paris
	pm2 start Monitor --interpreter=python3 -- LaPolar
