const puppeteer = require('puppeteer');

async function exitoPrices(Product) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.exito.com/");
    const searchBar = await page.$('[data-testid="store-input"]');
    await searchBar.type(Product);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    await page.waitForSelector("p.ProductPrice_container__price__XmMWA");

    const values = await page.$$("p.ProductPrice_container__price__XmMWA");
    const titles = await page.$$('a[data-testid="product-link"][title]');
    const imgs = await page.$$(".imagen_plp");
    const links = await page.$$('a[data-testid="product-link"]');

    let products = [];
    for (let i = 0; i < Math.min(5, titles.length); i++) {
        const title = await page.evaluate(el => el.textContent.trim(), titles[i]);
        const priceText = await page.evaluate(el => el.textContent.trim(), values[i]);
        const priceNumber = parseInt(priceText.replace(/\D/g, ''));
        const img = await page.evaluate(el => el.getAttribute("src"), imgs[i]);
        const elementlink = await page.evaluate(el => el.getAttribute("href"), links[i]);

        products.push({
            title: title,
            priceText: priceText,
            priceNumber: priceNumber,
            img: img,
            link: "https://www.exito.com/" + elementlink,
            store: 'Éxito'
        });
    }

    // Sort by price (lowest first)
    products.sort((a, b) => a.priceNumber - b.priceNumber);

    let html = "";
    for (let i = 0; i < Math.min(3, products.length); i++) {
        const product = products[i];
        html += '<div class="results">';
        html += `<img src="${product.img}"></img>`;
        html += `<h4>${product.title}</h4>`;
        html += `<p>${product.priceText}</p>`;
        html += `<p>Tienda: ${product.store}</p>`;
        html += `<button onclick="location.href='${product.link}'">Compra Aquí</button>`;
        html += '</div>';
    }

    await browser.close();
    return html;
}

module.exports = exitoPrices;
