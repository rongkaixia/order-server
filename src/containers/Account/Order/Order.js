import _ from 'lodash';
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
import * as ordersAction from 'redux/modules/order'; 
import {AddressCard} from 'containers';

const ORDER_STATE = {
  UNPAY: 'UNPAY',
  PAY_SUCCESS: 'PAY_SUCCESS',
  PAY_ERROR: 'PAY_ERROR',
  DELIVER: 'DELIVER',
  DELIVER_CONFIRM: 'DELIVER_CONFIRM',
  REFUND: 'REFUND',
  REFUND_CONFIRM: 'REFUND_CONFIRM',
  CANCELLED: 'CANCELLED'
}

const ORDER_SWITCH = {
  ALL: 'ALL',
  UNPAY: 'UNPAY',
  DELIVER: 'DELIVER',
  COMPELETE: 'COMPELETE',
  CANCELLED: 'CANCELLED'
}

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(ordersAction.queryOrder()).then(() => {
      const globalState = getState();
      let productIds = new Set(_.flatMap(globalState.order.orders, (order) => {
        return order.products.map(e => {return e.product_id});
      }))
      const promises = [...productIds].map((id) => {
        if (id && !shopAction.isProductLoaded(id, globalState))
          return dispatch(shopAction.loadProductInfo(id));
        else
          return Promise.resolve();
      })
      return Promise.all(promises);
    })
  }
}])
@connect((state => ({user: state.userInfo.user,
                    orders: state.order.orders,
                    products: state.shop.productsById})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    orders: PropTypes.object,
    products: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    orderSwitch: ORDER_SWITCH.UNPAY
  };

  switchOrderState(newState) {
    this.setState({orderSwitch: newState});
  }

  renderOrderItem(item) {
    const styles = require('./Order.scss');
    const imagePath = require('../../../../static/diaozhui80X80.jpg');
    return (
      <div className={styles.item}>
        <div className={styles.itemThump}>
          <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
            <img src={imagePath}/> 
          </a>
        </div>
        <div className={styles.itemDesc}>
          <p>{item.name}</p>
        </div>
      </div>
    )
  }

  renderOrder(order) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, products} = this.props;
    const styles = require('./Order.scss');
    let orderState = "";
    if (order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) {
      orderState = "待支付";
    } else if(order.state == ORDER_STATE.DELIVER_CONFIRM) {
      orderState = "已完成"
    } else if(order.state == ORDER_STATE.REFUND_CONFIRM) {
      orderState = "已退款"
    } else if(order.state == ORDER_STATE.CANCELLED) {
      orderState = "已关闭"
    } else if(order.state == ORDER_STATE.DELIVER || order.state == ORDER_STATE.PAY_SUCCESS) {
      orderState = "待收货"
    } else if(order.state == ORDER_STATE.REFUND) {
      orderState == "退款中"
    }
    console.log(order);
    const createAt = new Date(Number(order.create_at)).toString();
    let itemsView = order.products.map(prod => {
      const item = products[prod.product_id];
      return this.renderOrderItem(item);
    })
    let tmp = [itemsView, itemsView]
    return (
      <div className={styles.order + " clearfix"}>
        <div className={styles.header + " clearfix"}>
          <h4 className={styles.status}>{orderState}</h4>
          <p className={styles.time}>{"下单时间：" + createAt + " 订单号：" + order.order_id}</p>
          <p className={styles.total}>{"订单金额：" + order.real_pay_amt}</p>
        </div>
        <div className={styles.items + " clearfix"}>
          {tmp}
          {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) &&
          <div className={styles.operation}>
            <Button bsSize="normal" bsStyle={"warning"} href={"/buy/payment/" + order.order_id}>立即支付</Button>
          </div>
          }
          {(order.state == ORDER_STATE.PAY_SUCCESS || order.state == ORDER_STATE.DELIVER) &&
          <div className={styles.operation}>
            <Button bsSize="normal" bsStyle={"warning"} href={"/buy/payment/" + order.order_id}>确认收货</Button>
          </div>
          }
          <div className={styles.operation}>
            <Button bsSize="normal" href={"/account/order/detail/" + order.order_id}>订单详情</Button>
          </div>
          {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) &&
          <div className={styles.operation}>
            <Button bsSize="normal" href="/account/order/detail/123c">取消订单</Button>
          </div>
          }
          {(order.state == ORDER_STATE.PAY_SUCCESS || order.state == ORDER_STATE.DELIVER) &&
          <div className={styles.operation}>
            <Button bsSize="normal" href="/account/order/detail/123c">退款</Button>
          </div>
          }
        </div>
      </div>
    );
  }

  renderView() {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const {orderSwitch} = this.state;
    const styles = require('./Order.scss');
    const {products, orders} = this.props;
    let selectedOrders = null;
    if (orderSwitch === ORDER_SWITCH.ALL) {
      selectedOrders = orders;
    } else if (orderSwitch == ORDER_SWITCH.UNPAY) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.UNPAY || elem.state == ORDER_STATE.PAY_ERROR;
      })
    } else if (orderSwitch == ORDER_SWITCH.DELIVER) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.DELIVER || elem.state == ORDER_STATE.PAY_SUCCESS
      })
    } else if (orderSwitch == ORDER_SWITCH.CANCELLED) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.CANCELLED
      })
    } else {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.DELIVER_CONFIRM || elem.state == ORDER_STATE.REFUND_CONFIRM
      })
    }
    let orderView = selectedOrders.map(order =>{return this.renderOrder(order)})
    return (
      <div className={styles.orderBox}>
        <div className={styles.section + " " + " clearfix"}>
          <div className={styles.sectionHeader + " clearfix"}>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.ALL ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.ALL)}>全部订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.UNPAY ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.UNPAY)}>待支付订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.DELIVER ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.DELIVER)}>待收货订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.COMPELETE ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.COMPELETE)}>已完成订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.CANCELLED ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.CANCELLED)}>已关闭订单</span>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
          {orderView}
          </div>
        </div>
      </div>
    )
  }

  render() {
    const styles = require('./Order.scss');
    const view = this.renderView();
    return (
      <div className={'container'}>
        {view}
      </div>
    );
  }
}
