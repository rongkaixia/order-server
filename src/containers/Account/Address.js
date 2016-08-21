import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import Modal from 'react-modal';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';
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

/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(userAction.loadInfo());
    // return loadInfo();
  }
}])
@connect((state =>  ({user: state.userInfo.user,
                      loadInfoError: state.userInfo.loadInfoError,
                      loadInfoErrorDesc: state.userInfo.loadInfoErrorDesc})),
        {loadInfo: userAction.loadInfo,
        redirectTo: routeActions.push})
export default class Address extends Component {
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
    const styles = require('./Address.scss');
    const {user, loadInfo, addAddress, updateAddress, deleteAddress} = this.props;
    // const address = {id: '1111', username: '小明', phonenum: '15002029322', address: "深圳市南山区鸿瑞花园4-702"}
    let addressCards = [];
    if (user.addressarrayList) {
      user.addressarrayList.forEach((address) => {
        addressCards.push(
          <AddressCard address={address}/>
        );
      })
    }
    addressCards.push(
      <AddressCard />
    );
    return (
      <div className={styles.AddressPanel}>
        <div className="form-group form-inline">
          <ul>{addressCards}</ul>
        </div>
      </div>
    );
  }
}
