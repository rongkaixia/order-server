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
import * as orderAction from 'redux/modules/order';
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
                    necklace: state.shop.products.necklace,
                    authKey: state.csrf._csrf})),
        {...orderAction, redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    necklace: PropTypes.object,
    authKey: PropTypes.object,
    order: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };

  renderChoice(item) {
    const styles = require('./Checkout.scss');
    return (
      <div>
      </div>
    );
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const {authKey} = this.props;
    this.props.order({test: "test"}, authKey);
  }

  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const styles = require('./Checkout.scss');
    const imagePath = item.images.thumbnail;
    console.log("imagePath: " + imagePath);
    let addressCards = [];
    if (user.addressarrayList) {
      user.addressarrayList.forEach((address) => {
        addressCards.push(
          <AddressCard address={address} checked/>
        );
      })
    }
    addressCards.push(
      <AddressCard />
    );
    return (
      <div className={styles.checkoutBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"收货地址"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <ul>{addressCards}</ul>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"支付方式"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <ButtonToolbar>
              <Button bsSize="large">在线支付</Button>
              <Button bsSize="large">货到付款</Button>
            </ButtonToolbar>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"配送方式"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <Button bsSize="large">快递配送（免运费）</Button>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"备注"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <textarea name="Text1" cols="40" rows="5" placeholder="请输入备注信息">
            </textarea>
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
              <div className={styles.submit}>
                <div className={styles.submitButton}>
                  <Button bsSize="large" bsStyle={"warning"} onClick={this.handleSubmit}>提交订单</Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }

  render() {
    const styles = require('./Checkout.scss');
    const {necklace, location} = this.props;
    var id = location.pathname.split("/").reverse()[0]
    let item = necklace[id];
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
