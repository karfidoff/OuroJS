import {bindable, inlineView} from "./core/core";

@inlineView(`
<x-textfield label="First name" name="firstname" value.twoWay="model.firstname"></x-textfield>
<x-textfield label="Last name" name="lastname" value.twoWay="model.lastname"></x-textfield>
<br>
Hello&nbsp;<span innerHTML.toView="model.firstname"></span> <span innerHTML.toView="model.lastname"></span>
`)
/*
<x-textfield label="First name" name="firstname" value.twoWay="model.firstname"></x-textfield>
<x-textfield label="Last name" name="lastname" value.twoWay="model.lastname"></x-textfield>
<br>
Hello&nbsp;<span innerHTML.toView="model.firstname"></span> <span innerHTML.toView="model.lastname"></span>
*/
export class MyApp {

  firstname;
  lastname;
  model:any = {};

  constructor() {
    setTimeout(() => {
      this.model.firstname = "FIRST";
      this.model.lastname = "LAST";
    }, 2000);

  }


}