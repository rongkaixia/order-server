import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Modal from 'react-modal';
import Image from 'react-bootstrap/lib/Image';
import * as Validation from 'utils/validation';
import * as userAction from 'redux/modules/userInfo';
import {AddressForm} from 'components';

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
@connect((state =>  ({addressForm: state.form.address,
                      updateInfoError: state.userInfo.updateInfoError,
                      updateInfoErrorDesc: state.userInfo.updateInfoErrorDesc,
                      authKey: state.csrf._csrf})),
        {loadInfo: userAction.loadInfo,
        addAddress: userAction.addUserAddress,
        updateAddress: userAction.updateUserAddress,
        deleteAddress: userAction.deleteUserAddress})

export default class AccountAddress extends Component {
  static propTypes = {
    address: PropTypes.object,
    addressForm: PropTypes.object,
    authKey: PropTypes.string.isRequired,
    loadInfo: PropTypes.func.isRequired,
    addAddress: PropTypes.func.isRequired,
    updateAddress: PropTypes.func.isRequired,
    deleteAddress: PropTypes.func.isRequired
  };

  state = {
    modalIsOpen: false,
    updateAddressError: null,
    deleteModalIsOpen: false,
    deleteAddressError: null
  };

  openUpdateModal = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("openUpdateModal");
    console.log("state: " + this.state.modalIsOpen);
    this.setState({modalIsOpen: true});
  }

  openDeleteModel = (event) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("openDeleteModel");
    this.setState({deleteModalIsOpen: true});
  }

  afterOpenDeleteModal = (event) => {
    // references are now sync'd and can be accessed.
    // event.preventDefault();
    console.log("afterOpenDeleteModal");
    console.log("state: " + this.state.deleteModalIsOpen);
    // this.refs.subtitle.style.color = '#f00';
  }

  closeDeleteModel = (event) => {
    event.preventDefault();
    console.log("openDeleteModel");
    this.setState({deleteModalIsOpen: false,
                  deleteAddressError: null});
  }

  afterOpenUpdateModal = (event) => {
    // references are now sync'd and can be accessed.
    // event.preventDefault();
    console.log("afterOpenUpdateModal");
    console.log("state: " + this.state.modalIsOpen);
    // this.refs.subtitle.style.color = '#f00';
  }

  closeUpdateModal = (event) => {
    event.preventDefault();
    this.setState({modalIsOpen: false,
                  updateAddressError: null});
  }

  // componentWillReceiveProps(nextProps) {
  //   const {signingUp, signupError, signupErrorDesc} = nextProps;
  //   if (!signingUp && !signupError) {
  //     console.log('signup success');
  //     // login
  //     this.props.redirectTo('/login');
  //   }
  // }

  handleDeleteAddress = (event) => {
    // event.preventDefault();
    console.log('handle delete address');
    const {authKey} = this.props;
    const addressId = this.refs.addressId;
    this.props.deleteAddress({id: addressId.value, authKey: authKey})
    .then(() => {
      this.setState({deleteModalIsOpen: false});
    })
    .then(() => {
      this.props.loadInfo();
    })
    .catch(err => {
      // this.setState({deleteAddressError: JSON.stringify(err)})
    })  
  }

  handleUpdateAddress = (event) => {
    // event.preventDefault();
    return new Promise((resolve, reject) => {
      const {addressForm, authKey} = this.props;
      console.log('handle add address');
      console.log('addressForm: ' + JSON.stringify(addressForm));
      const addressId = addressForm.id;
      const recipientsName = addressForm.recipientsName;
      const recipientsPhone = addressForm.recipientsPhone;
      const recipientsAddress = addressForm.recipientsAddress;
      console.log("recipientName: " + recipientsName.value);
      console.log("recipientPhone: " + recipientsPhone.value);
      console.log("recipientAddress: " + recipientsAddress.value);
      console.log("authKey: " + authKey);
      let promise = []
      if (!Validation.empty(addressId) && !Validation.empty(addressId.value)) {
        console.log("addressId: " + addressId.value);
        promise = this.props.updateAddress({id: addressId.value,
                                  recipientsName:recipientsName.value, 
                                  recipientsPhone:recipientsPhone.value, 
                                  recipientsAddress:recipientsAddress.value, 
                                  authKey: authKey})
      } else {
        promise = this.props.addAddress({recipientsName:recipientsName.value, 
                                  recipientsPhone:recipientsPhone.value, 
                                  recipientsAddress:recipientsAddress.value, 
                                  authKey: authKey})
      }
      promise
      .then(() => {
        this.setState({modalIsOpen: false});
      })
      .then(() => {
        this.props.loadInfo();
        resolve();
      })
      .catch(err => {
        reject({serverError: "添加地址失败：" + JSON.stringify(err), _error: "添加地址失败"});
      })
    })
  }

  renderAddressModal(data) {
    const {authKey} =  this.props;
    const initialValues = {id: data ? data.id : null, 
                          recipientsName: data ? data.recipientsName : null, 
                          recipientsPhone: data ? data.recipientsPhone : null,
                          recipientsAddress: data ? data.recipientsAddress : null}
    return (
      <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenUpdateModal}
          onRequestClose={this.closeUpdateModal}
          style={customStyles} >
          <AddressForm 
          initialValues={initialValues} 
          handleClose={this.closeUpdateModal.bind(this)} 
          onSubmit={this.handleUpdateAddress.bind(this)} 
          />
        </Modal>
      </div>
    );
  }

  renderDeleteAddressModal(data) {
    const {authKey} =  this.props;
    return (
      <div>
        <Modal
          isOpen={this.state.deleteModalIsOpen}
          onAfterOpen={this.afterOpenDeleteModal}
          onRequestClose={this.closeDeleteModel}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">添加收货地址 <button style={{float: 'right'}} onClick={this.closeDeleteModel.bind(this)}>X</button></h4>
          </div>
          <form className="login-form form-horizontal">
            <div>删除该收货地址吗？</div>
            <button className="btn btn-success" onClick={this.handleDeleteAddress.bind(this)}>确定</button>
          </form>
        </Modal>
      </div>
    );
  }

  render() {
    const styles = require('./AddressCard.scss');
    const {address} = this.props;
    const addressModal = this.renderAddressModal(address);
    const deleteAddressModal = this.renderDeleteAddressModal(address);
    const plusIconPath = require('./plus.png');
    console.log("plusIconPath: " + plusIconPath);
    const addressId = address ? address.id : null

          // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    return (
        <div className={styles.addressItem}>
          <div className={"panel panel-default"} style={{height: '100%'}} onClick={this.openUpdateModal.bind(this)}>
            {!address &&
            <div style={{'padding-left': '35%', 'padding-top': '20%'}}>
              <Image href="#" alt="25x25 pull-xs-left" src={plusIconPath} responsive rounded/>
            </div>}
            {address &&
            <div className={"panel-heading"} style={{height: '20%'}}>
              <input name="utf8" ref="addressId" type="hidden" value={addressId} />
              <span>{address.recipientsName}</span><span>{address.recipientsPhone}</span>
            </div>}
            {address &&
            <div className={"panel-body"} style={{height:'70%'}}>
              {address.recipientsAddress}
            </div>}
            {address && <div class="panel-footer" style={{height:'10%'}}><span onClick={this.openDeleteModel.bind(this)}>删除</span></div>}
          </div>
          {addressModal}
          {deleteAddressModal}
        </div>
    );
  }
}
