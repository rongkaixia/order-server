import React, {Component, PropTypes} from 'react';
import Modal from 'react-modal';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as userAction from 'redux/modules/userInfo';

// console.log("+++++++++++++++++++++++++");
// const userImagePath = require('../../../static/user.png');
// console.log("userImagePath: " + userImagePath);

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
                      loadInfoErrorDesc: state.userInfo.loadInfoErrorDesc,
                      updateInfoError: state.userInfo.updateInfoError,
                      updateInfoErrorDesc: state.userInfo.updateInfoErrorDesc})),
        {...userAction, redirectTo: routeActions.push})
export default class Info extends Component {
  static propTypes = {
    user: PropTypes.object,
    authKey: PropTypes.string,
    loadInfoError: PropTypes.object,
    loadInfoErrorDesc: PropTypes.object,
    updateInfoError: PropTypes.object,
    updateInfoErrorDesc: PropTypes.object,
    loadInfo: PropTypes.func.isRequired,
    updateUsername: PropTypes.func.isRequired,
    updatePhonenum: PropTypes.func.isRequired,
    updateEmail: PropTypes.func.isRequired,
    updatePassword: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };


  state = {
    isUserModalOpen: false,
    isPasswordModalOpen: false,
    isPhoneModalOpen: false,
    isEmailModalOpen: false,
    isQuestionModalOpen: false,
    isPhoneModalFirstStep: false,
    isPhoneModalSecondStep: false,
    modifyPasswordError: null
  }

  openUserModal = (event) => {
    event.preventDefault();
    this.setState({isUserModalOpen: true});
  }

  openPasswordModal = (event) => {
    event.preventDefault();
    this.setState({isPasswordModalOpen: true});
  }

  openPhoneModal = (event) => {
    event.preventDefault();
    this.setState({isPhoneModalOpen: true, isPhoneModalFirstStep: true, isPhoneModalSecondStep: false});
  }

  nextPhoneModal = (event) => {
    event.preventDefault();
    this.setState({isPhoneModalOpen: true, isPhoneModalFirstStep: false, isPhoneModalSecondStep: true});
  }

  openEmailModal = (event) => {
    event.preventDefault();
    this.setState({isEmailModalOpen: true});
  }

  openQuestionModal = (event) => {
    event.preventDefault();
    this.setState({isQuestionModalOpen: true});
  }


  afterOpenModal = (event) => {
    // references are now sync'd and can be accessed.
    event.preventDefault();
    console.log("afterOpenModal");
    console.log("state: " + this.state.modalIsOpen);
    this.refs.subtitle.style.color = '#f00';
  }

  closeModal = (event) => {
    event.preventDefault();
    this.setState({
      isUserModalOpen: false,
      isPasswordModalOpen: false,
      isPhoneModalOpen: false,
      isEmailModalOpen: false,
      isQuestionModalOpen: false,
      isPhoneModalFirstStep: false,
      isPhoneModalSecondStep: false,
      modifyPasswordError: null
    });
  }

  // componentWillReceiveProps(nextProps) {
  //   const {signingUp, signupError, signupErrorDesc} = nextProps;
  //   if (!signingUp && !signupError) {
  //     console.log('signup success');
  //     // login
  //     this.props.redirectTo('/login');
  //   }
  // }


  // username text, // user true name, not unique
  // password text,
  // email text,
  // phonenum text,
  handleModifyUsername = (event) => {
    console.log("handleModifyUsername");
    event.preventDefault();
    const {authKey} = this.props;
    const username = this.refs.username;
    this.props.updateUsername({value: username.value}, authKey).then(this.props.loadInfo);
    this.setState({isUserModalOpen: false});
    // this.props.signup(username.value, password.value);
    // username.value = '';
  }

  handleModifyPassword = (event) => {
    console.log("handleModifyPassword");
    event.preventDefault();
    const {authKey} = this.props;
    const oldPassword = this.refs.oldPassword;
    const newPassword = this.refs.newPassword;
    this.props.updatePassword({value: newPassword.value}, authKey)
    .then(() => {
      this.props.loadInfo();
      this.setState({isPasswordModalOpen: false});
    })
    .catch(err => {
      console.log("handleModifyPassword error: " + JSON.stringify(err));
      this.setState({modifyPasswordError: JSON.stringify(err)})
    })
    // this.setState({isPasswordModalOpen: false});
    // this.props.signup(username.value, password.value);
    // username.value = '';
  }

  handleModifyEmail = (event) => {
    console.log("handleModifyEmail");
    event.preventDefault();
    const {authKey} = this.props;
    const email = this.refs.email;
    this.props.updateEmail({value: email.value}, authKey).then(this.props.loadInfo);
    this.setState({isEmailModalOpen: false});
    // this.props.signup(username.value, password.value);
    // username.value = '';
  }

