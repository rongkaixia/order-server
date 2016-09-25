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
                      authKey: state.csrf._csrf,
                      loadInfoError: state.userInfo.loadInfoError,
                      loadInfoErrorDesc: state.userInfo.loadInfoErrorDesc})),
        {loadInfo: userAction.loadInfo,
        addAddress: userAction.addUserAddress,
        updateAddress: userAction.updateUserAddress,
        deleteAddress: userAction.deleteUserAddress,
        redirectTo: routeActions.push})
export default class Address extends Component {
  static propTypes = {
    user: PropTypes.object,
    authKey: PropTypes.object,
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
  
  handleUpdateAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle update address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.updateAddress(address, authKey)
                     .then(() => {return this.props.loadInfo()})
  }

  handleDeleteAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle delete address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.deleteAddress(address, authKey)
                     .then(() => {return this.props.loadInfo()})
  }

  handleAddAddress = (address) => {
    const {authKey} = this.props;
    console.log('handle add address: ' + JSON.stringify(address));
    console.log("authKey: " + authKey);
    return this.props.addAddress(address, authKey)
                     .then(() => {this.props.loadInfo()})
  }

  render() {
    const styles = require('./Address.scss');
    const {user, loadInfo, addAddress, updateAddress, deleteAddress} = this.props;
    // const address = {id: '1111', username: '小明', phonenum: '15002029322', address: "深圳市南山区鸿瑞花园4-702"}
    let addressCards = [];
    if (user.addresses) {
      user.addresses.forEach((address) => {
        let addressFormatted = {addressId: address.address_id,
                                recipientsName: address.recipients_name,
                                recipientsPhone: address.recipients_phone,
                                recipientsAddress: address.recipients_address};
        addressCards.push(
          <AddressCard address={addressFormatted}
          onAddAddress={this.handleAddAddress.bind(this)}
          onUpdateAddress={this.handleUpdateAddress.bind(this)}
          onDeleteAddress={this.handleDeleteAddress.bind(this)}/>
        );
      })
    }
    addressCards.push(
      <AddressCard
      onAddAddress={this.handleAddAddress.bind(this)}
      onUpdateAddress={this.handleUpdateAddress.bind(this)}
      onDeleteAddress={this.handleDeleteAddress.bind(this)}/>
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
