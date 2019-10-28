import { settings, select, classNames } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initPages: function () {
    const thisApp = this;
    thisApp.pages = document.querySelector(select.containerOf.pages).children;
    thisApp.navLinks = document.querySelectorAll(select.nav.links);

    thisApp.activatePage(thisApp.pages[0].id);
  },
  activatePage: function (pageId) {
    const thisApp = this;

    // add class 'active' to matching pages, remove from non-mathing
    // for (let page of thisApp.pages) {
    //   if (page.id == pageId) {
    //     page.classList.add(classNames.pages.active);
    //   } else {
    //     page.classList.remove(classNames.pages.active);
    //   }

    for (let page of thisApp.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageId);
    }


    // add class 'active' to links pages, remove from non-mathing
    for (let link of thisApp.navLinks) {
      link.classList.toggle(
        classNames.nav.active,
        link.getAttribute('href') === '#' + pageId
      );
    }

  },

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

    thisApp.initPages();
    thisApp.initData();
    // thisApp.initMenu();
    thisApp.initCart();
  },
};

app.init();

