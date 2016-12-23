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
import * as cartAction from 'redux/modules/cart';


// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    let loadCartPromise = Promise.resolve()
    if (!cartAction.isCartLoaded(getState())) {
      loadCartPromise = dispatch(cartAction.loadCart())
    }
    return loadCartPromise.then(() => {
      const globalState = getState();
      if (globalState.cart && globalState.cart.data) {
        let productIds = globalState.cart.data.map(e => {return e.productId});
        const promises = [...productIds].map((id) => {
          if (id && !shopAction.isProductLoaded(id, globalState))
            return dispatch(shopAction.loadProductInfo(id));
          else
            return Promise.resolve();
        })
        return Promise.all(promises);
      } else {
        return Promise.resolve();
      }
    })
  }
}])
@connect((state => ({user: state.userInfo.user,
                     cart: state.cart.data,
                     products: state.shop.productsById})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    products: PropTypes.object,
    cart: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  renderItem(item) {
    const styles = require('./Cart.scss');
    const product = this.props.products[item.productId]
    const imagePath = product.images.thumbnail;
    const subtotal = item.num * product.real_price;
    return (
      <div className={styles.item}>
        <input className={styles.checkbox} name="Fruit" type="checkbox" value=""/>
        <div className={styles.itemThump}>
          <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
            <img src={imagePath}/> 
          </a>
        </div>
        <div className={styles.itemDesc}>
          <p>{product.name}</p>
        </div>
        <span className={styles.operation}>删除</span>
        <span className={styles.subtotal}>{subtotal}</span>
        <span className={styles.num}>{item.num}</span>
        <span className={styles.price}>{product.real_price}</span>
      </div>
    )
  }

  renderView(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, products, cart} = this.props;
    const styles = require('./Cart.scss');
    const imagePath = require('../../../static/diaozhui80X80.jpg');
    let total = 0.0
    let itemView = cart.map(item => {
      console.log(JSON.stringify(item))
      console.log(JSON.stringify(products))
      let product = products[item.productId]
      console.log(JSON.stringify(product))
      total += product.real_price * item.num
      return this.renderItem(item);
    })
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
          {itemView}
          </div>
          <div className={styles.summary}>
            <div className={styles.submitButton}>
              <Button bsSize="large" bsStyle={"warning"} href="/buy/checkout/123c">结算</Button>
            </div>
            <div className={styles.total}>
              <span>{"商品总计：" + total.toString()}</span>
            </div>
          </div>
        </div>

      </div>
    );
  }

  render() {
    const styles = require('./Cart.scss');
    let itemView = null;
    itemView = this.renderView({name: "test"});

    return (
      <div className={'container'}>
        {itemView}
      </div>
    );
  }
}
