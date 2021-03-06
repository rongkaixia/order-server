import { combineReducers } from 'redux';
import multireducer from 'multireducer';
import { routeReducer } from 'react-router-redux';
import {reducer as reduxAsyncConnect} from 'redux-async-connect';

import navbar from './navbar';
import auth from './auth';
import counter from './counter';
import {reducer as form} from 'redux-form';
import info from './info';
import userInfo from './userInfo';
import csrf from './csrf';
import widgets from './widgets';
import shop from './shop';
import checkout from './checkout';
import order from './order';
import cart from './cart';

// console.log("formAuth: " + formAuth);
// console.log("auth: " + auth);
export default combineReducers({
  navbar,
  routing: routeReducer,
  reduxAsyncConnect,
  auth,
  userInfo,
  form,
  csrf,
  shop,
  checkout,
  order,
  cart,
  multireducer: multireducer({
    counter1: counter,
    counter2: counter,
    counter3: counter
  }),
  info,
  widgets
});
