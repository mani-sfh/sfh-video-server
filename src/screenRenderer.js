import puppeteer from 'puppeteer';
import { getScreenHTML } from './screenTemplates.js';

let sharedBrowser = null;
let browserRefCount = 0;
let sharedPage = null;

export async function initBrowser() {
  if (!sharedBrowser) {
    sharedBrowser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--allow-file-access-from-files',
        '--disable-web-security'
      ]
    });
    console.log('Puppeteer browser launched');
  }
  browserRefCount++;
  return sharedBrowser;
}

export async function closeBrowser() {
  browserRefCount--;
  if (browserRefCount <= 0 && sharedBrowser) {
    sharedPage = null;
    await sharedBrowser.close();
    sharedBrowser = null;
    browserRefCount = 0;
    console.log('Puppeteer browser closed');
  }
}

async function getReusablePage(dimensions) {
  if (!sharedPage) {
    const browser = sharedBrowser || await initBrowser();
    sharedPage = await browser.newPage();
  }
  await sharedPage.setViewport({
    width: dimensions.width,
    height: dimensions.height,
    deviceScaleFactor: 2
  });
  return sharedPage;
}

export async function renderScreenToImage({ type, data, dimensions, outputPath }) {
  const page = await getReusablePage(dimensions);
  const html = getScreenHTML(type, data, dimensions);

  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.evaluateHandle('document.fonts.ready');

  const hasImages = await page.evaluate(() => document.querySelectorAll('img').length > 0);
  if (hasImages) {
    await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return Promise.all(
        imgs.map(img =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.onload = resolve;
                img.onerror = resolve;
              })
        )
      );
    });
  }

  const jpegPath = outputPath.replace(/\.png$/, '.jpg');
  await page.screenshot({
    path: jpegPath,
    type: 'jpeg',
    quality: 95,
    clip: { x: 0, y: 0, width: dimensions.width, height: dimensions.height }
  });

  return jpegPath;
}
