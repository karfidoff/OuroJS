import "reflect-metadata";

export function AttributeProperty(target: {} | any, name?: PropertyKey) {
    const descriptor = {
      get(this: any) {
        return this.getAttribute(name);
      },
      set(value: any) {
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
