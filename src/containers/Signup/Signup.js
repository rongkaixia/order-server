import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { routeActions } from 'react-router-redux';
import Querystring from 'querystring';
import * as authActions from 'redux/modules/auth';
import Helmet from 'react-helmet';

/* eslint-disable */ 
@connect(
  state => ({user: state.userInfo.user,
            location: state.routing.location,
            signupError: state.auth.signupError,
            signupErrorDesc: state.auth.signupErrorDesc,
            authKey: state.csrf._csrf}),
  {...authActions, redirectTo: routeActions.push}
)

export default class Signup extends Component {
  static propTypes = {
    user: PropTypes.object,
    signupError: PropTypes.object,
    signupErrorDesc: PropTypes.object,
    authKey: PropTypes.string,
    signup: PropTypes.func.isRequired,
    location: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  componentWillReceiveProps(nextProps) {
    // console.log("componentWillReceiveProps: " + JSON.stringify(nextProps));
    if (!this.props.user && nextProps.user) {
      console.log('signup success');
      let redirectPath = '/';
      if (this.props.location.search !== '') {
        const queryParams = Querystring.parse(this.props.location.search.substring(1));
        redirectPath = queryParams.return_to;
      }
      this.props.redirectTo(redirectPath);
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const {authKey} = this.props;
    const username = this.refs.username;
    const password = this.refs.password;
    this.props.signup({username: username.value, password: password.value}, authKey);
    // username.value = '';
    password.value = '';
  }

  render() {
    const {signupError, signupErrorDesc} = this.props;
    const styles = require('./Signup.scss');
    // return (
    //   <div className={styles.signupPage + ' container'}>
    //     <Helmet title="Signup"/>
    //     <h1>Signup</h1>
    //     <div>
    //       <form className="-form form-horizontal" onSubmit={this.handleSubmit}>
    //         <div className="form-group form-inline">
    //           <input type="text" ref="username" placeholder="Enter a username"/>
    //         </div>
    //         <div className="form-group">
    //           <input type="password" ref="password" placeholder="Enter a password"/>
    //         </div>
    //         <p>{signupError ? signupErrorDesc : ''}</p>
    //         <button className="btn btn-success" onClick={this.handleSubmit}><i className="fa fa-sign-in"/>{' '}注册
    //         </button>
    //       </form>
    //       <p>This will "log you in" as this user, storing the username in the session of the API server.</p>
    //     </div>
    //   </div>
    // );

    return (
      <div className={styles.signupPage}>
        <h3 className={styles.headline}>暂未开放</h3>
      </div>
    );
  }
}
