export class XField {

  label:string;
  name:string;
  value:any;

  labelChanged(newValue, oldValue) {
    console.log('label changed to ' + newValue);
  }

  valueChanged(newValue, oldValue) {
    console.log(this.name + " changed to " + newValue);
  }

}

