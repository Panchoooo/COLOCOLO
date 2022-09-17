run:
	git pull
	pm2 delete all
	
	pm2 start bottelegram.js  --name "Telegram Free" -- 1
	pm2 start bottelegram.js  --name "Telegram Vip" -- 2
	pm2 start bottelegram.js  --name "Telegram Config" -- 3
	pm2 start ./tiendas/Paris.js
	pm2 start ./tiendas/Lider.js
	pm2 start ./tiendas/Ripley.js

	pm2 monit