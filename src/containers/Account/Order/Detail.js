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
import {AddressCard} from 'containers';


// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(shopAction.loadNecklace());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
}])
@connect((state => ({user: state.userInfo.user,
                    necklace: state.shop.products.necklace})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    necklace: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  renderChoice(item) {
    const styles = require('./Detail.scss');
    return (
      <div>
      </div>
    );
  }
  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const styles = require('./Detail.scss');
    const imagePath = require('../../../../static/diaozhui80X80.jpg');
    return (
      <div className={styles.orderDetailBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"订单号：1160801496603390 "}</h3>
            <div className={styles.operation}>
              <Button bsSize="normal" bsStyle={"warning"} href="/buy/payment">立即支付</Button>
            </div>

            <div className={styles.operation}>
              <Button bsSize="normal" href="/account/order/detail/123c">订单详情</Button>
            </div> 
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <h4 className>{"等待付款"}</h4>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"收货地址"}</h3>
            <h3 className={styles.modify}>{"修改"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <table class="info-table">
              <tbody>
                <tr>
                    <th>姓&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;名：</th>
                    <td>小红</td>
                </tr>
                <tr>
                    <th>联系电话：</th>
                    <td>150****9344</td>
                </tr>
                <tr>
                    <th>收货地址：</th>
                    <td>广东 揭阳市 普侨区 乔南路口氨基酸的路口附近</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.section + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"支付及配送方式"}</h3>
            <h3 className={styles.modify}>{"修改"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <table class="info-table">
              <tbody>
                <tr>
                    <th>支付方式：</th>
                    <td>在线支付</td>
                </tr>
                <tr>
                    <th>配送方式：</th>
                    <td>快递配送（免运费）</td>
                </tr>
                <tr>
                    <th>送达时间：</th>
                    <td>现在支付，预计2-3天送达</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.section + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"备注"}</h3>
            <h3 className={styles.modify}>{"修改"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <table class="info-table">
              <tbody>
                <tr>
                    <th>备注内容：</th>
                    <td>在线支付</td>
                </tr>
              </tbody>
            </table>

          </div>
        </div>
        <div className={styles.section + " " + " clearfix"}>
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
                <div className={styles.itemThump}>
                  <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
                    <img src={imagePath}/> 
                  </a>
                </div>
                <div className={styles.itemDesc}>
                  <p>{item.name}</p>
                </div>
                <span className={styles.subtotal}>1799</span>
                <span className={styles.num}>1</span>
                <span className={styles.price}>1799</span>
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
    const {necklace} = this.props;
    let item = necklaces[0];
    let itemView = null;
    if (item) {
      itemView = this.renderItem(item);
    }

    return (
      <div className={'container'}>
        {itemView}
      </div>
    );
  }
}
