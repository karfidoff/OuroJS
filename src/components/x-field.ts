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

  public interpolate(template) {
    return new Function( `return \`${template}\`;`).apply(this);
  }

}

