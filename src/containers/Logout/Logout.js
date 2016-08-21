import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';
import Querystring from 'querystring';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { routeActions } from 'react-router-redux';
import * as authActions from 'redux/modules/auth';

/* eslint-disable */ 
@connect(
  state => ({user: state.userInfo.user,
            logoutError: state.auth.logoutError,
            logoutErrorDesc: state.auth.logoutErrorDesc,
            authKey: state.csrf._csrf}),
  {...authActions, redirectTo: routeActions.push}
)
export default class Logout extends Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func,
    logoutError: PropTypes.object,
    logoutErrorDesc: PropTypes.object,
    authKey: PropTypes.string,
    redirectTo: PropTypes.func.isRequired
  };

  contextTypes = {
    router: PropTypes.func.isRequired
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.user && !nextProps.user) {
      console.log('logout success');
      let redirectPath = '/';
      this.props.redirectTo(redirectPath);
    }
  }

  handleLogout = (event) => {
    event.preventDefault();
    const {authKey} = this.props;
    console.log("handleLogout authKey: " + authKey);
    this.props.logout(authKey);
  }

  render() {
    const {user, authKey, logout, logoutError, logoutErrorDesc} = this.props;
    const styles = require('./Logout.scss');
    console.log("===========authKey=========");
    console.log(authKey);
    return (
      <div className={styles.loginPage + ' container'}>
        <Helmet title="Login"/>
        <h1>Login</h1>
        {user && !logoutError &&
        <div>
          <p>You are currently logged in as {user.usename}.</p>
          <div>
            <button className="btn btn-danger" onClick={this.handleLogout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
        }
        {user && logoutError &&
        <div>
          <p>{logoutErrorDesc}</p>
        </div>
        }
      </div>
    );
  }
}
