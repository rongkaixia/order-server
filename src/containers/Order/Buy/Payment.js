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
import * as orderAction from 'redux/modules/order';

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
}])
@connect((state => ({user: state.userInfo.user})),
        {...orderAction,
        redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    pay: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    key: 1,
    payModalIsOpen: false
  };

  handleSelect = (key) => {
    this.setState({key: key});
  }

  handlePay = (event) => {
    event.preventDefault();
    event.stopPropagation();
    this.setState({payModalIsOpen: true});
  }

  afterOpenPayModal() {

  }

  closePayModal(event) {
    event.preventDefault();
    event.stopPropagation();
    this.setState({payModalIsOpen: false});
  }

  renderPayModal() {
    return (
      <div>
        <Modal
          isOpen={this.state.payModalIsOpen}
          onAfterOpen={this.afterOpenPayModal}
          onRequestClose={this.closePayModal}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">支付中<button style={{float: 'right'}} onClick={this.closePayModal.bind(this)}>X</button></h4>
            {'支付中..., 请勿关闭当前窗口。'}
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
    const {user} = this.props;
    const styles = require('./Payment.scss');
    const imagePath = require('./PaySuccess.png');
    const payTabs = this.renderPayMethodTabs();
    let payModal = this.renderPayModal();
    return (
      <div className={styles.paymentBox}>
        <div className={styles.payInfo}>
          <div className={styles.success}>
            <img src={imagePath}/> 
          </div>
          <h3>{"订单提交成功"}</h3>
          <p className={styles.comment}> {"请于 24 小时内支付，逾期订单将被自动取消"}</p>
          <p className={styles.comment}> {"收货信息：小明，15002034233，广东省深圳市南山区南山街道东方海雅居211"}</p>
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
    let view = this.renderView();

    return (
      <div className={'container'}>
        {view}
      </div>
    );
  }
}
