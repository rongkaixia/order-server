import _ from 'lodash';
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
import * as ordersAction from 'redux/modules/order'; 
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
  COMPELETE: 'COMPELETE',
  CANCELLED: 'CANCELLED'
}

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
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(ordersAction.queryOrder()).then(() => {
      const globalState = getState();
      let skuIds = new Set(_.flatMap(globalState.order.orders, (order) => {
        return order.items.map(e => {return e.sku_id});
      }))
      const promises = [...skuIds].map((id) => {
        if (id && !shopAction.isItemLoaded(id, globalState))
          return dispatch(shopAction.loadItemInfoBySku(id));
        else
          return Promise.resolve();
      })
      return Promise.all(promises);
    })
  }
}])
@connect((state => ({user: state.userInfo.user,
                    authKey: state.csrf._csrf,
                    orders: state.order.orders,
                    shop: state.shop})),
        {deliverAction: ordersAction.deliver,
         deliverConfirmAction: ordersAction.deliverConfirm,
         refundAction: ordersAction.refund,
         refundConfirmAction: ordersAction.refundConfirm,
         cancelOrderAction: ordersAction.cancel,
         queryOrderAction: ordersAction.queryOrder,
         redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    orders: PropTypes.object,
    shop: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    orderSwitch: ORDER_SWITCH.UNPAY,
    orderIdToBeCancelled: null,
    cancelOrderModalIsOpen: false,
    cancelOrderError: null,
    orderIdToBeRefunded: null,
    refundOrderModalIsOpen: false,
    refundOrderError: null,
    orderIdToBeConfirm: null,
    deliverConfirmOrderModalIsOpen: false,
    deliverConfirmOrderError: null
  };

  switchOrderState(newState) {
    this.setState({orderSwitch: newState});
  }

  openCancelOrderModal = (orderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({cancelOrderModalIsOpen: true, orderIdToBeCancelled: orderId});
  }

  closeCancelOrderModal = (event) => {
    // event.preventDefault();
    this.setState({cancelOrderModalIsOpen: false,
                   cancelOrderError: null,
                   orderIdToBeCancelled: null});
  }

  openRefundOrderModel = (orderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({refundOrderModalIsOpen: true, orderIdToBeRefunded: orderId});
  }

  closeRefundOrderModel = (event) => {
    // event.preventDefault();
    this.setState({refundOrderModalIsOpen: false,
                   refundOrderError: null,
                   orderIdToBeRefunded: null});
  }

  openDeliverConfirmOrderModel = (orderId, event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({deliverConfirmOrderModalIsOpen: true, orderIdToBeConfirm: orderId});
  }

  closeDeliverConfirmOrderModel = (event) => {
    // event.preventDefault();
    this.setState({deliverConfirmOrderModalIsOpen: false,
                   deliverConfirmOrderError: null,
                   orderIdToBeConfirm: null});
  }

  // TODO: 测试发货接口，后续删除
  handleDeliver(orderId) {
    const {authKey} = this.props;
    this.props.deliverAction({orderId: orderId}, authKey)
    .then(() => {
      return this.props.queryOrderAction()
    })
    .catch( err => {
      console.log("handleDeliver error: " + JSON.stringify(err))
    })
  }

  handleDeliverConfirm(orderId) {
    const {authKey} = this.props;
    this.props.deliverConfirmAction({orderId: orderId}, authKey)
    .then(() => {
      return this.props.queryOrderAction()
    })
    .then(() => {
      this.setState({deliverConfirmOrderModalIsOpen: false,
                     deliverConfirmOrderError: null,
                     orderIdToBeConfirm: null});
    })
    .catch( err => {
      console.log("handleDeliverConfirm error: " + JSON.stringify(err))
      this.setState({deliverConfirmOrderError: JSON.stringify(err)})
    })  
  }

  handleRefund(orderId) {
    const {authKey} = this.props;
    this.props.refundAction({orderId: orderId}, authKey)
    .then(() => {
      return this.props.queryOrderAction()
    })
    .then(() => {
      this.setState({refundOrderModalIsOpen: false,
                     refundOrderError: null,
                     orderIdToBeRefunded: null});
    })
    .catch( err => {
      console.log("handleRefund error: " + JSON.stringify(err))
      this.setState({refundOrderError: JSON.stringify(err)})
    })
  }

  handleCancel(orderId) {
    const {authKey} = this.props;
    this.props.cancelOrderAction({orderId: orderId}, authKey)
    .then(() => {
      return this.props.queryOrderAction()
    })
    .then(() => {
      this.setState({cancelOrderModalIsOpen: false,
                     cancelOrderError: null,
                     orderIdToBeCancelled: null});
    })
    .catch( err => {
      console.log("handleCancel error: " + JSON.stringify(err))
      this.setState({cancelOrderError: JSON.stringify(err)})
    })
  }

  renderCancelOrderModal() {
    const {authKey} =  this.props;
    const {cancelOrderError, orderIdToBeCancelled} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.cancelOrderModalIsOpen}
          onRequestClose={this.closeCancelOrderModal}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">删除订单 <button style={{float: 'right'}} onClick={this.closeCancelOrderModal}>X</button></h4>
            {!cancelOrderError  && 
            <div>
              <div>确定删除该订单吗？</div>
              <button className="btn btn-success" onClick={this.handleCancel.bind(this, orderIdToBeCancelled)}>确定</button>
            </div>
            }
            {cancelOrderError && <div>{'删除订单失败，请稍后重试。'}</div>}
          </div>
        </Modal>
      </div>
    );
  }

  renderDeliverConfirmOrderModal() {
    const {authKey} =  this.props;
    const {deliverConfirmOrderError, orderIdToBeConfirm} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.deliverConfirmOrderModalIsOpen}
          onRequestClose={this.closeDeliverConfirmOrderModel}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">收货 <button style={{float: 'right'}} onClick={this.closeDeliverConfirmOrderModel}>X</button></h4>
            {!deliverConfirmOrderError  && 
            <div>
              <div>确定收货吗？</div>
              <button className="btn btn-success" onClick={this.handleDeliverConfirm.bind(this, orderIdToBeConfirm)}>确定</button>
            </div>
            }
            {deliverConfirmOrderError && <div>{'确定收货失败，请稍后重试。'}</div>}
          </div>
        </Modal>
      </div>
    );
  }

  renderRefundOrderModal() {
    const {refundOrderError, orderIdToBeRefunded} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.refundOrderModalIsOpen}
          onRequestClose={this.closeRefundOrderModel}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">退款 <button style={{float: 'right'}} onClick={this.closeRefundOrderModel}>X</button></h4>
            {!refundOrderError  && 
            <div>
              <div>确定申请退款吗？</div>
              <button className="btn btn-success" onClick={this.handleRefund.bind(this, orderIdToBeRefunded)}>确定</button>
            </div>
            }
            {refundOrderError && <div>{'申请退款失败，请稍后重试。'}</div>}
          </div>
        </Modal>
      </div>
    );
  }

  renderOrderItem(item) {
    const styles = require('./Order.scss');
    const imagePath = item.images.thumbnail;
    
    return (
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
    )
  }

  renderOrder(order) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, shop} = this.props;
    const styles = require('./Order.scss');
    let orderState = "";
    if (order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) {
      orderState = "待支付";
    } else if(order.state == ORDER_STATE.DELIVER_CONFIRM) {
      orderState = "已完成"
    } else if(order.state == ORDER_STATE.REFUND_CONFIRM) {
      orderState = "已退款"
    } else if(order.state == ORDER_STATE.CANCELLED) {
      orderState = "已关闭"
    } else if(order.state == ORDER_STATE.DELIVER || order.state == ORDER_STATE.PAY_SUCCESS) {
      orderState = "待收货"
    } else if(order.state == ORDER_STATE.REFUND) {
      orderState = "退款中"
    }
    console.log(order);
    console.log("===================ORDER_STATE=============");
    console.log(orderState)
    const createAt = new Date(Number(order.create_at)).toString();
    let itemsView = order.items.map(item => {
      const itemInfo = shop.items.find((elem) => {return elem._id == item.sku_id})
      return this.renderOrderItem(itemInfo);
    })
    return (
      <div className={styles.order + " clearfix"}>
        <div className={styles.header + " clearfix"}>
          <h4 className={styles.status}>{orderState}</h4>
          <p className={styles.time}>{"下单时间：" + createAt + " 订单号：" + order.order_id}</p>
          <p className={styles.total}>{"订单金额：" + order.real_pay_amt}</p>
        </div>
        <div className={styles.items + " clearfix"}>
          {itemsView}
          {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) &&
          <div className={styles.operation}>
            <Button bsSize="normal" bsStyle={"warning"} href={"/buy/payment/" + order.order_id}>立即支付</Button>
          </div>
          }
          {(order.state == ORDER_STATE.PAY_SUCCESS) &&
          <div className={styles.operation}>
            <Button bsSize="normal" onClick={this.handleDeliver.bind(this, order.order_id)}>测试发货</Button>
          </div>
          }
          {(order.state == ORDER_STATE.PAY_SUCCESS || order.state == ORDER_STATE.DELIVER) &&
          <div className={styles.operation}>
            <Button bsSize="normal" bsStyle={"warning"} 
            onClick={this.openDeliverConfirmOrderModel.bind(this, order.order_id)}>确认收货</Button>
          </div>
          }
          <div className={styles.operation}>
            <Button bsSize="normal" href={"/account/order/detail/" + order.order_id}>订单详情</Button>
          </div>
          {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) &&
          <div className={styles.operation}>
            <Button bsSize="normal" onClick={this.openCancelOrderModal.bind(this, order.order_id)}>取消订单</Button>
          </div>
          }
          {(order.state == ORDER_STATE.PAY_SUCCESS || order.state == ORDER_STATE.DELIVER) &&
          <div className={styles.operation}>
            <Button bsSize="normal" onClick={this.openRefundOrderModel.bind(this, order.order_id)}>退款</Button>
          </div>
          }
        </div>
      </div>
    );
  }

  renderView() {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const {orderSwitch} = this.state;
    const styles = require('./Order.scss');
    const {orders} = this.props;
    let selectedOrders = null;
    if (orderSwitch === ORDER_SWITCH.ALL) {
      selectedOrders = orders;
    } else if (orderSwitch == ORDER_SWITCH.UNPAY) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.UNPAY || elem.state == ORDER_STATE.PAY_ERROR;
      })
    } else if (orderSwitch == ORDER_SWITCH.DELIVER) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.DELIVER || 
               elem.state == ORDER_STATE.PAY_SUCCESS
      })
    } else if (orderSwitch == ORDER_SWITCH.CANCELLED) {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.CANCELLED ||
               elem.state == ORDER_STATE.REFUND
      })
    } else {
      selectedOrders = orders.filter(elem => {
        return elem.state == ORDER_STATE.DELIVER_CONFIRM || elem.state == ORDER_STATE.REFUND_CONFIRM
      })
    }
    let orderView = selectedOrders.map(order =>{return this.renderOrder(order)})
    let deliverConfirmModal = this.renderDeliverConfirmOrderModal();
    let refundModal = this.renderRefundOrderModal();
    let cancelModal = this.renderCancelOrderModal();
    return (
      <div className={styles.orderBox}>
        <div className={styles.section + " " + " clearfix"}>
          <div className={styles.sectionHeader + " clearfix"}>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.ALL ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.ALL)}>全部订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.UNPAY ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.UNPAY)}>待支付订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.DELIVER ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.DELIVER)}>待收货订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.COMPELETE ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.COMPELETE)}>已完成订单</span>
              <span className={styles.item + " " + (orderSwitch === ORDER_SWITCH.CANCELLED ? styles.active : "")}
              onClick={this.switchOrderState.bind(this, ORDER_SWITCH.CANCELLED)}>已关闭订单</span>
          </div>
          <div className={styles.sectionBody + " clearfix"}>
          {orderView}
          </div>
          {deliverConfirmModal}
          {refundModal}
          {cancelModal}
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
