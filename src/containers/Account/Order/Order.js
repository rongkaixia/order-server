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
  COMPELETE: 'COMPELETE'
}

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(ordersAction.queryOrders()).then(() => {
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
  }
}])
@connect((state => ({user: state.userInfo.user,
                    orders: state.orders.orders,
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

  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const styles = require('./Order.scss');
    const imagePath = require('../../../../static/diaozhui80X80.jpg');
    let addressCards = [];
    if (user.addresses) {
      user.addresses.forEach((address) => {
        addressCards.push(
          <AddressCard address={address}/>
        );
      })
    }
    addressCards.push(
      <AddressCard />
    );

    return (
      <div className={styles.order + " clearfix"}>
        <div className={styles.header + " clearfix"}>
          <h4 className={styles.status}>{"待支付"}</h4>
          <p className={styles.time}>{"下单时间：2016年3月1号 订单号：20228819433487920"}</p>
          <p className={styles.total}>{"订单金额：2799"}</p>
        </div>
        <div className={styles.items + " clearfix"}>
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

          <div className={styles.operation}>
            <Button bsSize="normal" bsStyle={"warning"} href="/buy/payment">立即支付</Button>
          </div>

          <div className={styles.operation}>
            <Button bsSize="normal" href="/account/order/detail/123c">订单详情</Button>
          </div>              
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
    let item = products[orders[0].product_id];
    let itemView = null;
    if (item) {
      itemView = this.renderItem(item);
    }
    return (
      <div className={styles.orderBox}>
        <div className={styles.section + " " + " clearfix"}>
          <div className={styles.sectionHeader + " clearfix"}>
              <span className={styles.item} active={orderSwitch === ORDER_SWITCH.ALL ? true : false}>全部订单</span>
              <span className={styles.item + " " + styles.active}>待支付订单</span>
              <span className={styles.item}>待收货订单</span>
              <span className={styles.item}>已完成订单</span>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
          {itemView}
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
