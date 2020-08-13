import "reflect-metadata";
import {kebabCase} from "./kebab-case";

export function AttributeProperty(target: {} | any, name?: PropertyKey) {
  const descriptor = {
    get(this: any) {
      if (!this.$element) {
        return undefined;
      }
      return this.$element.getAttribute(name);
    },
    set(value: any) {
      if (!this.$element) {
        console.log(this);
        return;
      }
      let oldValue = this.$element.getAttribute(name);
      if (value) {
        this.$element.setAttribute(name, value);
      } else {
        this.$element.removeAttribute(name);
      }
      let changedFunction = this[`${String(name)}Changed`];
      if (this[`${String(name)}Changed`] instanceof Function) {
        changedFunction.call(this, value, oldValue);
      }
    },
    enumerable: true,
    configurable: true,
  };
  Object.defineProperty(target, name, descriptor);
  Reflect.defineMetadata(name, descriptor, target);
}

class Observable {
  currentValue: any;
  oldValue: any;
  obj: any;
  propertyKey: string;
  changedFunction: Function;
  subscribers:Array<Subscriber>;

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
    console.log(`observable ${this.propertyKey} get ${this.currentValue}`);
    return this.currentValue;
  }

  setValue(newValue: any): void {
    console.log(`observable set ${this.propertyKey} to ${newValue}`);
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    //call subscribers
    if (this.subscribers) {
      for (let s of this.subscribers) {
        s.handleChange(this.currentValue, this.oldValue);
      }
    }
    //call ...Changed hook
    if (this.changedFunction) {
      this.changedFunction.call(this.obj, this.currentValue, this.oldValue);
    }
  }

  subscribe(subscriber:Subscriber) {
    if (!this.subscribers) {
      this.subscribers = new Array<Subscriber>();
    }
    this.subscribers.push(subscriber);
  }
}

export function bindable(target: any, name?: PropertyKey):any {
  console.log(target);
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

  handleChange(newValue, oldValue);
}

class PropertySubscriber implements Subscriber {
  target: any;
  targetProperty: string;

  constructor(target: any, targetProperty: string) {
    this.target = target;
    this.targetProperty = targetProperty;
  }

  handleChange(newValue: any, oldValue: any) {
    if (this.targetProperty === "innerhtml") {
      this.target["innerHTML"] = newValue;
      return;
    }
    this.target[this.targetProperty] = newValue;
  }
}

export function inlineView(template: string) {
  return function (constructor: Function) {
    constructor.prototype.$template = template;
  }
}

export function registerElement(className: any) {
  customElements.define(kebabCase(className.name), class extends HTMLElement {

        viewModel: any;

        constructor() {
          super();
          this.viewModel = new className();
          this.viewModel["$element"] = this;
          //bind initial values
          for (let attr of this.attributes) {
            this.viewModel[attr.name] = attr.value; //TODO check if property exists
          }
        }

        async connectedCallback() {
          this.attachShadow({mode: 'open'}).innerHTML = interpolate.call(this.viewModel, String(this.viewModel.$template));
          //TODO should be recursive
          for (let child of this.shadowRoot.children) {
            for (let attr of child.attributes) {
              //from view to viewmodel
              if (attr.name.endsWith(".fromview") || attr.name.endsWith(".twoway")) {
                child.addEventListener("change", (event) => {
                  let value = event.target[attr.name.substring(0, attr.name.endsWith(".fromview") ? attr.name.indexOf(".fromview") : attr.name.indexOf(".twoway"))];
                  let oldValue = this.viewModel[attr.value];
                  this.viewModel[attr.value] = value;
                  let changedFunction = this.viewModel[`${String(attr.value)}Changed`];
                  if (this.viewModel[`${String(attr.value)}Changed`] instanceof Function) {
                    changedFunction.call(this.viewModel, value, oldValue);
                  }
                });
              }
              //from viewmodel to view
              if (attr.name.endsWith(".toview") || attr.name.endsWith(".twoway")) {
                let observer:Observable = this.viewModel.$observables && this.viewModel.$observables[attr.value];
                if (!observer) { //add bindable if it's not defined
                  observer = bindable(this.viewModel, attr.value);
                }
                //subscribe
                let propertyName = attr.name.substring(0, attr.name.endsWith(".toview") ? attr.name.indexOf(".toview") : attr.name.indexOf(".twoway"));
                observer.subscribe(new PropertySubscriber(child, propertyName));
              }
            }
          }
        }
      }
  );
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
