import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Modal from 'react-modal';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import Image from 'react-bootstrap/lib/Image';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';
import * as checkoutAction from 'redux/modules/checkout';
import {AddressCard} from 'containers';
import TimerMixin from 'react-timer-mixin';
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

const PAY_METHOD_ONLINE = 'ONLINE';
const PAY_METHOD_COD = 'COD';
const DELIVER_METHOD_EXPRESS = 'EXPRESS';
const DELIVER_METHOD_DTD = 'DTD';

function _validateCheckoutItems(checkoutItems) {
  if (!checkoutItems || !Array.isArray(checkoutItems)){
    return false
  }
  for (let i = 0; i < checkoutItems.length; i++) {
    if (!(checkoutItems[i] instanceof Object) ||
        !("skuId" in checkoutItems[i]) ||
        !("num" in checkoutItems[i])) {
      return false
    }
  }
  return true
}

/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    const globalState = getState();
    let promises = []
    let checkoutItems = globalState.checkout && globalState.checkout.checkoutItems
    console.log("=========checkoutItems=======")
    console.log(JSON.stringify(checkoutItems))
    if (_validateCheckoutItems(checkoutItems)) {
      console.log("_validateCheckoutItems")
      promises = checkoutItems.map((item) => {
        console.log("loadItemInfoBySku")
        return dispatch(checkoutAction.loadItemInfoBySku(item.skuId)).then(() => {
          let pricingReq = {id: item.skuId, num: item.num};
          console.log("pricing")
          return dispatch(checkoutAction.pricing(pricingReq, globalState.csrf._csrf))
        })
      })
    }
    return Promise.all(promises);
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
}])
@connect((state => ({user: state.userInfo.user,
                    checkout: state.checkout,
                    shop: state.shop,
                    authKey: state.csrf._csrf})),
        {...checkoutAction, 
        loadInfo: userAction.loadInfo,
        addAddress: userAction.addUserAddress,
        updateAddress: userAction.updateUserAddress,
        deleteAddress: userAction.deleteUserAddress,
        redirectTo: routeActions.push,
        replace: routeActions.replace})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    checkout: PropTypes.object,
    shop: PropTypes.object,
    authKey: PropTypes.object,
    order: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    selectedAddress: null,
    payMethod: null,
    deliverMethod: DELIVER_METHOD_EXPRESS,
    comment: '',
    submitError: null,
    orderErrorModalIsOpen: false,
    resubmitting: false,
    invalidArgument: false,
    unauthorizedRequest: false,
    countdown: null
  };

  componentWillMount(){
    console.log("componentWillMount");
    let self = this;
    this.intervals = [];
    console.log("==========this.props.checkout.checkoutItems========")
    console.log(JSON.stringify(this.props.checkout.checkoutItems))

    // check invalid post data
    if(!_validateCheckoutItems(this.props.checkout.checkoutItems)) {
      console.log("invalid argument.");
      console.log("redirecting to /");
      this.setState({invalidArgument: true, countdown: 5});
      if (!__SERVER__) {
        // this.intervals.push(setInterval(() => {
        //   self.setState({countdown: self.state.countdown - 1});
        //   if (self.state.countdown <= 0) {
        //     clearInterval();
        //     self.props.replace(Config.mainDomainAbsPath + '/account/order');
        //   }
        // }, 1000))
      }
    }
    // check resubmit
    if(this.props.checkout && this.props.checkout.orderSuccess) {
      console.log("redirecting to /");
      this.setState({resubmitting: true, countdown: 5});
      if (!__SERVER__) {
        this.intervals.push(setInterval(() => {
          self.setState({countdown: self.state.countdown - 1});
          if (self.state.countdown <= 0) {
            clearInterval();
            self.props.replace(Config.mainDomainAbsPath + '/account/order');
          }
        }, 1000))
      }
    }
  }

  componentDidMount(){
    console.log("componentDidMount");  
  }

  componentWillUpdate(){
    console.log("componentWillUpdate");
  }

  componentDidUpdate(){
    console.log("componentDidUpdate");
  }

  componentWillUnmount() {
    this.intervals.forEach(clearInterval);
  }

  componentWillReceiveProps(nextProps) {
    console.log("componentWillReceiveProps: " + JSON.stringify(nextProps));
    // console.log('checkout: ' + JSON.stringify(this.props.checkout));
    // console.log('nextProps: ' + JSON.stringify(nextProps.checkout));
    if (this.props.checkout && nextProps.checkout) {
      if (!this.props.checkout.orderSuccess && nextProps.checkout.orderSuccess) {
        this.props.replace('/buy/payment/' + nextProps.checkout.orderInfo.order_id);
      } else if (nextProps.checkout.orderError) {
        let err = nextProps.checkout.orderErrorDesc;
        this.setState({submitError: '订单提交失败，请稍后再试。' + '(' + JSON.stringify(err) + ')', 
                      orderErrorModalIsOpen: true})
      }
    }
  }

  setAddress = (address, event) => {
    event.preventDefault();
    this.setState({selectedAddress: address});
  }

  setPayMethod = (payMethod, event) => {
    event.preventDefault();
    this.setState({payMethod: payMethod});
  }

  setDeliverMethod = (deliverMethod, event) => {
    event.preventDefault();
    this.setState({deliverMethod: deliverMethod});
  }

  setComment = (event) => {
    event.preventDefault();
    const comment = this.refs.comment;
    this.setState({comment: comment.value});
  }

  handleAddAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle add address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.addAddress(address, authKey)
                     .then(() => {this.props.loadInfo()})
  }

  handleUpdateAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle update address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.updateAddress(address, authKey)
                     .then(() => {return this.props.loadInfo()})
  }

  handleDeleteAddress = (address) => {
    const {authKey} = this.props;
    const {selectedAddress} = this.state;
    console.log('handle delete address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.deleteAddress(address, authKey)
                     .then(() => {return this.props.loadInfo()})
                     .then(() => {
                        if (selectedAddress && address.addressId == selectedAddress.addressId) {
                          this.setState({selectedAddress: null});
                        }
                     })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const {authKey, user, checkout} = this.props;
    const {selectedAddress, payMethod, deliverMethod, comment} = this.state;
    // validate form
    if (!selectedAddress) {
      this.setState({submitError: '请选择收货地址', orderErrorModalIsOpen: true})
    }else if (!payMethod) {
      this.setState({submitError: '请选择支付方式', orderErrorModalIsOpen: true})
    }else if (!deliverMethod) {
      this.setState({submitError: '请选择配送方式', orderErrorModalIsOpen: true})
    }else {
      let items = checkout.checkoutItems.map((item) => {
        return {skuId: item.skuId, num: item.num};
      })
      let req = {userId: user.user_id,
                title: 'buy',
                items: items,
                payMethod: payMethod,
                deliverMethod: deliverMethod,
                recipientsName: selectedAddress.recipientsName,
                recipientsPhone: selectedAddress.recipientsPhone,
                recipientsAddress: selectedAddress.recipientsAddress,
                comment: comment};
      console.log("sending order request: " + JSON.stringify(req));
      this.props.order(req, authKey)
    }
  }

  afterOpenValidateModal() {

  }

  closeValidateModal(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({submitError: null, orderErrorModalIsOpen: false});
  }

  renderValidateFormErrorModal() {
    const {submitError} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.orderErrorModalIsOpen}
          onAfterOpen={this.afterOpenValidateModal}
          onRequestClose={this.closeValidateModal}
          style={customStyles} >
          <div>
            <h4 ref="subtitle"><button style={{float: 'right'}} onClick={this.closeValidateModal.bind(this)}>X</button></h4>
            {submitError}
            <button className="btn btn-success" onClick={this.closeValidateModal.bind(this)}>
            确定
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  renderAddress() {
    const styles = require('./Checkout.scss');
    const {user} = this.props;
    const selectedAddress = this.state.selectedAddress;
    let addressCards = [];
    if (user.addresses) {
      let index = 0;
      user.addresses.forEach((address) => {
        let addressFormatted = {addressId: address.address_id,
                                recipientsName: address.recipients_name,
                                recipientsPhone: address.recipients_phone,
                                recipientsAddress: address.recipients_address};
        addressCards.push(
          <AddressCard address={addressFormatted}
          checked={selectedAddress && selectedAddress.addressId === addressFormatted.addressId ? true : null}
          onClick={this.setAddress.bind(this, addressFormatted)}
          onAddAddress={this.handleAddAddress.bind(this)}
          onUpdateAddress={this.handleUpdateAddress.bind(this)}
          onDeleteAddress={this.handleDeleteAddress.bind(this)}/>
        );
        index += 1;
      })
    }
    addressCards.push(
      <AddressCard 
      onAddAddress={this.handleAddAddress.bind(this)}
      onUpdateAddress={this.handleUpdateAddress.bind(this)}
      onDeleteAddress={this.handleDeleteAddress.bind(this)}/>
    );
    return addressCards;
  }

  renderItem(item) {
    const styles = require('./Checkout.scss');
    return (
      <div className={styles.item}>
        <div className={styles.itemThump}>
          <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
            <img src={item.images.thumbnail}/> 
          </a>
        </div>
        <div className={styles.itemDesc}>
          <p>{item.name}</p>
        </div>
        <span className={styles.subtotal}>{item.realPayAmt}</span>
        <span className={styles.num}>{item.num}</span>
        <span className={styles.price}>{item.realPrice}</span>
      </div>
    );
  }

  renderView() {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const styles = require('./Checkout.scss');
    const {user, checkout} = this.props;
    const selectedAddress = this.state.selectedAddress;
    const payMethod = this.state.payMethod;
    const deliverMethod = this.state.deliverMethod;
    const addressView = this.renderAddress();
    const itemView = checkout.checkoutItems.map((item) => {
      return this.renderItem(item);
    })

    return (
      <div className={styles.checkoutBox}>
        <div className={styles.section}>
          <div className={styles.sectionHeader + " clearfix"}>
            <h3 className={styles.title}>{"收货地址"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <ul>{addressView}</ul>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}
        name="payMethod"
        id="payMethod">
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"支付方式"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <ButtonToolbar>
              <Button bsSize="large" 
              active={payMethod === PAY_METHOD_ONLINE ? true : false}
              onClick={this.setPayMethod.bind(this, PAY_METHOD_ONLINE)}>在线支付</Button>
              <Button bsSize="large" 
              active={payMethod === PAY_METHOD_COD ? true : false}
              onClick={this.setPayMethod.bind(this, PAY_METHOD_COD)}>货到付款</Button>
            </ButtonToolbar>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"配送方式"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <Button bsSize="large" active={true}>快递配送（免运费）</Button>
          </div>
        </div>
        <div className={styles.section + " " + styles.sectionOptions + " clearfix"}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.title}>{"备注"}</h3>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
            <textarea ref="comment" name="Text1" cols="40" rows="5" placeholder="请输入备注信息"
            onBlur={this.setComment.bind(this)}>
            </textarea>
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
                {itemView}
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
    const {resubmitting, invalidArgument, countdown} = this.state;
    if (resubmitting) {
      return (
        <div className={'container'}>
        <h4>{'请勿重复提交表单，正在跳转到购物车页面...' + countdown + 's'}</h4>
        </div>
      );
    } else if(invalidArgument) {
      return (
        <div className={'container'}>
        <h4>{'非法参数，正在跳转到首页...' + countdown + 's'}</h4>
        </div>
      );
    }

    let view = this.renderView();
    let validateErrorModal = this.renderValidateFormErrorModal();

    return (
      <div className={'container'}>
        {view}
        {validateErrorModal}
      </div>
    );
  }
}