  handleModifyPhone = (event) => {
    console.log("handleModifyPhone");
    event.preventDefault();
    const {authKey} = this.props;
    const phonenum = this.refs.phonenum;
    this.props.updatePhonenum({value: phonenum.value}, authKey).then(this.props.loadInfo);
    this.setState({isPhoneModalOpen: false});
    // this.props.signup(username.value, password.value);
    // username.value = '';
  }

  handleModifyQuestion = (event) => {
    console.log("handleModifyQuestion");
    event.preventDefault();
    const {authKey} = this.props;
    const username = this.refs.username;
    this.setState({isQuestionModalOpen: false});
    // this.props.signup(username.value, password.value);
    // username.value = '';
  }

  handleSendPhoneVFCode = (event) => {
    console.log("handleSendPhoneVFCode");
    event.preventDefault();
  }

  renderUserModal(user) {
    return (
      <div>
        <Modal
          isOpen={this.state.isUserModalOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">设置账户昵称 <button style={{float: 'right'}} onClick={this.closeModal}>X</button></h4>
          </div>
          <form className="login-form form-horizontal">
            <div className="form-group">
              <input type="text" ref="username" placeholder="昵称" className="form-control"/>
            </div>
            <button className="btn btn-success" onClick={this.handleModifyUsername}>确定</button>
          </form>
        </Modal>
      </div>
    );
  }

  renderPasswordModal(user) {
    return (
      <div>
        <Modal
          isOpen={this.state.isPasswordModalOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">修改密码 <button style={{float: 'right'}} onClick={this.closeModal}>X</button></h4>
          </div>
          <form className="login-form form-horizontal">
            <div className="form-group">
              原密码
              <input type="text" ref="oldPassword" placeholder="请输入原密码" className="form-control"/>
            </div>
            <div className="form-group">
              新密码
              <input type="text" ref="newPassword" placeholder="请输入新密码" className="form-control"/>
              <input type="text" ref="confirmedPassword" placeholder="请重复新密码" className="form-control"/>
              <div>密码长度8~16位，其中数字，字母和符号至少包含两种</div>
            </div>
            {this.state.modifyPasswordError &&
            <div>错误：{this.state.modifyPasswordError}</div>}
            <button className="btn btn-success" onClick={this.handleModifyPassword}>保存</button>
          </form>
        </Modal>      
      </div>
    );
  }

  renderEmailModal(user) {
    return (
      <div>
        <Modal
          isOpen={this.state.isEmailModalOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">绑定邮箱 <button style={{float: 'right'}} onClick={this.closeModal}>X</button></h4>
          </div>
          <form className="login-form form-horizontal">
            {user.email &&
            <div>
              当前绑定邮箱为：{user.email}
            </div>}
            {!user.email &&
            <div>
              当前尚未绑定邮箱
            </div>}
            <div className="form-group">
              <input type="text" ref="email" placeholder="请输入邮箱地址" className="form-control"/>
            </div>
            <button className="btn btn-success" onClick={this.handleModifyEmail}>确定</button>
          </form>
        </Modal>
      </div>
    );
  }

  renderPhoneModal(user) {
    return (
      <div>
        <Modal
          isOpen={this.state.isPhoneModalOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">修改手机号码 <button style={{float: 'right'}} onClick={this.closeModal}>X</button></h4>
          </div>
          {this.state.isPhoneModalFirstStep &&
            <form className="login-form form-horizontal">
              <div>
                为了您的账号安全，请使用安全手机{user.phonenum}获取验证码短信
              </div>
              <div className="form-group form-inline">
                <input type="text" ref="vfcode" placeholder="请输入验证码" className="form-control"/>
                <button className="btn btn-success" onClick={this.handleSendPhoneVFCode}>发送短信</button>
              </div>
              <button className="btn btn-success" onClick={this.nextPhoneModal}>下一步</button>
            </form>
          }
          {this.state.isPhoneModalSecondStep &&
            <form className="login-form form-horizontal">
              <div>
                请输入要绑定的手机号码
              </div>
              <input type="text" ref="phonenum" placeholder="请输入手机号码" className="form-control"/>
              <div className="form-group form-inline">
                <input type="text" ref="vfcode" placeholder="请输入验证码" className="form-control"/>
                <button className="btn btn-success" onClick={this.handleSendPhoneVFCode}>发送短信</button>
              </div>
              <button className="btn btn-success" onClick={this.handleModifyPhone}>确定</button>
            </form>
          }
        </Modal>
      </div>
    );
  }

  renderQuestionModal(user) {
    return (
      <div>
        <Modal
          isOpen={this.state.isQuestionModalOpen}
          onRequestClose={this.closeModal}
          style={customStyles} >

          <div>
            <h4 ref="subtitle">设置密保问题 <button style={{float: 'right'}} onClick={this.closeModal}>X</button></h4>
          </div>
          <form>
            <div className="form-group">
              <select className="form-control">
                <option value="" disabled selected>请选择密保问题</option>
                 <option>1</option>
                 <option>2</option>
                 <option>3</option>
              </select>
              <input type="text" ref="email" placeholder="请输入答案" className="form-control"/>
            </div>
            <div className="form-group">
              <select className="form-control">
                <option value="" disabled selected>请选择密保问题</option>
                 <option>1</option>
                 <option>2</option>
                 <option>3</option>
              </select>
              <input type="text" ref="email" placeholder="请输入答案" className="form-control"/>
            </div>
            <div className="form-group">
              <select className="form-control">
                <option value="" disabled selected>请选择密保问题</option>
                 <option>1</option>
                 <option>2</option>
                 <option>3</option>
              </select>
              <input type="text" ref="email" placeholder="请输入答案" className="form-control"/>
            </div>
            <button className="btn btn-success" onClick={this.handleModifyQuestion}>确定</button>
          </form>
        </Modal>
      </div>
    );
  }

  renderUserInfo(user) {
    const styles = require('./Info.scss');
    const userModal = this.renderUserModal(user);
    const passwordModal = this.renderPasswordModal(user);
    const emailModal = this.renderEmailModal(user);
    const phoneModal = this.renderPhoneModal(user);
    const questionModal = this.renderQuestionModal(user);
    const userImagePath = require('../../../static/user.png');
    const passIconPath = require('./password.png');
    const emailIconPath = require('./email.png');
    const phoneIconPath = require('./phone.png');
    const questionIconPath = require('./securityQuestion.png');
    const {csrfToken} = this.props;

    if (!user) {
      return (<div></div>);
    } else {
      return (
        <div className={styles.InfoPanel}>
          个人信息
          <div className="row">
            <div className="col-md-2">
              <Image href="#" alt="200x200 pull-xs-left" src={userImagePath} responsive rounded/>
            </div>
            <div className="col-md-2">
              <ul className="nav nav-list">
                <li>{"账户昵称：" + user.username}</li>
                <li><button className="btn btn-warning btn-sm" onClick={this.openUserModal}>修改</button></li>
                {userModal}
              </ul>
            </div>
          </div>

          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-1">
              <Image href="#" alt="50x50 pull-xs-left" src={passIconPath} responsive rounded/>
            </div>
              <ul className="nav nav-list">
                <li>
                  账号密码
                  <button className="btn btn-warning btn-sm" onClick={this.openPasswordModal}>修改</button>
                </li>
                <li style={{color: 'rgb(183, 179, 179)'}}>
                  用于保护账号信息和安全
                </li>
                {passwordModal}
              </ul>
          </div>


          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-1">
              <Image href="#" alt="50x50 pull-xs-left" src={emailIconPath} responsive rounded/>
            </div>
              <ul className="nav nav-list">
                <li>
                  安全邮箱
                  <button className="btn btn-warning btn-sm" onClick={this.openEmailModal}>绑定</button>
                </li>
                <li style={{color: 'rgb(183, 179, 179)'}}>
                  安全邮箱可用于登录和重置密码
                </li>
                {emailModal}
              </ul>
          </div>


          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-1">
              <Image href="#" alt="50x50 pull-xs-left" src={questionIconPath} responsive rounded/>
            </div>
              <ul className="nav nav-list">
                <li>
                  安全手机
                  <button className="btn btn-warning btn-sm" onClick={this.openPhoneModal}>绑定</button>
                </li>
                <li style={{color: 'rgb(183, 179, 179)'}}>
                  安全手机可用于登录和重置密码
                </li>
                {phoneModal}
              </ul>
          </div>


          <div className="row" style={{padding: '30px'}}>
            <div className="col-md-1">
              <Image href="#" alt="50x50 pull-xs-left" src={passIconPath} responsive rounded/>
            </div>
              <ul className="nav nav-list">
                <li>
                  密保问题
                  <button className="btn btn-warning btn-sm" onClick={this.openQuestionModal}>设置</button>
                </li>
                <li style={{color: 'rgb(183, 179, 179)'}}>
                  密保问题用于安全验证
                </li>
                {questionModal}
              </ul>
          </div>

        </div>
      )
    }
  }
  render() {
    const styles = require('./Info.scss');
    const {user} = this.props;
    return (
      <div className={'container'}>
        {this.renderUserInfo(user)}
      </div>
    );
  }
}
