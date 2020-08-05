import {XField} from "./x-field";

export class XTextfield extends XField {

  constructor() {
    super();
  }

  async connectedCallback() {
    fetch("js/x-textfield.html")
            .then(stream => stream.text())
            .then(text => {
              this.attachShadow({mode: 'open'}).innerHTML = text;
            });
  }


}

