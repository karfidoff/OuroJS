import {processDOM} from "./core";
import {ArrayObserver} from "./array-observer";
import {PropertyObserver} from "./property-observer";

//TODO @bindable as decorator gives target not as component class
export function bindable(target: any, name?: PropertyKey): any {
  //console.log('bindable ' + String(name));
  //console.log(target);
  let observer;
  if (target[name] instanceof Array) {
    observer = new ArrayObserver(target, name);
  } else {
    observer = new PropertyObserver(target, name);
  }

  const descriptor = {
    get: observer.getValue.bind(observer),
    set: observer.setValue.bind(observer),
    enumerable: true,
    configurable: true,
  };
  Object.defineProperty(target, name, descriptor);
  //Reflect.defineMetadata(name, descriptor, target);  //TODO why do we need it?
  return observer;
}

export interface Subscriber {
  target: any;
  targetProperty: string;
  propertyIsObject: boolean;

  handleChange(newValue, oldValue, history);
}

export class PropertySubscriber implements Subscriber {
  target: any;
  targetProperty: string;
  propertyIsObject: boolean = false;

  constructor(target: any, targetProperty: string) {
    this.target = target;
    this.targetProperty = targetProperty;
    this.propertyIsObject = targetProperty.indexOf(".") > 0;
  }

  handleChange(newValue: any, oldValue: any, history: Array<any>) {
    if (this.targetProperty === "innerhtml") {
      this.target["innerHTML"] = newValue; //innerHTML is case-sensitive property
      return;
    }
    let obj: any = this.target;
    let property: string = this.targetProperty;
    if (this.target instanceof Repeat) { //TODO should be more universal way
      (this.target as Repeat).renderItems();
      return;
    }

    if (this.propertyIsObject) {
      let i = 0;
      let pathParts = property.split(".");
      while (i < pathParts.length - 1) {
        obj = obj[pathParts[i]];
        i++;
      }
      property = pathParts[i];
    }
    if (obj['$observers']) {
      let observable = obj['$observers'][property];
      if (observable) {
        if (!history) {
          history = [];
        } else if (history.indexOf(obj) >= 0) {
          return;
        }
        history.push(obj);
        observable.setValue(newValue, history);
        return;
      }
    }
    obj[property] = newValue;
  }
}

export class Repeat {
  observer: PropertyObserver;
  location;
  template;
  parentScope;
  elements = [];

  constructor(location, template, observer, parentScope) {
    this.location = location;
    this.template = template;
    this.observer = observer;
    this.parentScope = parentScope;
    this.renderItems();
  }

  renderItems() {
    if (!this.location) {
      return;
    }
    for (let el of this.elements) {
      el.parentNode.removeChild(el);
    }
    this.elements = [];
    console.log(this.observer.getValue());
    for (let item of this.observer.getValue()) {
      let element = this.template.cloneNode(true);
      this.elements.push(element);
      this.location.parentNode.insertBefore(element, this.location);
      processDOM(element, {item: item, "$parent": this.parentScope});
    }
  }


  public itemsChanged(): void {
  }

  public handleCollectionChange(): void {
  }


}
