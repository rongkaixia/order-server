import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import Image from 'react-bootstrap/lib/Image';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';
import * as userAction from 'redux/modules/userInfo';
import * as ordersAction from 'redux/modules/orders'; 


// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    console.log("==============userAction.loadInfo()=============")
    return dispatch(userAction.loadInfo());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    const globalState = getState();
    const orderId = globalState.routing.location.pathname.split("/").reverse()[0]
    console.log("==============next promises=============")
    console.log(JSON.stringify(globalState));
    if (!globalState.orders.orders ||
        !globalState.orders.orders.find(elem => elem.order_id == orderId)) {
      console.log("Detail.js load order info for id " + orderId);
      return dispatch(ordersAction.queryOrder(orderId)).then(() => {
        const globalState = getState();
        let productIds = new Set(globalState.orders.orders.map((order) => {
          return order.product_id;
        }))
        const promises = [...productIds].map((id) => {
          if (id && !shopAction.isProductLoaded(id, globalState))
            return dispatch(shopAction.loadProductInfo(id));
          else
            return Promise.resolve();
        })
        return Promise.all(promises);
      })
    } else {
      console.log("==============asdfasdf promises=============")
      const order = globalState.orders.orders.find(elem => elem.order_id == orderId)
      console.log("=============order==============")
      console.log(JSON.stringify(order))
      if (order.product_id && !shopAction.isProductLoaded(order.product_id, globalState))
        return dispatch(shopAction.loadProductInfo(order.product_id));
      else
        return Promise.resolve();
    }
  }
}])
@connect((state => ({user: state.userInfo.user,
                    orders: state.orders.orders,
                    products: state.shop.productsById,
                    location: state.routing.location})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    orders: PropTypes.object,
    products: PropTypes.object,
    location: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  renderChoice(item) {
    const styles = require('./Detail.scss');
    return (
      <div>
      </div>
    );
  }
  renderOrder(order) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, products} = this.props;
    const styles = require('./Detail.scss');
    const imagePath = require('../../../../static/diaozhui80X80.jpg');
    return (
      <div className={styles.orderDetailBox}>
        <p>{order.order_id}</p>
      </div>
    );
  }

  render() {
    const styles = require('./Detail.scss');
    const {orders, location} = this.props;
    const orderId = location.pathname.split("/").reverse()[0];
    const order = orders.find(elem => elem.order_id == orderId)

    let itemView = null;
    if (order) {
      itemView = this.renderOrder(order);
    }

    return (
      <div className={'container'}>
        {itemView}
      </div>
    );
  }
}
