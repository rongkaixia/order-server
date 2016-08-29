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
    const styles = require('./Cart.scss');
    return (
      <div>
      </div>
    );
  }
  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const styles = require('./Cart.scss');
    const imagePath = require('../../../static/diaozhui80X80.jpg');
    return (
      <div className={styles.checkoutBox}>

        <div className={styles.cart}>
          <div className={styles.title}>
            <span className={styles.checkbox}>全选</span>
            <span className={styles.name}>商品</span>
            <span className={styles.operation}>操作</span>
            <span className={styles.subtotal}>小计</span>
            <span className={styles.num}>数量</span>
            <span className={styles.price}>单价</span>
          </div>
          <div className={styles.items}>
            <input className={styles.checkbox} name="Fruit" type="checkbox" value=""/>
            <div className={styles.itemThump}>
              <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
                <img src={imagePath}/> 
              </a>
            </div>
            <div className={styles.itemDesc}>
              <p>{item.name}</p>
            </div>
            <span className={styles.operation}>删除</span>
            <span className={styles.subtotal}>1799</span>
            <span className={styles.num}>1</span>
            <span className={styles.price}>1799</span>
          </div>
          <div className={styles.summary}>
            <div className={styles.submitButton}>
              <Button bsSize="large" bsStyle={"warning"} href="/buy/checkout/123c">结算</Button>
            </div>
            <div className={styles.total}>
              <span>{"商品总计：1799.00"}</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  render() {
    const styles = require('./Cart.scss');
    const {necklace} = this.props;
    let item = necklace['0000001'];
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
