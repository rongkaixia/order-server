import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';


// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
    // return loadInfo();
  }
}])
@connect((state => ({user: state.userInfo.user})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    user: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  // componentWillReceiveProps(nextProps) {
  //   const {signingUp, signupError, signupErrorDesc} = nextProps;
  //   if (!signingUp && !signupError) {
  //     console.log('signup success');
  //     // login
  //     this.props.redirectTo('/login');
  //   }
  // }

  // handleSubmit = (event) => {
  //   event.preventDefault();
  //   const username = this.refs.username;
  //   const password = this.refs.password;
  //   this.props.signup(username.value, password.value);
  //   // username.value = '';
  //   password.value = '';
  // }
  redirectToAccountInfo = (event) => {
    event.preventDefault();
    this.props.redirectTo('account/info');
  }

  renderUserInfoPanel(user) {
    const styles = require('./Home.scss');
    const imagePath = require('../../../static/user.png');
    return (
      <div className={"well " + styles.boxBackground}>
        <div className="row">
          <div className="col-md-2">
            <Image href="#" alt="200x200 pull-xs-left" src={imagePath} responsive rounded/>
          </div>
          <div className="col-md-2">
            <ul className="nav nav-list">
              <li>{"您好，" + user.username}</li>
              <li>欢迎回来</li>
            </ul>
          </div>
          <div className="col-md-8">
            <ul className="nav nav-list">
              <li>{"账号：" + user.username} </li>
              {user.email &&
              <li>
                {"绑定邮箱：" + user.email}
              </li>
              }
              {!user.email &&
              <li>
                绑定邮箱：未绑定
                <button className="btn btn-warning btn-sm" onClick={this.redirectToAccountInfo}>立即绑定</button>
              </li>
              }
              {user.phonenum &&
              <li>
                {"绑定手机号：" + user.phonenum}
              </li>
              }
              {!user.phonenum &&
              <li>
                绑定手机号：未绑定
                <button className="btn btn-warning btn-sm" onClick={this.redirectToAccountInfo}>立即绑定</button>
              </li>
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }

  renderUserOrderPanel(user) {
    const styles = require('./Home.scss');
    const unpayOrderIconPath = require('../../../static/unpayOrder.png');
    const payedOrderIconPath = require('../../../static/payedOrder.png');
    const completeOrderIconPath = require('../../../static/completeOrder.png');
    const favCartIconPath = require('../../../static/favCart.png');
    return (
      <div className={"well " + styles.boxBackground}>
        <div className="row">
          <div className="col-md-2">
            <Image href="#" alt="200x200 pull-xs-left" src={unpayOrderIconPath} responsive rounded/>
          </div>
          <div className="col-md-2">
            <div> 待支付订单 </div>
            <div><a href="">查看待支付订单</a></div>
          </div>
          <div className="col-md-2">
            <Image href="#" alt="200x200 pull-xs-left" src={payedOrderIconPath} responsive rounded/>
          </div>
          <div className="col-md-2">
            <div> 待发货订单 </div>
            <div><a href="">查看待发货订单</a></div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-2">
            <Image href="#" alt="200x200 pull-xs-left" src={completeOrderIconPath} responsive rounded/>
          </div>
          <div className="col-md-2">
            <div> 已完成订单 </div>
            <div><a href="">查看已完成订单</a></div>
          </div>
          <div className="col-md-2">
            <Image href="#" alt="200x200 pull-xs-left" src={favCartIconPath} responsive rounded/>
          </div>
          <div className="col-md-2">
            <div> 购物车 </div>
            <div><a href="">查看购物车</a></div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const styles = require('./Home.scss');
    const {user} = this.props;
    // const userInfoPanel = this.renderUserInfoPanel(user);
    // const userOrderPanel = this.renderUserOrderPanel(user);
    return (
      <div className={"container"}>
        <div className={styles.userInfoPanel}>
          {this.renderUserInfoPanel(user)}
        </div>
        <div className={styles.userOrderPanel}>
          {this.renderUserOrderPanel(user)}
        </div>
      </div>
    );
  }
}
