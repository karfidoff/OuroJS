export class XField extends HTMLElement {

  constructor() {
    super();
  }

  get label() {
    return this.getAttribute('label');
  }

  set label(val) {
    if (val) {
      this.setAttribute('label', val);
    } else {
      this.removeAttribute('label');
    }
  }

  get name() {
    return this.getAttribute('name');
  }

  set name(val) {
    if (val) {
      this.setAttribute('name', val);
    } else {
      this.removeAttribute('name');
    }
  }

  public interpolate(template) {
    return new Function( `return \`${template}\`;`).apply(this);
  }

}

