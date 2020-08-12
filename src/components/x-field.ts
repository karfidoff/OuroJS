import {AttributeProperty} from "../core/core";


export class XField extends HTMLElement {

  @AttributeProperty
  label:string;
  @AttributeProperty
  name:string;

  value:any;

  constructor() {
    super();
  }

  public interpolate(template) {
    return new Function( `return \`${template}\`;`).apply(this);
  }

  labelChanged(newValue, oldValue) {
    console.log('label changed to ' + newValue);
  }

  valueChanged(newValue, oldValue) {
    console.log(this.name + " changed to " + newValue);
  }

  handleChange(event) {
    this.value = event.target.value;
  }

}

