import adblocker from 'puppeteer-extra-plugin-adblocker';
import stealth from 'puppeteer-extra-plugin-stealth';
import puppeteer from 'puppeteer-extra';
import express from 'express';
import helmet from 'helmet';

const app = express();

puppeteer.use(adblocker());
puppeteer.use(stealth());

app.use(express.json());
app.use(helmet());
app.set('json spaces', 4);

app.get('/', async (req, res) => {
	try {
		const { url } = req.query;
		const width = req.query.width ? Number(req.query.width) : 1920;
		const height = req.query.height ? Number(req.query.height) : 1080;
		const fullPage = Boolean(req.query.full);
		const browser = await puppeteer.launch({ executablePath: '/usr/bin/chromium-browser', args: ['--no-sandbox'] });
		const page = await browser.newPage();

		await page.goto(url as string, { waitUntil: 'networkidle0' });
		await page.setViewport({ width, height });

		const ss = await page.screenshot({ fullPage });

		res.type('png').status(200).send(ss);
	} catch {
		res.sendStatus(500);
	}
});

app.listen(process.env.PORT);
