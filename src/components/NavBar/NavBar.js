import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import config from '../../config';
import Querystring from 'querystring';

/* eslint-disable */ 
@connect(state => ({location: state.routing.location}))
export default class NavBar extends Component {
  static propTypes = {
    user: PropTypes.object,
    location: PropTypes.object,
    logout: PropTypes.func.isRequired
  }

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  }

  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.location && nextProps.location !== this.currentLocation) {
  //     // this.setState({previousLocation: nextProps.location});
  //     this.previousLocation = this.currentLocation;
  //     this.currentLocation = nextProps.location;
  //   }
  // }

  render() {
    const {user, location, cart} = this.props; // eslint-disable-line no-shadow
    let numCart = 0;
    if (cart) {
      numCart = cart.length;
    }
    const styles = require('./NavBar.scss');
    let returnTo = '';
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      const redirectPath = location.pathname + location.search;
      returnTo = '?' + Querystring.stringify({return_to: redirectPath});
    }
    return (
      <Navbar className={styles.navbar} style={{'margin-bottom': '0px'}}>
        <Navbar.Header>
          <Navbar.Brand>
            <IndexLink to="/">
              <div>EchoMoment</div>
            </IndexLink>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>

        <Navbar.Collapse eventKey={0}>
          <Nav className={styles.navbarNavLeft}>
            <LinkContainer to="/necklace">
              <NavItem eventKey={1}>戒指</NavItem>
            </LinkContainer>
            <LinkContainer to="/necklace2">
              <NavItem eventKey={2}>项链/吊坠</NavItem>
            </LinkContainer>
            <LinkContainer to="/necklace3">
              <NavItem eventKey={3}>耳钉/耳环</NavItem>
            </LinkContainer>
            <LinkContainer to="/necklace4">
              <NavItem eventKey={4}>套装</NavItem>
            </LinkContainer>
            <LinkContainer to="/necklace5">
              <NavItem eventKey={8}>礼品</NavItem>
            </LinkContainer>
            {/*user &&
            <LinkContainer to="/account">
              <NavItem eventKey={4}>account</NavItem>
            </LinkContainer>*/}
          </Nav>
          <Nav pullRight>
            <LinkContainer to={'/login' + returnTo}>
              <NavItem eventKey={5}>登录</NavItem>
            </LinkContainer>
            <LinkContainer to={"/signup" + returnTo}>
              <NavItem eventKey={7}>注册</NavItem>
            </LinkContainer>
          </Nav>
          {/*<Nav pullRight>
            <NavItem eventKey={1} target="_blank" title="View on Github" href="https://github.com/erikras/react-redux-universal-hot-example">
              <i className="fa fa-github"/>
            </NavItem>
          </Nav>*/}
        </Navbar.Collapse>
      </Navbar>
    );
  }
}
