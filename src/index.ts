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
		const fullPage = req.query.full === 'yes';
		const browser = await puppeteer.launch({
			executablePath: '/usr/bin/chromium-browser',
			args: ['--no-sandbox', '--disable-dev-shm-usage', '--shm-size=3gb']
		});
		const page = await browser.newPage();

		page.setDefaultNavigationTimeout(0);
		await page.goto(url as string);
		await page.setViewport({ width, height });
		await page.waitForTimeout(2500);

		const ss = await page.screenshot({ fullPage });

		await page.close();
		await browser.close();

		res.type('png').status(200).send(ss);
	} catch (e) {
		res.status(500).send(e);
	}
});

app.listen(process.env.PORT);
