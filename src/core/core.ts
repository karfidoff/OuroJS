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

export function inlineView(template: string) {
  return function (constructor: Function) {
    constructor.prototype.$template = template;
  }
}

function BaseClass<T>(): new() => Pick<T, keyof T> { // we use a pick to remove the abstract modifier
  return class {
  } as any
}

class ClassProxy extends BaseClass<any>() {

  constructor(target: any) {
    super();
    let handler = {
      get: function (target: ClassProxy, p: PropertyKey, receiver: any): any {
        //console.log('get ' + String(p) + "=" + Reflect.get(target, p, receiver));
        return Reflect.get(target, p, receiver);
      },
      set: function (target: ClassProxy, p: keyof any, value: any, receiver: any): boolean {
        console.log('set ' + String(p) + "=" + value);
        //toView
        if (target.$observables) {
          for (let o of target.$observables) {
            if (o.property === String(p)) {
              o.node[o.attributeName] = value;
            }
          }
        }
        return Reflect.set(target, p, value, receiver);
      }
    }
    return new Proxy(target, handler);
  }
}

export function registerElement(className: any) {
  customElements.define(kebabCase(className.name), class extends HTMLElement {

        viewModel: any;

        constructor() {
          super();
          this.viewModel = new className();
          //viewModel["$element"] = this;
          this['viewModel'] = new ClassProxy(this.viewModel);
          this['viewModel']["$element"] = this;
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
                //observe viewModel[attr.value] and on changes set attr to that value
                if (!this.viewModel.$observables) {
                  this.viewModel.$observables = [];
                }
                this.viewModel.$observables.push({
                  property: attr.value,
                  node: child,
                  attributeName: attr.name.substring(0, attr.name.endsWith(".toview") ? attr.name.indexOf(".toview") : attr.name.indexOf(".twoway"))
                });
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
