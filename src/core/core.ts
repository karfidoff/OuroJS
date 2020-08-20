import "reflect-metadata";
import {kebabCase} from "./kebab-case";
import {bindable, Observer, PropertySubscriber, Repeat} from "./binding";


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
          processDOM(this.shadowRoot, this.$viewModel);
        }
      }
  );
}

export function processDOM(root, viewModel) {
  for (let child of root.children) {
    for (let attr of child.attributes) {
      //from view to viewmodel
      if (attr.name.endsWith(".fromview") || attr.name.endsWith(".twoway")) {
        if (child instanceof HTMLInputElement) {
          //TODO more options: event keyup or even dirty checking every .25s
          //TODO change event is good for value changes only!
          child.addEventListener("change", (event) => {
            let value = event.target[attr.name.substring(0, attr.name.endsWith(".fromview") ? attr.name.indexOf(".fromview") : attr.name.indexOf(".twoway"))];
            viewModel[attr.value] = value;
          });
        } else if (child['$viewModel']) {
          let propertyName = attr.name.substring(0, attr.name.endsWith(".fromview") ? attr.name.indexOf(".fromview") : attr.name.indexOf(".twoway"));
          createObserverAndSubscribe(child['$viewModel'], propertyName, viewModel, attr.value);
        }
      }
      //from viewmodel to view
      if (attr.name.endsWith(".toview") || attr.name.endsWith(".twoway")) {
        let propertyName = attr.name.substring(0, attr.name.endsWith(".toview") ? attr.name.indexOf(".toview") : attr.name.indexOf(".twoway"));
        if (child['$viewModel']) {
          createObserverAndSubscribe(viewModel, attr.value, child['$viewModel'], propertyName);
        } else {
          createObserverAndSubscribe(viewModel, attr.value, child, propertyName);
        }
      }
      if (attr.name == "repeat.for") {
        let anchor = document.createComment("repeat.end");
        child.parentNode.replaceChild(anchor, child);
        anchor.parentNode.insertBefore(document.createComment("repeat.start"), anchor);
        let bindingValue = attr.value;
        child.removeAttribute(attr.name);
        console.log(bindingValue);
        let parts = bindingValue.split(/\s+of\s+/);
        createRepeatObserverAndSubscribe(viewModel, parts[1], anchor, child);
      }
    }
  }
}

//TODO refactor!
function createRepeatObserverAndSubscribe(viewModel: any, modelProperty: string, anchor:any, template: any) {
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
  let observer: Observer = obj.$observers && obj.$observers[modelProperty];
  if (!observer) { //add bindable if it's not defined
    observer = bindable(obj, modelProperty);
  }
  let repeat = new Repeat(anchor, template, observer, viewModel);
  anchor['$repeat'] = repeat;
  observer.subscribe(new PropertySubscriber(repeat, "items"));
}


//TODO it should be viewScope not the actual viewModel
function createObserverAndSubscribe(viewModel: any, modelProperty: string, target: any, targetProperty: string) {
  console.log(viewModel);
  console.log(modelProperty);
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
  if (!obj) {
    return;
  }
  let observer: Observer = obj.$observers && obj.$observers[modelProperty];
  if (!observer) { //add bindable if it's not defined
    observer = bindable(obj, modelProperty);
  }
  if (target) {
    observer.subscribe(new PropertySubscriber(target, targetProperty));
  }
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
