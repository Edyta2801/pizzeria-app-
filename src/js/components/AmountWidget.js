import { select, settings } from '../settings.js';
import BaseWidget from './BaseWidget.js';

class AmountWidget extends BaseWidget {
  constructor(element) {
    super(element, settings.amountWidget.defaultValue;);
    const thisWidget = this;
    thisWidget.getElements(element);
    // thisWidget.value = settings.amountWidget.defaultValue;
    // thisWidget.setValue(thisWidget.input.value);
    thisWidget.initActions();

    // console.log('AmountWidget:', thisWidget);
    // console.log('constructor arguments:', element);
  }
  getElements() {
    const thisWidget = this;

    // thisWidget.element = element;
    thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
    thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
  }
  setValue(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);


    // TO DO: Add validation

    // thisWidget.value = newValue;
    // thisWidget.announce();
    // thisWidget.input.value = thisWidget.value;

    if (newValue != thisWidget.input.value && thisWidget.isValid(newvalue)) {
      thisWidget.value = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();

  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value)
      && value >= settings.amountWidget.defaultMin && newValue
      && value <= settings.amountWidget.defaultMax
  }
  renderValue() {
    const thisWidget = this;

    thisWidget.dom.input.value = thisWidget.value;
  }




  initActions() {
    const thisWidget = this;
    thisWidget.input.addEventListener('change', function (event) {
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function () {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function () {
      event.preventDefault();
      thisWidget.setValue(thisWidget.value + 1);
    });

    // console.log('initActions', thisWidget);
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', { bubbles: true });
    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
