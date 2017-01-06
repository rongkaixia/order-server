import _ from 'lodash';
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
import * as ordersAction from 'redux/modules/order'; 

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

const ORDER_STATE_DISPLAY = {
  UNPAY: '未支付',
  PAY_SUCCESS: '支付成功',
  PAY_ERROR: '支付失败',
  DELIVER: '待收货',
  DELIVER_CONFIRM: '交易完成',
  REFUND: '退款中',
  REFUND_CONFIRM: '退款成功',
  CANCELLED: '已关闭'
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
    console.log("==============userAction.loadInfo()=============")
    return dispatch(userAction.loadInfo());
  }
},{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    const globalState = getState();
    const orderId = globalState.routing.location.pathname.split("/").reverse()[0]
    console.log("==============next promises=============")
    console.log(JSON.stringify(globalState));
    let queryOrderPromise = Promise.resolve()
    // new Promise((resolve, reject) => {})
    if (!globalState.order.orders ||
        !globalState.order.orders.find(elem => elem.order_id == orderId)) {
      console.log("Detail.js load order info for id " + orderId);
      queryOrderPromise = dispatch(ordersAction.queryOrder(orderId))
    }
    return queryOrderPromise.then(() => {
      const globalState = getState();
      const order = globalState.order.orders.find(elem => elem.order_id == orderId)
      console.log("=======order======")
      console.log(JSON.stringify(order))
      let skuIds = order.items.map(e => {return e.sku_id});
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
                    shop: state.shop,
                    location: state.routing.location})),
        {deliverConfirmAction: ordersAction.deliverConfirm,
         refundAction: ordersAction.refund,
         cancelOrderAction: ordersAction.cancel,
         queryOrderAction: ordersAction.queryOrder,
         redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    orders: PropTypes.object,
    shop: PropTypes.object,
    location: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    expireInMs: null,
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

  handleDeliverConfirm(orderId) {
    const {authKey} = this.props;
    this.props.deliverConfirmAction({orderId: orderId}, authKey)
    .then(() => {
      return this.props.queryOrderAction(orderId)
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
      return this.props.queryOrderAction(orderId)
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
      return this.props.queryOrderAction(orderId)
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

  componentDidMount(){
    console.log("componentDidMount");
    let self = this;
    this.countdownInterval = null;

    const {orders, location} = this.props;
    const orderId = location.pathname.split("/").reverse()[0];
    const order = orders.find(elem => elem.order_id == orderId)

    if (order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) {
      console.log(order.expire_at)
      const expireInMs = new Date(Number(order.expire_at)).getTime() - new Date().getTime();
      console.log(this.state.expireInMs)
      console.log(expireInMs)
      console.log(this.countdownInterval)
      if (this.state.expireInMs === null && expireInMs > 0 && !this.countdownInterval) {
        console.log("===============setExpireCountdownInterval==============")
        console.log(expireInMs)
        self.setState({expireInMs: expireInMs});
        self.countdownInterval = setInterval(() => {
          console.log("=============countdownInterval============")
          self.setState({expireInMs: self.state.expireInMs - 1000});
          if (self.state.expireInMs <= 0) {
            clearInterval();
          }
        }, 1000)
      }
    }
  }

  componentWillUnmount() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  getExpireTimeString(expireInMs) {
    let s = "";
    const MS_IN_ONE_DAY = 24 * 60 * 60 * 1000
    const MS_IN_ONE_HOUR = 60 * 60 * 1000
    const MS_IN_ONE_MINUTE = 60 * 1000
    const MS_IN_ONE_SECOND = 1000
    let t = expireInMs
    while ( t >= MS_IN_ONE_SECOND) {
      if (t >= MS_IN_ONE_DAY) {
        let n = Math.floor(t / MS_IN_ONE_DAY)
        s = s + n + "天"
        t -= n * MS_IN_ONE_DAY
      } else if ( t >= MS_IN_ONE_HOUR) {
        let n = Math.floor(t / MS_IN_ONE_HOUR)
        s = s + n + "小时"
        t -= n * MS_IN_ONE_HOUR
      } else if ( t >= MS_IN_ONE_MINUTE) {
        let n = Math.floor(t / MS_IN_ONE_MINUTE)
        s = s + n + "分钟"
        t -= n * MS_IN_ONE_MINUTE
      } else {
        let n = Math.floor(t / MS_IN_ONE_SECOND)
        s = s + n + "秒"
        t -= n * MS_IN_ONE_SECOND
      }
    }
    return s;
  }

  renderItem(item) {
    const styles = require('./Detail.scss');
    const itemInfo = this.props.shop.items.find((elem) => {return elem._id == item.sku_id})
    const imagePath = itemInfo.images.thumbnail;
    return (
      <div className={styles.item}>
        <div className={styles.itemThump}>
          <a href="http://www.smartisan.com/shop/#/t2" title="Smartisan T2（黑色，16GB）" target="_blank"> 
            <img src={imagePath}/> 
          </a>
        </div>
        <div className={styles.itemDesc}>
          <p>{itemInfo.name}</p>
        </div>
        <span className={styles.subtotal}>{item.total}</span>
        <span className={styles.num}>{item.num}</span>
        <span className={styles.price}>{item.real_price}</span>
      </div>
    )
  }

  renderOrderStatus(order) {
    const styles = require('./Detail.scss');
    return (
      <div className={styles.status}>
        {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) && this.state.expireInMs &&
        <div className={styles.goPay + " clearfix"}>
          <div className={styles.left}>
            <p>
              <span>订单状态: {ORDER_STATE_DISPLAY[order.state]}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span>订单金额: {order.real_pay_amt}</span>
            </p>
            {(order.state == ORDER_STATE.UNPAY || order.state == ORDER_STATE.PAY_ERROR) && this.state.expireInMs &&
            <p>
              {this.getExpireTimeString(this.state.expireInMs) + " 内未付款，将自动取消订单。"}
            </p>
            }
          </div>
          <div className={styles.right}>
            <Button bsSize="normal" bsStyle={"warning"} href={"/buy/payment/" + order.order_id}>立即支付</Button>
            <Button bsSize="normal" onClick={this.openCancelOrderModal.bind(this,order.order_id)}>取消订单</Button>
          </div>
        </div>}

        {(order.state == ORDER_STATE.DELIVER || order.state == ORDER_STATE.PAY_SUCCESS) &&
        <div className={styles.goPay + " clearfix"}>
          <div className={styles.left}>
            <p>
              <span>订单状态: {ORDER_STATE_DISPLAY[order.state]}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span>订单金额: {order.real_pay_amt}</span>
            </p>
          </div>
          <div className={styles.right}>
            <Button bsSize="normal" bsStyle={"warning"}
            onClick={this.openDeliverConfirmOrderModel.bind(this, order.order_id)}>确认收货</Button>
          </div>
        </div>}

        {(order.state == ORDER_STATE.DELIVER_CONFIRM ||
          order.state == ORDER_STATE.REFUND ||
          order.state == ORDER_STATE.REFUND_CONFIRM ||
          order.state == ORDER_STATE.CANCELLED) &&
        <div className={styles.goPay + " clearfix"}>
          <div className={styles.left}>
            <p>
              <span>订单状态: {ORDER_STATE_DISPLAY[order.state]}</span>
              &nbsp;&nbsp;&nbsp;&nbsp;
              <span>订单金额: {order.real_pay_amt}</span>
            </p>
          </div>
        </div>}

      </div>
    )
  }

  renderOrder(order) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user} = this.props;
    const styles = require('./Detail.scss');
    const orderStatusView = this.renderOrderStatus(order)
    let itemsView = order.items.map(item => {
      return this.renderItem(item);
    })

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
            {orderStatusView}
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
                {itemsView}
              </div>
              <div className={styles.summary}>
                <div className={styles.total}>
                  <p>{"商品总计：" + order.real_pay_amt}</p>
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

    let view = null;
    if (order) {
      view = this.renderOrder(order);
    }
    let deliverConfirmModal = this.renderDeliverConfirmOrderModal();
    let refundModal = this.renderRefundOrderModal();
    let cancelModal = this.renderCancelOrderModal();

    return (
      <div className={'container'}>
        {view}
        {deliverConfirmModal}
        {refundModal}
        {cancelModal}
      </div>
    );
  }
}
