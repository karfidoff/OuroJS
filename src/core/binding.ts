//TODO different types of Observers
import {processDOM} from "./core";

export class Observer {
  currentValue: any;
  oldValue: any;
  obj: any;
  propertyKey: string;
  changedFunction: Function;
  subscribers: Array<Subscriber>;

  constructor(obj, propertyKey) {
    this.obj = obj;
    this.propertyKey = propertyKey;
    this.currentValue = this.obj[this.propertyKey];
    if (!this.obj.$observers) {
      this.obj.$observers = {};
    }
    this.obj.$observers[propertyKey] = this;
    this.changedFunction = this.obj[`${propertyKey}Changed`];
  }

  getValue(): any {
    //console.log(`observer ${this.propertyKey} get ${this.currentValue}`);
    return this.currentValue;
  }

  setValue(newValue: any, history: Array<any> = null): void {
    if (!history) {
      history = [];
    } else if (history.indexOf(this) >= 0) {
      return;
    }
    history.push(this);
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    //call subscribers
    if (this.subscribers) {
      for (let s of this.subscribers) {
        s.handleChange(this.currentValue, this.oldValue, history);
      }
    }
    //call <propertyKey>Changed hook
    if (this.changedFunction) {
      this.changedFunction.call(this.obj, this.currentValue, this.oldValue);
    }
  }

  subscribe(subscriber: Subscriber) {
    if (!this.subscribers) {
      this.subscribers = new Array<Subscriber>();
    }
    subscriber.handleChange(this.currentValue, this.currentValue, []);
    this.subscribers.push(subscriber);
  }
}

//TODO @bindable as decorator gives target not as component class
export function bindable(target: any, name?: PropertyKey): any {
  console.log('bindable ' + String(name));
  console.log(target);
  let observable = new Observer(target, name);

  const descriptor = {
    get: observable.getValue.bind(observable),
    set: observable.setValue.bind(observable),
    enumerable: true,
    configurable: true,
  };
  Object.defineProperty(target, name, descriptor);
  //Reflect.defineMetadata(name, descriptor, target);  //TODO why do we need it?
  return observable;
}

interface Subscriber {
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

  handleChange(newValue: any, oldValue: any, history:Array<any>) {
    if (this.targetProperty === "innerhtml") {
      this.target["innerHTML"] = newValue; //innerHTML is case-sensitive property
      return;
    }
    let obj:any = this.target;
    let property:string = this.targetProperty;
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
  observer:Observer;
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
    for (let item of this.observer.getValue()) {
      let element = this.template.cloneNode(true);
      this.elements.push(element);
      this.location.parentNode.insertBefore(element, this.location);
      processDOM(element, Object.assign(this.parentScope, {item: item}));
    }

  }

}
