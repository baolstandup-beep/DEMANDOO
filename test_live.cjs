const puppeteer = require('puppeteer-core');
(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      headless: 'new'
    });
    const page = await browser.newPage();
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.toString()));
    
    await page.goto('https://demandoo-kappa.vercel.app/');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
    console.log('Done.');
  } catch(e) {
    console.log("Failed:", e);
  }
})();
