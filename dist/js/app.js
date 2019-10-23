import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart';

const app = {
  initMenu: function () {
    const thisApp = this;
    // console.log('thisApp.data:', thisApp.data);

    for (let productData in thisApp.data.products) {
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
    // const testProduct = new Product();
    // console.log('testProduct:', testProduct);
  },
  initData: function () {
    const thisApp = this;
    thisApp.data = {};
    const url = settings.db.url + '/' + settings.db.product;
    console.log(url);

    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
        // save parsedResponse as thisApp.data.products
        thisApp.data.products = parsedResponse;
        // console.log(parsedResponse);
        // execute initMenu method
        thisApp.initMenu(parsedResponse);
      });
    console.log('thisApp.data', JSON.stringify(thisApp.data));

  },
  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    // console.log(cartElem);

    // instancja klasy Cart zapisana  w thisApp.cart, oznacza że można wywołać ją poza obiektem app za pomocą app.cart
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);
    thisApp.productList.addEventListener('add-to-cart', function (event) {
      app.cart.add(event.detail.product);
    });

  },

  init: function () {
    const thisApp = this;
    console.log('*** App starting ***');
    console.log('thisApp:', thisApp);
    // console.log('classNames:', classNames);
    console.log('settings:', settings);
    // console.log('templates:', templates);


    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },
};

app.init();

