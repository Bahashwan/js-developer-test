const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

puppeteer.use(StealthPlugin());

const DNS_Scrapper = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  try {

 
 await page.setRequestInterception(true);
 page.on('request', (request) => {
   const block =
     ['image', 'stylesheet', 'font'].includes(
       request.resourceType()
     ) || request.url().startsWith('data:');
   if (block) {
     request.abort();
   } else {
     request.continue();
   }
 });





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

    const csvWriter = createCsvWriter({
      path: 'products.csv',
      header: [
        { id: 'title', title: 'Наименование' },
        { id: 'price', title: 'Цена' },
      ],
    });

    await csvWriter.writeRecords(data);

    console.log('information saved in products.csv');
  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
  }
};
DNS_Scrapper();