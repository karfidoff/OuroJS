import {Subscriber} from "./binding";
import {PropertyObserver} from "./property-observer";

const proto = Array.prototype as { [K in keyof any[]]: any[][K] & { observing?: boolean } };

export class ArrayObserver extends PropertyObserver {

  observers: Array<IndexObserver> = [];

  constructor(target, propertyKey) {
    super(target, propertyKey);

    let arr = this.target[propertyKey];
    Object.defineProperty(arr, "push", {
      configurable: false,
      enumerable: false,
      writable: false,
      value: function (...args) {
        let index;
        for (let i = 0, ln = args.length; i < ln; i++) {
          index = arr.length;
          proto.push.apply(arr, [args[i]]);
          //this.defineIndexProperty(index);
          //this.observers.push(new IndexObserver(obj, index));
          console.log(`itemadded ind=${index} item=${JSON.stringify(args[i])}`);
          if (this.subscribers) {
            for (let s of this.subscribers) {
              s.handleChange(this.currentValue, this.currentValue, history);
            }
          }
        }
        return arr.length;
      }.bind(this)
    });
  }


  subscribe(subscriber: Subscriber) {
    super.subscribe(subscriber);
  }

  /*
    defineIndexProperty(index) {
        if (!(index in this.obj)) {
          Object.defineProperty(this.obj, index, {
            configurable: true,
            enumerable: true,
            get: proto.get.apply(function() {
              return this.obj[index];
            }.bind(this),
            set: function(v) {
              this.obj[index] = v;
              console.log(`itemset ind=${index} item=${v}`);
  /!*
              raiseEvent({
                type: "itemset",
                index: index,
                item: v
              });
  *!/
            }.bind(this)
          });
        }
      }
  */

  /*
      a.push = function(obj){
          var push = Array.prototype.push.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](obj, "push");
          return push;
      }

      a.pop = function(){
          var popped = Array.prototype.pop.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](popped, "pop");
          return popped;
      }

      a.reverse = function() {
          var result = Array.prototype.reverse.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](result, "reverse");
          return result;
      };

      a.shift = function() {
          var deleted_item = Array.prototype.shift.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](deleted_item, "shift");
          return deleted_item;
      };

      a.sort = function() {
          var result = Array.prototype.sort.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](result, "sort");
          return result;
      };

      a.splice = function(i, length, itemsToInsert) {
          var returnObj
          if(itemsToInsert){
              Array.prototype.slice.call(arguments, 2);
              returnObj = itemsToInsert;
          }
          else{
              returnObj = Array.prototype.splice.apply(a, arguments);
          }
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](returnObj, "splice");
          return returnObj;
      };

      a.unshift = function() {
          var new_length = Array.prototype.unshift.apply(a, arguments);
          for(var i = 0; i < _this.observers.length; i++) _this.observers[i](new_length, "unshift");
          return arguments;
      };
  */

}

export class IndexObserver {
  currentValue: any;
  oldValue: any;
  obj: any;
  subscribers: Array<Subscriber>;

  constructor(obj, index) {
    this.obj = obj;

    Object.defineProperty(this.obj, index, {
      get: this.getValue,
      set: this.setValue,
      enumerable: true,
      configurable: true,
    });

    //init value
    this.currentValue = this.obj[index];
  }

  getValue(): any {
    return this.currentValue;
  }

  setValue(newValue: any, history: Array<any> = null): void {
    if (!history) {
      history = [];
    } else if (history.indexOf(this) >= 0) {
      return;
    }
    history.push(this);
    this.oldValue = this.currentValue;
    this.currentValue = newValue;
    //call subscribers
    if (this.subscribers) {
      for (let s of this.subscribers) {
        s.handleChange(this.currentValue, this.oldValue, history);
      }
    }
    //call <propertyKey>Changed hook
    /*
        if (this.changedFunction) {
          this.changedFunction.call(this.obj, this.currentValue, this.oldValue);
        }
    */
  }

  subscribe(subscriber: Subscriber) {
    if (!this.subscribers) {
      this.subscribers = new Array<Subscriber>();
    }
    subscriber.handleChange(this.currentValue, this.currentValue, []);
    this.subscribers.push(subscriber);
  }
}
