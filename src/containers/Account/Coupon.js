import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import Modal from 'react-modal';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';

/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    dispatch(userAction.loadInfo());
    // return loadInfo();
  }
}])
@connect((state => ({user: state.userInfo.user})),
        {redirectTo: routeActions.push})
export default class Coupon extends Component {
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
  render() {
    const styles = require('./Coupon.scss');
    const {user} = this.props;
    return (
      <div className={styles.CouponPanel}>
        优惠券

        <a href="http://127.0.0.1:3456">打开危险网站</a>

        <div className="row">
          <div className="col-md-3">
            <div className={"panel panel-default"} style={{width:'250px', height:'180px'}}>
              <div className={"panel-body"}>
                优惠券
              </div>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
