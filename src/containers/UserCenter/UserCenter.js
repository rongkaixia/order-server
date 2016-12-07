import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';
import {Link} from 'react-router';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@connect((state => ({user: state.userInfo.user})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    children: PropTypes.object.isRequired,
    user: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  renderLeftPannel() {
    return (
        <div className="row">
          <div className="span3">
            <div className="well">
              <ul className="nav nav-list">
                <li><label className="tree-toggle nav-header">订单中心</label>
                  <ul className="nav nav-list tree">
                    <li><Link to="/account/order">我的订单</Link></li>
                    <li><Link to="/cart">我的购物车</Link></li>
                  </ul>
                </li>
                <li><label className="tree-toggle nav-header">个人中心</label>
                  <ul className="nav nav-list tree">
                    <li><Link to="/account">我的商城</Link></li>
                    <li><Link to="/account/info">个人信息</Link></li>
                    <li><Link to="#">修改密码</Link></li>
                    <li><Link to="/account/address">收货地址</Link></li>
                    <li><Link to="/account/coupon">优惠券</Link></li>
                  </ul>
                </li>
                <li><label className="tree-toggle nav-header">售后中心</label>
                  <ul className="nav nav-list tree">
                    <li><Link to="#">联系我们</Link></li>
                    <li><Link to="#">意见反馈</Link></li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </div>
    );
  }

  render() {
    const styles = require('./UserCenter.scss');
    const leftPanel = this.renderLeftPannel();
    return (
      <div className={styles.userCenterPage + ' container'}>
        <h1>User Center</h1>
        <div className={styles.leftPanel}>
          {leftPanel}
        </div>
        {<div className={styles.rightPanel}>
          {this.props.children}
        </div>}
      </div>
    );
  }
}
