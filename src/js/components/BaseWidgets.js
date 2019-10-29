
class BaseWidget {

  constructor(wrapperElement, initialValue) {

    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget.correctValue = initialValue;

  }

  // metoda get (getter) która jest wykonywana przy każdej próbie odczytania wartości właściwościvalue
  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  // metoda set (setter) która jest wykonywana przy każdej próbie ustawienia nowej wartości właściwościvalue
  set value(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);


    // TO DO: Add validation

    // thisWidget.value = newValue;
    // thisWidget.announce();
    // thisWidget.input.value = thisWidget.value;

    if (newValue != thisWidget.correctValue && thisWidget.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();

  }
  parseValue(value) {
    return parseInt(value);
  }
  isValid(value) {
    return !isNaN(value);

  }
  renderValue() {
    const thisWidget = this;
    thisWidget.dom.wrapper.innerHTML = thisWidget.value;
  }
  announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', { bubbles: true });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;
