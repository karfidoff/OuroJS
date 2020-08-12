import {XField} from "./x-field";
//import template from './x-textfield.html';
import {inlineView} from "../core/core";

@inlineView(`<span>\${this.label}</span><br><input type='text' name="\${this.name}"><br>`)
export class XTextfield extends XField {

  constructor() {
    super();
  }

}

