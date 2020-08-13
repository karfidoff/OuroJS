import {XField} from "./x-field";
import {inlineView} from "../core/core";

@inlineView(`<span>\${this.label}</span>&nbsp;(<span innerHTML.toView='value'></span>)<br><input type='text' name='\${this.name}' value.twoWay='value'><br>`)
export class XTextfield extends XField {

  constructor() {
    super();
    setTimeout(() => {
      this.value = "test";
      console.log('value set');
    }, 2000);
  }

}

                                                                                                                                                                          