import React, {Component, PropTypes} from 'react';
import {connect} from 'react-redux';
import * as authActions from 'redux/modules/auth';

@connect(
    state => ({user: state.userInfo.user}),
    authActions)
export default
class LoginSuccess extends Component {
  static propTypes = {
    user: PropTypes.object,
    logout: PropTypes.func
  }

  handleLogout = (event) => {
    event.preventDefault();
    const authKey = this.ref.authKey;
    console.log("authKey: " + authKey);
    // this.props.logout();
  }

  render() {
    const {user, logout} = this.props;
    const authKey = null;
    return (user &&
      <div className="container">
        <h1>Login Success</h1>

        <div>
          <p>Hi, {user.usename}. You have just successfully logged in, and were forwarded here
            by <code>componentWillReceiveProps()</code> in <code>App.js</code>, which is listening to
            the auth reducer via redux <code>@connect</code>. How exciting!
          </p>

          <p>
            The same function will forward you to <code>/</code> should you chose to log out. The choice is yours...
          </p>

          <div>
            <form>
              <input name="utf8" ref="authKey" type="hidden" value={authKey} />
            </form>
            <button className="btn btn-danger" onClick={this.handleLogout}><i className="fa fa-sign-out"/>{' '}Log Out</button>
          </div>
        </div>
      </div>
    );
  }
}
