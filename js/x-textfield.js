import Xfield from "./x-field.js";

class XTextfield extends Xfield {

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

customElements.define('x-textfield', XTextfield);