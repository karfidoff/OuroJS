import {XField} from "./x-field";
import template from './x-textfield.html';
import JSX from "../core/core";

export class XTextfield extends XField {

  constructor() {
    super();
  }

  async connectedCallback() {
    this.attachShadow({mode: 'open'}).innerHTML = this.render();
    setTimeout( () => {
      this.label += "!";
    }, 2000);
  }

  render() {
    return <><span>{this.label}</span><br/><input type='text' name={this.name} value={this.value} onchange={this.handleChange}/><br/></>
  }

}

