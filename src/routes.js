import React from 'react';
import {IndexRoute, Route} from 'react-router';
import { isLoaded as isAuthLoaded, load as loadAuth } from 'redux/modules/auth';
import {
    App,
    Home,
    Login,
    LoginSuccess,
    Logout,
    Signup,
    UserCenter,
    UserCenterHome,
    AccountInfo,
    AccountAddress,
    AccountCoupon,
    AccountOrder,
    OrderDetail,
    ProductNeck,
    Necklace,
    BuyNecklace,
    Ring,
    Cart,
    Checkout,
    Payment,
    NotFound,
  } from 'containers';

export default (store) => {
  const requireLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { userInfo: { user }} = store.getState();
      if (!user) {
        // oops, not logged in, so can't be here!
        replace('/');
      }
      cb();
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth);
    } else {
      checkAuth();
    }
  };
  const requireNotLogin = (nextState, replace, cb) => {
    function checkAuth() {
      const { userInfo: { user }} = store.getState();
      if (user) {
        // oops, logged in, so can't be here!
        replace('/');
      }
      cb();
    }

    if (!isAuthLoaded(store.getState())) {
      store.dispatch(loadAuth()).then(checkAuth);
    } else {
      checkAuth();
    }
  };

  /**
   * Please keep routes in alphabetical order
   */
  return (
    <Route path="/" component={App}>
      { /* Home (main) route */ }
      <IndexRoute component={Home}/>

      { /* Routes requiring login */ }
      <Route onEnter={requireLogin}>
        <Route path="loginSuccess" component={LoginSuccess}/>
        <Route path="logout" component={Logout}/>
        <Route path="account" component={UserCenter}>
          <IndexRoute component={UserCenterHome}/>
          <Route path="order" component={AccountOrder}/>
          <Route path="order/detail/:id" component={OrderDetail}/>
          <Route path="info" component={AccountInfo}/>
          <Route path="address" component={AccountAddress}/>
          <Route path="coupon" component={AccountCoupon}/>
        </Route>
        <Route path="buy/checkout" component={Checkout}/>
        <Route path="buy/payment/:id" component={Payment}/>
      </Route>
      <Route path="necklace" component={ProductNeck}/>
      <Route path="shop">
        <Route path="buy-necklace">
          <IndexRoute component={Necklace}/>
          <Route path=":id" component={BuyNecklace}/>
        </Route>
        <Route path="buy-ring">
          <IndexRoute component={Ring}/>
        </Route>
      </Route>
      <Route path="cart" component={Cart}/>
      { /* Routes */ }
      <Route onEnter={requireNotLogin}>
        <Route path="login" component={Login}/>
        <Route path="signup" component={Signup}/>
      </Route>
      { /* Catch all route */ }
      <Route path="*" component={NotFound} status={404} />
    </Route>
  );
};
