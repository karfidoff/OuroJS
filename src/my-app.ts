import {bindable, inlineView} from "./core/core";

@inlineView(`
<x-textfield label="First name" name="firstname" value.twoWay="firstname"></x-textfield>
<x-textfield label="Last name" name="lastname" value.twoWay="lastname"></x-textfield>
<br>
Hello&nbsp;<span innerHTML.toView="firstname"></span> <span innerHTML.toView="lastname"></span>
`)
export class MyApp {

  firstname;
  lastname;

  constructor() {
    setTimeout(() => {
      this.firstname = "FIRST";
      this.lastname = "LAST";
    }, 2000);

  }


}