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
import * as shopAction from 'redux/modules/shop';
import * as userAction from 'redux/modules/userInfo';
import * as orderAction from 'redux/modules/order';
import {AddressCard} from 'containers';

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
        {...orderAction, 
        loadInfo: userAction.loadInfo,
        addAddress: userAction.addUserAddress,
        updateAddress: userAction.updateUserAddress,
        deleteAddress: userAction.deleteUserAddress,
        redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    necklace: PropTypes.object,
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
    validateModalIsOpen: false
  };

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
    return this.props.addAddress({recipientsName: address.recipientsName, 
                                  recipientsPhone: address.recipientsPhone, 
                                  recipientsAddress: address.recipientsAddress, 
                                  authKey: authKey})
                     .then(() => {this.props.loadInfo()})
  }

  handleUpdateAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle update address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.updateAddress({id: address.id,
                                    recipientsName: address.recipientsName, 
                                    recipientsPhone: address.recipientsPhone, 
                                    recipientsAddress: address.recipientsAddress, 
                                    authKey: authKey})
                     .then(() => {return this.props.loadInfo()})
  }

  handleDeleteAddress = (address) => {
    const {authKey} = this.props;
    const {selectedAddress} = this.state;
    console.log('handle update address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.deleteAddress({id: address.id,
                                    authKey: authKey})
                     .then(() => {return this.props.loadInfo()})
                     .then(() => {
                        if (selectedAddress && address.id == selectedAddress.id) {
                          this.setState({selectedAddress: null});
                        }
                     })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const {authKey, user, location} = this.props;
    const {selectedAddress, payMethod, deliverMethod, comment} = this.state;
    // validate form
    if (!selectedAddress) {
      this.setState({submitError: '请选择收货地址', validateModalIsOpen: true})
    }else if (!payMethod) {
      this.setState({submitError: '请选择支付方式', validateModalIsOpen: true})
    }else if (!deliverMethod) {
      this.setState({submitError: '请选择配送方式', validateModalIsOpen: true})
    }else {
      let productId = location.pathname.split("/").reverse()[0]
      let req = {userId: user.userId,
                title: 'buy',
                productId: productId,
                num: 1,
                payMethod: payMethod,
                deliverMethod: deliverMethod,
                recipientsName: selectedAddress.recipientsName,
                recipientsPhone: selectedAddress.recipientsPhone,
                recipientsAddress: selectedAddress.recipientsAddress,
                comment: comment};
      console.log("sending order request: " + JSON.stringify(req));
      this.props.order(req, authKey)
      .then((data) => {
        this.props.redirectTo('/buy/payment');
      })
      .catch((err) => {
        this.setState({submitError: '订单提交失败，请稍后再试。' + '(' + JSON.stringify(err) + ')', 
                      validateModalIsOpen: true})
      })
    }
  }

  afterOpenValidateModal() {

  }

  closeValidateModal(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({submitError: null, validateModalIsOpen: false});
  }

  renderValidateFormErrorModal() {
    const {submitError} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.validateModalIsOpen}
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

  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const styles = require('./Checkout.scss');
    const {user} = this.props;
    const imagePath = item.images.thumbnail;
    const selectedAddress = this.state.selectedAddress;
    const payMethod = this.state.payMethod;
    const deliverMethod = this.state.deliverMethod;
    console.log("imagePath: " + imagePath);

    let addressCards = [];
    if (user.addressarrayList) {
      let index = 0;
      user.addressarrayList.forEach((address) => {
        addressCards.push(
          <AddressCard address={address}
          checked={selectedAddress && selectedAddress.id === address.id ? true : null}
          onClick={this.setAddress.bind(this, address)}
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
    let validateErrorModal = this.renderValidateFormErrorModal();

    return (
      <div className={'container'}>
        {itemView}
        {validateErrorModal}
      </div>
    );
  }
}
