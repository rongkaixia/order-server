import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import Modal from 'react-modal';
import { asyncConnect } from 'redux-async-connect';
import Image from 'react-bootstrap/lib/Image';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';
import * as userAction from 'redux/modules/userInfo';
import * as cartAction from 'redux/modules/cart';

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)'
  }
};

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}}) => {
    let loadCartPromise = Promise.resolve()
    if (!cartAction.isCartLoaded(getState())) {
      loadCartPromise = dispatch(cartAction.loadCart())
    }
    return loadCartPromise.then(() => { // load product info
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
    }).then(() => { // pricing
      const globalState = getState();
      if (globalState.cart && globalState.cart.data) {
        const promises = globalState.cart.data.map(cartItem => {
          let pricingReq = {id: cartItem.productId, num: cartItem.num, choices: cartItem.choices};
          return dispatch(cartAction.pricing(pricingReq, globalState.csrf._csrf))
        })
        return Promise.all(promises);
      } else {
        return Promise.resolve();
      }
    })
  }
}])
@connect((state => ({user: state.userInfo.user,
                     cart: state.cart,
                     products: state.shop.productsById,
                     authKey: state.csrf._csrf})),
        {...cartAction, redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    products: PropTypes.object,
    cart: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    deleteModalIsOpen: false,
    deleteItem: null,
    deleteCartError: null
  };

  openDeleteModel = (cartItem, event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({deleteItem: cartItem, deleteModalIsOpen: true});
  }

  afterOpenDeleteModal = (event) => {
  }

  closeDeleteModel = (event) => {
    // event.preventDefault();
    this.setState({deleteModalIsOpen: false,
                  deleteCartError: null});
  }

  increaseNum(cartItem, event) {
    let num = cartItem.num + 1;
    return this.props.updateCart({cartId: cartItem.cartId, num: num}, this.props.authKey)
    .then(() => {
      let pricingReq = {id: cartItem.productId, num: num, choices: cartItem.choices}
      return this.props.pricing(pricingReq, this.props.authKey)
    })
    .catch((err) => {
      console.log("increaseNum error: " + JSON.stringify(err))
    })
  }

  decreaseNum(cartItem, event) {
    if (cartItem.num <= 1) {
      return
    } else {
      let num = cartItem.num - 1;
      this.props.updateCart({cartId: cartItem.cartId, num: num}, this.props.authKey)
      .then(() => {
        let pricingReq = {id: cartItem.productId, num: num, choices: cartItem.choices}
        return this.props.pricing(pricingReq, this.props.authKey)
      })
      .catch((err) => {
        console.log("decreaseNum error: " + JSON.stringify(err))
      })
    }
  }

  deleteCart(item, event) {
    this.setState({deleteCartError: null})
    this.props.deleteCart({cartId: item.cartId}, this.props.authKey)
    .then(() => {
      this.setState({deleteModalIsOpen: false});
    })
    .catch(err => {
      this.setState({deleteCartError: JSON.stringify(err)})
      console.log(err);
    })
  }

  renderDeleteCartModal() {
    const {authKey} =  this.props;
    const {deleteItem, deleteCartError} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.deleteModalIsOpen}
          onAfterOpen={this.afterOpenDeleteModal}
          onRequestClose={this.closeDeleteModel}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">删除<button style={{float: 'right'}} onClick={this.closeDeleteModel}>X</button></h4>
            {!deleteCartError  && <div>确定删除该收藏物品吗？</div>}
            {deleteCartError && <div>{'删除失败，请稍后重试。'}</div>}
            <button className="btn btn-success" onClick={this.deleteCart.bind(this, deleteItem)}>
            {'确定'}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  renderItem(item) {
    const styles = require('./Cart.scss');
    const product = this.props.products[item.productId]
    const imagePath = product.images.thumbnail;
    const subtotal = item.realPayAmt;
    let productName = product.name;
    Object.keys(item.choices).map(choiceName => {
      productName += "-" + choiceName + "(" + item.choices[choiceName] + ")";
    })
    return (
      <div className={styles.item}>
        <input className={styles.checkbox} name="Fruit" type="checkbox" value=""/>
        <div className={styles.itemThump}>
          <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
            <img src={imagePath}/> 
          </a>
        </div>
        <div className={styles.itemDesc}>
          <p>{productName}</p>
        </div>
        <span className={styles.operation}><a onClick={this.openDeleteModel.bind(this, item)}>删除</a></span>
        <span className={styles.subtotal}>{subtotal}</span>
        <span className={styles.num}>
          <ButtonGroup>
            <Button bsSize="small" onClick={this.decreaseNum.bind(this, item)}>-</Button>
            <Button bsSize="small">{item.num}</Button>
            <Button bsSize="small" onClick={this.increaseNum.bind(this, item)}>+</Button>
          </ButtonGroup>
        </span>
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
    let itemView = cart.data.map(item => {
      let product = products[item.productId]
      total += item.realPayAmt;
      return this.renderItem(item);
    })
    let deleteCartItemView = this.renderDeleteCartModal()
    return (
      <div className={styles.checkoutBox}>
        {deleteCartItemView}
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
