//todo register all components from index.ts
import * as globalComponents from './components';

import {registerElement} from "./core/core";
import {XTextfield} from "./components";
import {MyApp} from "./my-app";

registerElement(XTextfield);
registerElement(MyApp);


