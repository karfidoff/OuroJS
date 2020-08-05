import {XField} from "./x-field";
import template from './x-textfield.html';

export class XTextfield extends XField {

  constructor() {
    super();
  }

  async connectedCallback() {
    this.attachShadow({mode: 'open'}).innerHTML = this.interpolate(String(template));
  }


}

