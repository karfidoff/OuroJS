import {XField} from "./x-field";
import {inlineView} from "../core/core";

@inlineView(`<span>\${this.label}</span><br><input type='text' name='\${this.name}' value.fromView='value'><br>`)
export class XTextfield extends XField {

  constructor() {
    super();
  }

}

