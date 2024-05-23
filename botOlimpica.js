const puppeteer = require('puppeteer');

async function olimpicaPrices(Producto) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.olimpica.com/");
    const searchBar = await page.$('input[id^="downshift-"][id$="-input"]');
    await searchBar.type(Producto);
    await page.keyboard.press("Enter");
    await page.waitForSelector(".vtex-product-price-1-x-sellingPrice--hasListPrice--dynamicF");

    const values = await page.$$('.vtex-product-price-1-x-sellingPrice--hasListPrice--dynamicF');
    const titles = await page.$$('span.vtex-product-summary-2-x-productBrand.vtex-product-summary-2-x-brandName.t-body');
    const links = await page.$$('a.vtex-product-summary-2-x-clearLink');
    const imgs = await page.$$('img.vtex-product-summary-2-x-imageNormal.vtex-product-summary-2-x-image.vtex-product-summary-2-x-mainImageHovered');

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
            link: "https://www.olimpica.com/" + link,
            store: 'Olimpica'
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

module.exports = olimpicaPrices;
