const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');

puppeteer.use(StealthPlugin());

const DNS_Scrapper = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();

  try {
    await page.goto(
      'http://www.dns-shop.ru/catalog/17a8d26216404e77/vstraivaemye-xolodilniki/'
    );

    await page.waitForSelector('.catalog-product');
    await page.waitForSelector('.catalog-product__name');
    await page.waitForSelector('.product-buy__price');

    const data = await page.evaluate(() => {
      const allProducts = Array.from(
        document.querySelectorAll('.catalog-product ')
      );
      const products = allProducts.map((prod) => {
        return {
          title: prod.querySelector('.catalog-product__name').innerText,
          price: prod.querySelector('.product-buy__price').innerText,
        };
      });

      return products;
    });

    await browser.close();

    const csvData = data
      .map(
        (product) =>
          `Product Name:${product.title}` +
          '\n' +
          `Price:${product.price}` +
          '\n'
      )
      .join('\n');
    fs.writeFileSync('products.csv', csvData);

    console.log('Information collected and saved in products.csv');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
  }
};
DNS_Scrapper();
