import { select, settings, templates} from './settings.js';
import {utils} from './utils.js';
import CartProduct from './components/CartProduct.js';

class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;
    thisCart.update();


    // console.log('new Cart:', thisCart);

  }
  getElements(element) {
    const thisCart = this;
    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.renderTotalsKeys = ['totalNumber', 'totalPrice', 'subtotalPrice', 'deliveryFee'];



    for (let key of thisCart.renderTotalsKeys) {
      thisCart.dom[key] = thisCart.dom.wrapper.querySelectorAll(select.cart[key]);
    }

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.formSubmit = thisCart.dom.wrapper.querySelector(select.cart.formSubmit);


  }
  initActions() {
    const thisCart = this;
    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      thisCart.dom.wrapper.classList.toggle('active');
    });
    thisCart.dom.productList.addEventListener('updated', function () { thisCart.update(); });

    thisCart.dom.productList.addEventListener('remove', function () { thisCart.remove(event.detail.cartProduct); });
    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
      console.log(thisCart.products);
      thisCart.resetCart();
    });

  }
  add(menuProduct) {
    const thisCart = this;

    // generate HTML based on templates
    const generatedHTML = templates.cartProduct(menuProduct);

    // console.log(generatedHTML);

    //generate DOM using utils.createElementFrom HTML
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    // console.log(generatedDOM);

    // add DOM element to thisCart.dom.productList
    thisCart.dom.productList.appendChild(generatedDOM);

    // console.log('adding product', menuProduct);

    // stworzenie  nowej instancji klasy new cartProduct oraz dodanie do tablicy thisCart.products
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    // console.log('thisCart.products', thisCart.products);
    thisCart.update();

  }
  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for (let product of thisCart.products) {
      thisCart.subtotalPrice += product.price;
      thisCart.totalNumber += product.amount;
    }
    thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;

    console.log('totalNumber:', thisCart.totalNumber);
    console.log('subtotalPrice:', thisCart.subtotalPrice);
    console.log('totalPrice in this Cart:', thisCart.totalPrice);

    for (let key of thisCart.renderTotalsKeys) {
      for (let elem of thisCart.dom[key]) {
        elem.innerHTML = thisCart[key];
      }
    }

  }
  remove(cartProduct) {
    const thisCart = this;
    const index = thisCart.products.indexOf[cartProduct];
    thisCart.products.splice(index, 1);
    cartProduct.dom.wrapper.remove();
    thisCart.update();
  }
  sendOrder() {
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.order;

    const payload = {
      testAddress: 'test',
      totalPrice: thisCart.totalPrice,
      address: thisCart.dom.address,
      phone: thisCart.dom.phone,
      totalNumber: thisCart.totalNumber,
      subtotalPrice: thisCart.subtotalPrice,
      deliveryFee: thisCart.deliveryFe,
      products: [],


    };

    for (let product of thisCart.products) {
      payload.products.push(product.getData());

    }


    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    fetch(url, options)
      .then(function (response) {
        return response.json();
      }).then(function (parsedResponse) {
        console.log('parsedResponse', parsedResponse);
      });
  }
  resetCart() {
    const thisCart = this;

    thisCart.products = [];
    thisCart.update();
    console.log(thisCart.products);
    thisCart.dom.productList.innerHTML = '';


  }
}

export default Cart;


