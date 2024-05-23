const puppeteer = require('puppeteer');

async function mercadoLibrePrices(producto) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.mercadolibre.com.co/");
    await page.waitForSelector('.nav-search-input');
    const searchBar = await page.$('.nav-search-input');
    const searchButton = await page.$('.nav-search-btn');
    await searchBar.type(producto);
    await searchButton.click();
    await page.waitForSelector('[title="Nuevo"]');
    const newItem = await page.$('[title="Nuevo"]');
    await newItem.click();
    await page.waitForSelector('.andes-dropdown__trigger');
    const filter = await page.$('.andes-dropdown__trigger');
    await filter.click();
    await page.waitForSelector('.andes-money-amount__fraction');
  
    const values = await page.$$('.ui-search-price__part--medium');
    const titles = await page.$$('.ui-search-item__title');
    const imgs = await page.$$('.ui-search-result-image__element');
    const links = await page.$$('.ui-search-item__group__element.ui-search-link__title-card.ui-search-link');
  
    let products = [];
    for (let i = 0; i < Math.min(5, titles.length); i++) {
      const title = await page.evaluate(el => el.textContent.trim(), titles[i]);
      const priceText = await page.evaluate(el => el.textContent.trim(), values[i]);
      const priceNumber = parseInt(priceText.replace(/\D/g, ''));
      const img = await page.evaluate(el => el.getAttribute("src"), imgs[i]);
      const link = await page.evaluate(el => el.getAttribute("href"), links[i]);

      products.push({
        title: title,
        priceText: priceText,
        priceNumber: priceNumber,
        img: img,
        link: link,
        store: 'Mercado Libre'
      });
    }

    // Sort by price (lowest first)
    products.sort((a, b) => a.priceNumber - b.priceNumber);

    let html = "";
    for (let i = 0; i < Math.min(3, products.length); i++) {
      const product = products[i];
      html += '<div class=results>';
      html += "<img src= " + product.img + "></img>";
      html += "<h4>" + product.title + "</h4>";
      html += "<p>" + product.priceText + "</p>";
      html += "<p>Tienda: " + product.store + "</p>";
      html += "<button onclick='location.href=\"" + product.link + "\"'>Compra Aqui</button>";
      html += "</div>";
    }
  
    await browser.close();
    return html;
}

module.exports = mercadoLibrePrices;
