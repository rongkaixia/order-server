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
    // new Promise((resolve, reject) => {})
    if (!globalState.orders.orders ||
        !globalState.orders.orders.find(elem => elem.order_id == orderId)) {
      console.log("Detail.js load order info for id " + orderId);
      return dispatch(ordersAction.queryOrder(orderId)).then(() => {
        const globalState = getState();
        const order = globalState.orders.orders.find(elem => elem.order_id == orderId)
        let productIds = order.products.map(e => {return e.product_id});
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
      let productIds = order.products.map(e => {return e.product_id});
      const promises = [...productIds].map((id) => {
        if (id && !shopAction.isProductLoaded(id, globalState))
          return dispatch(shopAction.loadProductInfo(id));
        else
          return Promise.resolve();
      })
      return Promise.all(promises);
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
    console.log("================products==============")
    console.log(order.products);
    console.log(JSON.stringify(products));
    return (
      <div className={styles.orderDetailBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"订单详情"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <div className={styles.process}>
              <ul className={styles.lineText + " clearfix"}>
                <li className={styles.active}>提交订单</li>
                <li className="">买家已付款</li>
                <li className="">待收货</li>
                <li className="">交易完成</li>
              </ul>
            </div>
            <div className={styles.status}>
              <div className={styles.goPay + " clearfix"}>
                <div className={styles.left}>
                  <p>
                    <span>订单状态: 未支付</span>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span>订单金额: 999</span>
                  </p>
                  <p>
                    19小时42分钟22秒 内未付款，将自动取消订单。
                  </p>
                </div>
                <div className={styles.right}>
                  <Button bsSize="normal" bsStyle={"warning"} href={"/buy/payment/" + order.order_id}>立即支付</Button>
                  <Button bsSize="normal" href="/account/order/detail/123c">取消订单</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"收货地址"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <p>{"收货人：" + order.recipients_name}</p>
            <p>{"地址：" + order.recipients_address}</p>
            <p>{"电话：" + order.recipients_phone}</p>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"配送方式"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <p>快递配送（免运费）</p>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"备注"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <p>{order.comment}</p>
          </div>
        </div>
        <div className={styles.section + " " + " clearfix"}
        name='shoppingList'
        id='shoppingList'>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"购物清单"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <div className={styles.shoppingList}>
              <div className={styles.title}>
                <span className={styles.name}>商品</span>
                <span className={styles.subtotal}>小计</span>
                <span className={styles.num}>数量</span>
                <span className={styles.price}>单价</span>
              </div>
              <div className={styles.items}>
                <div className={styles.item}>
                  <div className={styles.itemThump}>
                    <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
                      <img src={imagePath}/> 
                    </a>
                  </div>
                  <div className={styles.itemDesc}>
                    <p>{"product.name"}</p>
                  </div>
                  <span className={styles.subtotal}>{order.real_pay_amt}</span>
                  <span className={styles.num}>{order.num}</span>
                  <span className={styles.price}>{order.real_price}</span>
                </div>
                <div className={styles.item}>
                  <div className={styles.itemThump}>
                    <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
                      <img src={imagePath}/> 
                    </a>
                  </div>
                  <div className={styles.itemDesc}>
                    <p>{"product.name"}</p>
                  </div>
                  <span className={styles.subtotal}>{order.real_pay_amt}</span>
                  <span className={styles.num}>{order.num}</span>
                  <span className={styles.price}>{order.real_price}</span>
                </div>

              </div>
              <div className={styles.summary}>
                <div className={styles.total}>
                  <p>{"商品总计：1799.00"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

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
