import React, {Component, PropTypes} from 'react';
import Helmet from 'react-helmet';

export default class Signup extends Component {
  static propTypes = {
    signingUp: PropTypes.object,
    signupError: PropTypes.object,
    signupErrorDesc: PropTypes.object,
    signup: PropTypes.func.isRequired,
    redirectTo: PropTypes.func.isRequired
  };

  static contextTypes = {
    store: PropTypes.object.isRequired
  };

  componentWillReceiveProps(nextProps) {
    const {signingUp, signupError} = nextProps;
    if (!signingUp && !signupError) {
      console.log('signup success');
      // login
      this.props.redirectTo('/login');
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const username = this.refs.username;
    const password = this.refs.password;
    this.props.signup(username.value, password.value);
    // username.value = '';
    password.value = '';
  }

  render() {
    const {signupError, signupErrorDesc} = this.props;
    const styles = require('./SignupForm.scss');
    return (
      <div className={styles.signupPage + ' container'}>
        <Helmet title="Signup"/>
        <h1>Signup</h1>
        <div>
          <form className="-form form-horizontal" onSubmit={this.handleSubmit}>
            <div className="form-group form-inline">
              <input type="text" ref="username" placeholder="Enter a username"/>
            </div>
            <div className="form-group">
              <input type="password" ref="password" placeholder="Enter a password"/>
            </div>
            <p>{signupError ? signupErrorDesc : ''}</p>
            <button className="btn btn-success" onClick={this.handleSubmit}><i className="fa fa-sign-in"/>{' '}注册
            </button>
          </form>
          <p>This will "log you in" as this user, storing the username in the session of the API server.</p>
        </div>
      </div>
    );
  }
}
