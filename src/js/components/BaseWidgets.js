


class BaseWidget {

  cnstructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;

    thisWidget = initialValue;

  }
  setValue(value) {
    const thisWidget = this;

    const newValue = thisWidget.parseValue(value);


    // TO DO: Add validation

    // thisWidget.value = newValue;
    // thisWidget.announce();
    // thisWidget.input.value = thisWidget.value;

    if (newValue != thisWidget.input.value && thisWidget.isValid(newValue)) {
      thisWidget.value = newValue;
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
  renderValue(){
    const thisWidget=this;
    thisWidget.dom.wrapper.innerHTML=thisWidget.value;
  }
}

export default BaseWidget;
