


class BaseWidget {

  cnstructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom={};
    thisWidget.dom.wrapper=wrapperElement;

    thisWidget=initialValue;
    
  }
}

export default BaseWidget;
