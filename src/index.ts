import { authorization } from './middlewares/authorization';
import adblocker from 'puppeteer-extra-plugin-adblocker';
import stealth from 'puppeteer-extra-plugin-stealth';
import { checkNsfw } from './middlewares/checkNsfw';
import puppeteer from 'puppeteer-extra';
import compression from 'compression';
import express from 'express';
import helmet from 'helmet';
import Redis from 'ioredis';

process.setMaxListeners(Infinity);

const app = express();
const redis = new Redis(process.env.REDIS_URL!);

puppeteer.use(adblocker());
puppeteer.use(stealth());

app.use(express.json());
app.use(helmet());
app.use(compression({ level: 9 }));
app.use(authorization);
app.set('json spaces', 4);

app.get('/', checkNsfw, async (req, res) => {
	const browser = await puppeteer.launch({
		executablePath: '/usr/bin/chromium-browser',
		args: ['--no-sandbox', '--disable-dev-shm-usage', '--shm-size=3gb']
	});

	try {
		const { url } = req.query;
		const width = req.query.width ? Number(req.query.width) : 1920;
		const height = req.query.height ? Number(req.query.height) : 1080;
		const fullPage = req.query.full === 'yes';
		const rkey = fullPage ? `${url}-full` : (url as string);
		const inCache = await redis.getBuffer(rkey).catch(() => null);

		if (inCache) return res.type('png').status(200).send(inCache);

		const page = await browser.newPage();

		page.setDefaultNavigationTimeout(0);
		await page.goto(url as string);
		await page.setViewport({ width, height });
		await page.waitForTimeout(2500);

		const ss = await page.screenshot({ fullPage });

		await page.close();
		await browser.close();
		await redis.setex(rkey, 604800, ss);

		return res.type('png').status(200).send(ss);
	} catch (e) {
		await browser.close();
		return res.status(500).send(e.message);
	}
});

app.listen(process.env.PORT);

export { redis };
