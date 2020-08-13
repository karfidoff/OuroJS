import {bindable, inlineView} from "./core/core";

@inlineView(`
<x-textfield label="First name" name="firstname" value.twoWay="firstname"></x-textfield>
<x-textfield label="Last name" name="lastname" value.twoWay="lastname"></x-textfield>
`)
export class MyApp {

  firstname;
  lastname;

  constructor() {
    setTimeout(() => {
      this.firstname = "hello";
    }, 2000);

  }


}