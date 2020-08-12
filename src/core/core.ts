import "reflect-metadata";
import {kebabCase} from "./kebab-case";

export function AttributeProperty(target: {} | any, name?: PropertyKey) {
  const descriptor = {
    get(this: any) {
      console.log("get " + String(name));
      return this.$element.getAttribute(name);
    },
    set(value: any) {
      console.log('set ' + String(name));
      console.log(this);
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
    constructor.prototype.template = template;
  }
}

export function registerElement(className: any) {
  customElements.define(kebabCase(className.name), class extends HTMLElement {

        viewModel: any;

        constructor() {
          super();
          this['viewModel'] = new className();
          this['viewModel'].$element = this;
        }

        async connectedCallback() {
          console.log(this['viewModel']);
          this.attachShadow({mode: 'open'}).innerHTML = interpolate.call(this['viewModel'], String(this['viewModel'].template));
        }
      }
  );
}

//dirty trick
function interpolate(template) {
  return new Function( `return \`${template}\`;`).apply(this);
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
