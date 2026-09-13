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
    
    // Go to home first to set localStorage
    await page.goto('http://localhost:3001/');
    await page.evaluate(() => {
      localStorage.setItem('demandoo_user_v2', JSON.stringify({
        id: 'driver-123',
        role: 'driver',
        driver_status: 'VERIFIED',
        email: 'modou.diop@demandoo.sn'
      }));
      localStorage.setItem('demandoo_view_mode', 'driver');
    });
    
    // Now go to abonnement
    await page.goto('http://localhost:3001/abonnement');
    await new Promise(r => setTimeout(r, 2000));
    await browser.close();
    console.log('Done.');
  } catch(e) {
    console.log("Failed:", e);
  }
})();
