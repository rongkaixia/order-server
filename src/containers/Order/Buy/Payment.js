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
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';
import * as checkoutAction from 'redux/modules/checkout';
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

const ORDER_STATE = {
  UNPAY: 'UNPAY',
  PAY_SUCCESS: 'PAY_SUCCESS',
  PAY_ERROR: 'PAY_ERROR'
}

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
  }
}])
@connect((state => ({user: state.userInfo.user,
                    checkout: state.checkout,
                    authKey: state.csrf._csrf})),
        {...checkoutAction,
        redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    checkout: PropTypes.object,
    authKey: PropTypes.object,
    pay: PropTypes.func.isRequired,
    query: PropTypes.func.isRequired,
    fakeNotify: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    key: 1,
    payModalIsOpen: false,
    resubmitting: false,
    invalidArgument: false,
    unauthorizedRequest: false,
    countdown: null
  };

  componentWillMount(){
    console.log("componentWillMount");
    let self = this;
    this.queryOrderStateInterval = null;
    this.countdownInterval = null;
    // check invalid post data
    if(!this.props.checkout.orderInfo || !this.props.checkout.orderInfo.order_id) {
      console.log("invalid argument.");
      console.log("redirecting to /");
      this.setState({invalidArgument: true, countdown: 5});
      if (!__SERVER__) {
        this.countdownInterval = setInterval(() => {
          self.setState({countdown: self.state.countdown - 1});
          if (self.state.countdown <= 0) {
            clearInterval();
            self.props.redirectTo(Config.mainDomainAbsPath + '/account/order');
          }
        }, 1000)
      }
    }
    // check resubmit form
    if(this.props.checkout && 
      this.props.checkout.orderInfo && 
      this.props.checkout.orderInfo.state === ORDER_STATE.PAY_SUCCESS) {
      console.log("redirecting to /account/order");
      this.setState({resubmitting: true, countdown: 5});
      if (!__SERVER__) {
        this.countdownInterval = setInterval(() => {
          self.setState({countdown: self.state.countdown - 1});
          if (self.state.countdown <= 0) {
            clearInterval();
            self.props.redirectTo(Config.mainDomainAbsPath + '/account/order');
          }
        }, 1000)
      }
    }
  }

  componentDidMount(){
    console.log("componentDidMount");
  }

  componentWillUnmount() {
    if (this.queryOrderStateInterval) {
      clearInterval(this.queryOrderStateInterval);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  componentWillReceiveProps(nextProps) {
    // console.log("componentWillReceiveProps: " + JSON.stringify(nextProps));
    let self = this;
    const preOrderState = this.props.checkout.orderInfo && this.props.checkout.orderInfo.state;
    const curOrderState = nextProps.checkout.orderInfo && nextProps.checkout.orderInfo.state;

    if ((preOrderState === ORDER_STATE.UNPAY || preOrderState === ORDER_STATE.PAY_ERROR) &&
        curOrderState === ORDER_STATE.PAY_SUCCESS || curOrderState == ORDER_STATE.PAY_ERROR) {
      // clear query order state interval
      if (this.queryOrderStateInterval) {
        clearInterval(this.queryOrderStateInterval);
      }
      // redirect if pay success
      if (curOrderState === ORDER_STATE.PAY_SUCCESS) {
        this.setState({countdown: 5});
        this.countdownInterval = setInterval(() => {
          self.setState({countdown: self.state.countdown - 1});
          if (self.state.countdown <= 0) {
            clearInterval();
            self.props.redirectTo(Config.mainDomainAbsPath + '/account/order');
          }
        }, 1000)
      }
    }
  }

  handleSelect = (key) => {
    this.setState({key: key});
  }

  handlePay = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({payModalIsOpen: true});
    const {authKey} = this.props;
    const orderId = this.props.checkout.orderInfo.order_id;
    // send pay request
    this.props.pay({orderId: orderId}, authKey)
    .then(() => {
      // query order state
      this.queryOrderStateInterval = setInterval(() => {
        this.props.query({orderId: orderId}, authKey)
      }, 2000)
    })
  }

  handleFakeNotify = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const {authKey} = this.props;
    const orderId = this.props.checkout.orderInfo.order_id;
    this.props.fakeNotify({orderId: orderId}, authKey)
    .then(() => {
      console.log("fakeNotify success");
    })
  }

  afterOpenPayModal() {

  }

  closePayModal(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({payModalIsOpen: false});
  }

  renderPayModal() {
    const {invokePaying, invokePaySuccess, invokePayError, invokePayErrorDesc, orderInfo} = this.props.checkout;
    const orderState = orderInfo && orderInfo.state;
    const {countdown} = this.state;
    console.log("orderState: " + orderState);

    return (
      <div>
        <Modal
          isOpen={this.state.payModalIsOpen}
          onAfterOpen={this.afterOpenPayModal}
          onRequestClose={this.closePayModal}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">支付中</h4>
            {invokePaying && <div>{'拉起支付中..., 请勿关闭当前窗口。'}</div>}
            {invokePayError && 
            <div>{'拉起支付失败，请稍后再试(' + JSON.stringify(invokePayErrorDesc) + ')'}
              <button onClick={this.closePayModal.bind(this)}>确定</button>
            </div>}
            {invokePaySuccess && orderState === 'UNPAY' && <div>{'支付中..., 请勿关闭当前窗口。'}</div>}
            {invokePaySuccess && orderState === 'PAY_SUCCESS' && <div>{'支付成功，正在跳转页面...' + countdown + 's'}</div>}
            {invokePaySuccess && orderState === 'PAY_ERROR' && 
            <div>
              <div>{'支付失败，请稍后再试)'}</div>
              <button onClick={this.closePayModal.bind(this)}>确定</button>
            </div>}
            {invokePaySuccess && orderState === 'UNPAY' && 
            <div>
              <Button bsSize="large" 
              onClick={this.handleFakeNotify.bind(this)}>notify</Button>
            </div>}
          </div>
        </Modal>
      </div>
    );
  }

  renderPayMethodTabs() {
    const styles = require('./Payment.scss');
    const platformImage = require('./platform.png');
    return (
      <Tabs id={"payMethodTabs"} activeKey={this.state.key} onSelect={this.handleSelect}>
        <Tab eventKey={1} title="平台支付"><img src={platformImage} onClick={this.handlePay.bind(this)}/></Tab>
        <Tab eventKey={2} title="储蓄卡或信用卡支付" disabled></Tab>
      </Tabs>
    );
  }

  renderView() {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {user, checkout} = this.props;
    const styles = require('./Payment.scss');
    const imagePath = require('./PaySuccess.png');
    const payTabs = this.renderPayMethodTabs();
    const payModal = this.renderPayModal();
    const orderInfo = checkout.orderInfo;
    return (
      <div className={styles.paymentBox}>
        <div className={styles.payInfo}>
          <div className={styles.success}>
            <img src={imagePath}/> 
          </div>
          <h3>{"订单提交成功"}</h3>
          <p className={styles.comment}> {"请于 24 小时内支付，逾期订单将被自动取消"}</p>
          <p className={styles.comment}> 
          {"收货信息：" + orderInfo.recipients_name + "，" + orderInfo.recipients_phone + "，" + orderInfo.recipients_address}
          </p>
        </div>
        <div className={styles.payMethod}>
          {payTabs}
        </div>
        {payModal}
      </div>
    );
  }

  render() {
    const styles = require('./Payment.scss');
    const {resubmitting, invalidArgument, countdown} = this.state;
    if (resubmitting) {
      return (
        <div className={'container'}>
        <h4>{'请勿重复支付，正在跳转到我的订单页面...' + countdown + 's'}</h4>
        </div>
      );
    } else if(invalidArgument) {
      return (
        <div className={'container'}>
        <h4>{'非法参数，正在跳转到我的订单页面...' + countdown + 's'}</h4>
        </div>
      );
    }
    let view = this.renderView();
    return (
      <div className={'container'}>
        {view}
      </div>
    );
  }
}
