import {Subscriber} from "./binding";

export class PropertyObserver {
  currentValue: any;
  oldValue: any;
  target: any;
  propertyKey: string;
  changedFunction: Function;
  subscribers: Array<Subscriber>;

  constructor(target, propertyKey) {
    this.target = target;
    this.propertyKey = propertyKey;
    this.currentValue = this.target[this.propertyKey];
    if (!this.target.$observers) {
      this.target.$observers = {};
    }
    this.target.$observers[propertyKey] = this;
    this.changedFunction = this.target[`${propertyKey}Changed`];
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
      this.changedFunction.call(this.target, this.currentValue, this.oldValue);
    }
  }

  subscribe(subscriber: Subscriber) {
    if (!this.subscribers) {
      this.subscribers = new Array<Subscriber>();
    }
    //TODO something is wrong here... handleChange should not be called on subscribe
    subscriber.handleChange(this.currentValue, this.currentValue, []);
    this.subscribers.push(subscriber);
  }
}

