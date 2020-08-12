import "reflect-metadata";

export function AttributeProperty(target: {} | any, name?: PropertyKey) {
    const descriptor = {
      get(this: any) {
        console.log("get " + String(name));
        return this.getAttribute(name);
      },
      set(value: any) {
        console.log('set ' + String(name));
        console.log(this);
        let oldValue = this.getAttribute(name);
        if (value) {
          this.setAttribute(name, value);
        } else {
          this.removeAttribute(name);
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
      return  `${content.join("")}`;
    }
    return content.length ? `<${name} ${propsstr}>${content.join("")}</${name}>` : `<${name} ${propsstr}/>`;
  },
};

export default JSX;
