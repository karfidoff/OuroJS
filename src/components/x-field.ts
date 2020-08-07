import {AttributeProperty} from "../core/core";


export class XField extends HTMLElement {

  @AttributeProperty
  label:string;
  @AttributeProperty
  name:string;

  constructor() {
    super();
  }

  public interpolate(template) {
    return new Function( `return \`${template}\`;`).apply(this);
  }

  labelChanged(newValue, oldValue) {
    console.log('label changed to ' + newValue);
  }

}

