import {XField} from "./x-field";
import {inlineView} from "../core/core";

@inlineView(`<span>\${this.label}</span><br><input type='text' name='\${this.name}' value.twoWay='value'><br>`)
export class XTextfield extends XField {

  constructor() {
    super();
    setTimeout(() => {
      console.log(this);
      this.value = "123";
      console.log('value set');
    }, 2000);
  }

}

                                                                                                                                                                          