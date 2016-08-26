import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import Modal from 'react-modal';
import Image from 'react-bootstrap/lib/Image';
import * as Validation from 'utils/validation';
import * as userAction from 'redux/modules/userInfo';
import {AddressForm, DeleteConfirmForm} from 'components';

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


/* AddressCard Component
address: user address object, 
         e.g. {id: xx, recipientsName: xx, recipientsPhone: xx, recipientsAddress: xx, recipientsPostcode: xx}
checked: boolean, checked
onAddAddress: promise, addAddress cb
onUpdateAddress: promise, updateAddress cb
onDeleteAddress: promise, deleteAddress cb
onClick: func, onClick cb
*/
/* eslint-disable */
@connect((state =>  ({addressForm: state.form.address,
                      authKey: state.csrf._csrf})))
export default class AddressCard extends Component {
  static propTypes = {
    address: PropTypes.object.isRequired,
    checked: PropTypes.boolean,
    onAddAddress: PropTypes.func.isRequired,
    onUpdateAddress: PropTypes.func.isRequired,
    onDeleteAddress: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    addressForm: PropTypes.object.isRequired,
    authKey: PropTypes.string.isRequired,
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
  }

  closeDeleteModel = (event) => {
    // event.preventDefault();
    console.log("openDeleteModel");
    this.setState({deleteModalIsOpen: false,
                  deleteAddressError: null});
  }

  afterOpenUpdateModal = (event) => {
    // references are now sync'd and can be accessed.
    // event.preventDefault();
    console.log("afterOpenUpdateModal");
    console.log("state: " + this.state.modalIsOpen);
  }

  closeUpdateModal = (event) => {
    // event.preventDefault();
    this.setState({modalIsOpen: false,
                  updateAddressError: null});
  }

  handleOnDeleteAddress = (event) => {
    // event.preventDefault();
    this.setState({deleteAddressError: null})
    let address = {id: this.refs.addressId && this.refs.addressId.value}
    this.props.onDeleteAddress(address)
    .then(() => {
      this.setState({deleteModalIsOpen: false});
    })
    .catch(err => {
      this.setState({deleteAddressError: JSON.stringify(err)})
      console.log(err);
    })
  }

  handleOnUpdateAddress = (event) => {
    // event.preventDefault();
    const {addressForm} = this.props;
    let address = {id: addressForm.id && addressForm.id.value,
                   recipientsName: addressForm.recipientsName && addressForm.recipientsName.value,
                   recipientsPhone: addressForm.recipientsPhone && addressForm.recipientsPhone.value,
                   recipientsAddress: addressForm.recipientsAddress && addressForm.recipientsAddress.value}
    let promise = [];
    if (!Validation.empty(address.id)) {
      promise = this.props.onUpdateAddress(address);
    }else{
      promise = this.props.onAddAddress(address);
    }
    return promise
    .then(() => {
      this.setState({modalIsOpen: false});
    })
    .catch(err => {
      // addressForm.submitError.onChange(JSON.stringify(err));
      this.setState({updateAddressError: JSON.stringify(err)})
      console.log(err);
      return Promise.reject({submitError: JSON.stringify(err)});
      // reject({serverError: "添加地址失败：" + JSON.stringify(err), _error: "添加地址失败"});
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
          handleClose={this.closeUpdateModal} 
          onSubmit={this.handleOnUpdateAddress} 
          />
        </Modal>
      </div>
    );
  }

  renderDeleteAddressModal(data) {
    const {authKey} =  this.props;
    const {deleteAddressError} = this.state;
    return (
      <div>
        <Modal
          isOpen={this.state.deleteModalIsOpen}
          onAfterOpen={this.afterOpenDeleteModal}
          onRequestClose={this.closeDeleteModel}
          style={customStyles} >
          <div>
            <h4 ref="subtitle">删除地址 <button style={{float: 'right'}} onClick={this.closeDeleteModel}>X</button></h4>
            {!deleteAddressError  && <div>删除该收货地址吗？</div>}
            {deleteAddressError && <div>{'删除地址失败，请稍后重试。'}</div>}
            <button className="btn btn-success" onClick={this.handleOnDeleteAddress}>
            {deleteAddressError ? '重试': '保存'}
            </button>
          </div>
        </Modal>
      </div>
    );
  }

  render() {
    const styles = require('./AddressCard.scss');
    const {address, checked, onClick} = this.props;
    const addressModal = this.renderAddressModal(address);
    const deleteAddressModal = this.renderDeleteAddressModal(address);
    const plusIconPath = require('./plus.png');
    console.log("plusIconPath: " + plusIconPath);
    const addressId = address ? address.id : null

    return (
      <div className={styles.orderAddress}>
        <div className={address && checked ? styles.orderAddressCheckbox + ' ' + styles.checked : styles.orderAddressCheckbox}
        onClick={!address ? this.openUpdateModal.bind(this) : onClick}>
          {address &&
          <div className={styles.orderAddressCheckboxTop}>
            <input name="utf8" ref="addressId" type="hidden" value={addressId} />
            <div className={styles.orderAddressCheckboxName}>{address.recipientsName}</div>
            <div className={styles.orderAddressCheckboxPhone}>{address.recipientsPhone}</div>
          </div>}
          {address &&
          <div className={styles.orderAddressCheckboxContent}>
          {address.recipientsAddress}
          </div>}
          {address &&
          <div className={styles.orderAddressCheckboxCtrl}>
            <div className={styles.edit} onClick={this.openUpdateModal.bind(this)}>修改</div>
            <div className={styles.edit} onClick={this.openDeleteModel.bind(this)}>删除</div>
          </div>}
          {!address && 
          <div style={{'padding-left': '35%', 'padding-top': '15%'}}>
            <Image href="#" alt="25x25 pull-xs-left" src={plusIconPath} responsive rounded/>
          </div>}
        </div>
        {addressModal}
        {deleteAddressModal}
      </div>
    );
  }
}
