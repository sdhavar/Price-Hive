const { timeout } = require('puppeteer');
const puppeteer = require('puppeteer');

async function alkostoPrices(producto) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://www.alkosto.com//search?text=' + encodeURIComponent(producto) + '&sort=relevance' , { waitUntil: 'networkidle0' })
  await page.waitForSelector('li.ais-InfiniteHits-item.product__item.js-product-item.js-algolia-product-click');

  // Get all product elements
  const products = await page.$$('li.ais-InfiniteHits-item.product__item.js-product-item.js-algolia-product-click');

  let productInfo = [];
  for (let i = 0; i < Math.min(5, products.length); i++) {
    const product = products[i];

    // Extract the information from each product
    const title = await product.$eval('h3.js-algolia-product-title', el => el.textContent.trim());
    const priceText = await product.$eval('span.price', el => el.textContent.trim());
    const priceNumber = parseInt(priceText.replace(/\D/g, '')); // Remove non-digit characters
    const img = await product.$eval('div.product__item__information__image.js-algolia-product-click img', el => el.getAttribute("src"));
    const link = await product.$eval('a.js-algolia-product-click', el => el.getAttribute("href"));

    productInfo.push({
      title: title,
      priceText: priceText,
      priceNumber: priceNumber,
      img: "https://www.alkosto.com" + img,
      link: "https://www.alkosto.com" + link,
      store: 'Alkosto'
    });
  }

  // Sort by price (lowest first)
  productInfo.sort((a, b) => a.priceNumber - b.priceNumber);

  let html = "";
  for (let i = 0; i < Math.min(3, productInfo.length); i++) {
    const product = productInfo[i];
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

module.exports = alkostoPrices;
