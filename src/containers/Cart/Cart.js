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
import Querystring from 'querystring';
import Config from 'config';

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
        let skuIds = globalState.cart.data.map(e => {return e.sku_id});
        const promises = [...skuIds].map((id) => {
          if (id && !shopAction.isItemLoaded(id, globalState))
            return dispatch(shopAction.loadItemInfoBySku(id));
          else
            return Promise.resolve();
        })
        return Promise.all(promises);
      } else {
        return Promise.resolve();
      }
    }).then(() => { // pricing
      console.log("=========cart asyncConnect pricing============")
      const globalState = getState();
      if (globalState.cart && globalState.cart.data) {
        const promises = globalState.cart.data.map(cartItem => {
          let pricingReq = {id: cartItem.sku_id, num: cartItem.num};
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
                     shop: state.shop,
                     auth: state.auth,
                     authKey: state.csrf._csrf})),
        {...cartAction, redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    auth: PropTypes.object,
    shop: PropTypes.object,
    cart: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    selectedItems: {},
    submitError: null,
    deleteModalIsOpen: false,
    deleteItem: null,
    deleteCartError: null
  };

  componentWillMount(){
    console.log("componentWillMount");
    let selectedItems = {}
    this.props.cart.data.forEach((cartItem) => {
      selectedItems[cartItem.sku_id] = false
    })
    this.setState({selectedItems: selectedItems})
  }

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
    return this.props.updateCart({skuId: cartItem.sku_id, num: num}, this.props.authKey)
    .then(() => {
      let pricingReq = {id: cartItem.sku_id, num: num}
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
      this.props.updateCart({skuId: cartItem.sku_id, num: num}, this.props.authKey)
      .then(() => {
        let pricingReq = {id: cartItem.sku_id, num: num}
        return this.props.pricing(pricingReq, this.props.authKey)
      })
      .catch((err) => {
        console.log("decreaseNum error: " + JSON.stringify(err))
      })
    }
  }

  deleteCart(item, event) {
    this.setState({deleteCartError: null})
    this.props.deleteCart({skuId: item.sku_id}, this.props.authKey)
    .then(() => {
      this.setState({deleteModalIsOpen: false});
    })
    .catch(err => {
      this.setState({deleteCartError: JSON.stringify(err)})
      console.log(err);
    })
  }

  checkCart(item, event) {
    const {selectedItems} = this.state;
    selectedItems[item.sku_id] = !selectedItems[item.sku_id]
    this.setState({selectedItems: selectedItems})
  }

  handleSubmit(event) {
    const {selectedItems} = this.state;
    const {location, auth} = this.props;
    if (!auth.loggedIn) {
      event.preventDefault();
      const redirectPath = location.pathname + location.search;
      const returnTo = '?' + Querystring.stringify({return_to: redirectPath});
      console.log("returnTo: " + returnTo)
      this.props.redirectTo('/login' + returnTo)
      return
    }
    const numItemSelected = Object.keys(selectedItems).map((id) => {return selectedItems[id]})
                                                     .reduce((a,b) => {return a + b})
    if (numItemSelected <= 0) {
      event.preventDefault();
      this.setState({submitError: "请选择要购买的物品"})
    }

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
    const {selectedItems} = this.state;
    const itemInfo = this.props.shop.items.filter((elem) => {return elem._id == item.sku_id})[0]
    const imagePath = itemInfo.images.thumbnail;
    let productName = itemInfo.name;
    Object.keys(itemInfo.sell_props).map(choiceName => {
      productName += "-" + choiceName + "(" + itemInfo.sell_props[choiceName] + ")";
    })
    const subtotal = item.real_pay_amt;
    return (
      <div className={styles.item}>
        <input className={styles.checkbox}
              type="checkbox" 
              checked={selectedItems[item.sku_id]}
              onClick={this.checkCart.bind(this, item)}/>
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
        <span className={styles.price}>{item.real_price}</span>
      </div>
    )
  }

  renderView() {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, shop, cart, authKey} = this.props;
    const {selectedItems, submitError} = this.state;
    const styles = require('./Cart.scss');
    const imagePath = require('../../../static/diaozhui80X80.jpg');
    let total = 0.0
    let itemView = cart.data.map(item => {
      total += Number(item.real_pay_amt);
      return this.renderItem(item);
    })
    let deleteCartItemView = this.renderDeleteCartModal()
    let index = 0
    const hiddenInputs = cart.data.filter((item) => {return selectedItems[item.sku_id]})
                          .map((item) => {
                            let skuIdName = "items[" + index + "][skuId]"
                            let numName = "items[" + index + "][num]"
                            index += 1
                            return (
                              <div>
                                <input type="hidden" name={skuIdName} value={item.sku_id} />
                                <input type="hidden" name={numName} value={item.num} />
                              </div>
                            )
                         })
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
            {submitError && <div>{submitError}</div>}
            <form id="shop-form" action={"http://" + Config.orderDomain + "/buy/checkout"} 
            method="post" onSubmit={this.handleSubmit.bind(this)}>
              {hiddenInputs}
              <input name="_csrf" type="hidden" value={authKey} />
              <div className={styles.submitButton}>
                <Button bsSize="large" bsStyle={"warning"} type="submit">结算</Button>
              </div>
            </form>

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
    itemView = this.renderView();

    return (
      <div className={'container'}>
        {itemView}
      </div>
    );
  }
}
