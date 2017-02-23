import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';

const JADE_NECKLACE_CATEGORY_NAME = "jade-necklace";
// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(shopAction.loadNecklace());
  }
}])
@connect((state => ({shop: state.shop})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    shop: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  render() {
    const styles = require('./BuyRing.scss');
    const {shop} = this.props;
    let items = [];
    return (
      <div className={styles.ringPage}>
        <h3 className={styles.headline}>敬请期待...</h3>
      </div>
    );
  }
}
