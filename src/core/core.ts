import "reflect-metadata";
import {kebabCase} from "./kebab-case";

class Observable {
  currentValue: any;
  oldValue: any;
  obj: any;
  propertyKey: string;
  changedFunction: Function;
  subscribers: Array<Subscriber>;

  constructor(obj, propertyKey) {
    this.obj = obj;
    this.propertyKey = propertyKey;
    if (!this.obj.$observables) {
      this.obj.$observables = {};
    }
    this.obj.$observables[propertyKey] = this;
    this.changedFunction = this.obj[`${propertyKey}Changed`];
  }

  getValue(): any {
    //console.log(`observable ${this.propertyKey} get ${this.currentValue}`);
    return this.currentValue;
  }

  setValue(newValue: any, history: Array<any> = null): void {
    if (!history) {
      history = [];
    } else if (history.indexOf(this) >= 0) {
      return;
    }
    history.push(this);
    //console.log(`observable set ${this.propertyKey} to ${newValue}`);
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    //call subscribers
    if (this.subscribers) {
      for (let s of this.subscribers) {
        s.handleChange(this.currentValue, this.oldValue, history);
      }
    }
    //call ...Changed hook
    if (this.changedFunction) {
      this.changedFunction.call(this.obj, this.currentValue, this.oldValue);
    }
  }

  subscribe(subscriber: Subscriber) {
    if (!this.subscribers) {
      this.subscribers = new Array<Subscriber>();
    }
    this.subscribers.push(subscriber);
  }
}

//TODO @bindable as decorator gives target not as component class
export function bindable(target: any, name?: PropertyKey): any {
  //console.log(target);
  let observable = new Observable(target, name);

  const descriptor = {
    get: observable.getValue.bind(observable),
    set: observable.setValue.bind(observable),
    enumerable: true,
    configurable: true,
  };
  Object.defineProperty(target, name, descriptor);
  Reflect.defineMetadata(name, descriptor, target);
  return observable;
}

interface Subscriber {
  target: any;
  targetProperty: string;
  propertyIsObject: boolean;

  handleChange(newValue, oldValue, history);
}

class PropertySubscriber implements Subscriber {
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
    if (this.propertyIsObject) {
      setObjectPropertyByPath(this.target, this.targetProperty, newValue);
    } else {
      if (this.target['$observables']) {
        let observable = this.target['$observables'][this.targetProperty];
        if (observable) {
          observable.setValue(newValue, history);
          return;
        }
      }
      this.target[this.targetProperty] = newValue;
    }
  }
}

function setObjectPropertyByPath(target: any, path: string, value: any) {
  let pathParts = path.split(".");
  let obj = target;
  let i = 0;
  while (i < pathParts.length - 1) {
    obj = obj[pathParts[i]];
    i++;
  }
  obj[pathParts[i]] = value;
}

export function inlineView(template: string) {
  return function (constructor: Function) {
    constructor.prototype.$template = template;
  }
}

export function registerElement(className: any) {
  customElements.define(kebabCase(className.name), class extends HTMLElement {

        $viewModel: any;

        constructor() {
          super();
          this.$viewModel = new className();
          this.$viewModel["$element"] = this;
          //bind initial values
          for (let attr of this.attributes) {
            if (attr.name.indexOf(".") > -1) {
              continue;
            }
            this.$viewModel[attr.name] = attr.value; //TODO check if property exists
          }
          console.log(this.$viewModel);
        }

        async connectedCallback() {
          this.attachShadow({mode: 'open'}).innerHTML = interpolate.call(this.$viewModel, String(this.$viewModel.$template));
          //TODO should be recursive
          for (let child of this.shadowRoot.children) {
            for (let attr of child.attributes) {
              //from view to viewmodel
              if (attr.name.endsWith(".fromview") || attr.name.endsWith(".twoway")) {
                if (child instanceof HTMLInputElement) {
                  //TODO more options: event keyup or even dirty checking every .25s
                  //TODO change event is good for value changes only!
                  child.addEventListener("change", (event) => {
                    let value = event.target[attr.name.substring(0, attr.name.endsWith(".fromview") ? attr.name.indexOf(".fromview") : attr.name.indexOf(".twoway"))];
                    this.$viewModel[attr.value] = value;
                  });
                } else if (child['$viewModel']) {
                  let propertyName = attr.name.substring(0, attr.name.endsWith(".fromview") ? attr.name.indexOf(".fromview") : attr.name.indexOf(".twoway"));
                  createObserverAndSubscribe(child['$viewModel'], propertyName, this.$viewModel, attr.value);
                }
              }
              //from viewmodel to view
              if (attr.name.endsWith(".toview") || attr.name.endsWith(".twoway")) {
                let propertyName = attr.name.substring(0, attr.name.endsWith(".toview") ? attr.name.indexOf(".toview") : attr.name.indexOf(".twoway"));
                if (child['$viewModel']) {
                  createObserverAndSubscribe(this.$viewModel, attr.value, child['$viewModel'], propertyName);
                } else {
                  createObserverAndSubscribe(this.$viewModel, attr.value, child, propertyName);
                }
              }
            }
          }
        }
      }
  );
}

function createObserverAndSubscribe(viewModel: any, modelProperty: string, target: any, targetProperty: string) {
  let observer: Observable = viewModel.$observables && viewModel.$observables[modelProperty];
  if (!observer) { //add bindable if it's not defined
    let obj = viewModel;
    if (modelProperty.indexOf(".") > 0) {
      let pathParts = modelProperty.split(".");
      let i = 0;
      while (i < pathParts.length - 1) {
        obj = obj[pathParts[i]];
        i++;
      }
      modelProperty = pathParts[i];
    }
    observer = bindable(obj, modelProperty);
  }
  observer.subscribe(new PropertySubscriber(target, targetProperty));
}

//dirty trick
function interpolate(template) {
  return new Function(`return \`${template}\`;`).apply(this);
}

export function kebabToCamel(value: string): string {
  return value.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}


export const JSX = {
  createElement(name: string, props: { [id: string]: string }, ...content: string[]) {
    props = props || {};
    const propsstr = Object.keys(props)
        .map(key => {
          const value = props[key];
          if (key === "className") {
            return `class=${value}`;
          }
          console.log(key);
          console.log(value);
          return `${key}='${value}'`;
        })
        .join(" ");
    if (!name) {
      return `${content.join("")}`;
    }
    return content.length ? `<${name} ${propsstr}>${content.join("")}</${name}>` : `<${name} ${propsstr}/>`;
  },
};

export default JSX;
