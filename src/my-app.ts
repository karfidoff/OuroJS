import {inlineView} from "./core/core";
import {ArrayObserver} from "./core/array-observer";
import {parse, tokenizer} from "acorn";
import {tokenize} from "./core/lexer";

@inlineView(`
<x-textfield label="First name" name="firstname" value.twoWay="model.firstname"></x-textfield>
<x-textfield label="Last name" name="lastname" value.twoWay="model.lastname"></x-textfield>
<br>
Hello&nbsp;<span innerHTML.toView="model.firstname"></span> <span innerHTML.toView="model.lastname"></span>
<br>
<div repeat.for="item of model.items">
  <x-textfield name="name" label="name" value.twoWay="item.name"></x-textfield>
</div>
<input type="button" click.delegate="addItem" value="add">
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
  model: any = {
    firstname: "FIRST",
    lastname: "LAST",
    items: [
      {name: "name1"},
      {name: "name2"}
    ]
  };

  constructor() {
    setTimeout(() => {
      this.model.firstname = "FIRST changed";
      this.model.lastname = "LAST changed";
      this.model.items.push({name: "name3"});
    }, 2000);

    //parser test
    //console.log(parse("a + test(b) + b.d; hell(some);"), {ecmaVersion: 2020});


    let tokens = tokenize("this.a+b.c[1].d");
    console.log(tokens);
  }

  addItem() {
    this.model.items.push({name: `name${this.model.items.length + 1}`})
   }


}