const puppeteer = require('puppeteer');

async function falabellaPrices(producto) {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto("https://www.falabella.com.co/falabella-co/");
    await page.waitForSelector("#testId-SearchBar-Input");
    const searchBar = await page.$("#testId-SearchBar-Input");
    await searchBar.type(producto);
    await page.keyboard.press("Enter");
    await page.waitForNavigation();

    const values = await page.$$("span.copy10.primary.medium.jsx-3451706699.normal.line-height-22");
    const titles = await page.$$(".subTitle-rebrand");
    const imgs = await page.$$("picture.jsx-1996933093 img");
    const links = await page.$$("a.pod-link");

    const valuesText = await Promise.all(values.map(async element => {
        return await page.evaluate(el => el.textContent.trim(), element);
    }));

    const titlesText = await Promise.all(titles.map(async element => {
        return await page.evaluate(el => el.textContent.trim(), element);
    }));

    const imgsSrc = await Promise.all(imgs.map(async element => {
        return await page.evaluate(el => el.getAttribute("src"), element);
    }));

    const linksSrc = await Promise.all(links.map(async element => {
        return await page.evaluate(el => el.getAttribute("href"), element);
    }));

    let products = [];
    for (let i = 0; i < Math.min(5, titlesText.length); i++) {
        products.push({
            title: titlesText[i],
            price: valuesText[i],
            img: imgsSrc[i],
            link: linksSrc[i],
            store: 'Falabella'
        });
    }

    products.sort((a, b) => parseFloat(a.price.replace(/[^0-9.,]/g, "")) - parseFloat(b.price.replace(/[^0-9.,]/g, "")));
    products = products.slice(0, 3);

    let html = "";
    for (let product of products) {
        html += '<div class=results>';
        html += "<img src= " + product.img + "></img>";
        html += "<h4>" + product.title + "</h4>";
        html += "<p>" + product.price + "</p>";
        html += "<p>Tienda: " + product.store + "</p>";
        html += "<button onclick='location.href=\"" + product.link + "\"'>Compra Aqui</button>";
        html += "</div>";
    }

    await browser.close();
    return html;
}

module.exports = falabellaPrices
