import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import {Nav, Navbar, NavItem, NavDropdown, MenuItem} from 'react-bootstrap/lib';
import config from '../../config';
import Querystring from 'querystring';

/* eslint-disable */ 
@connect(state => ({location: state.routing.location,
                    navbarState: state.navbar}))
export default class NavBar extends Component {
  static propTypes = {
    navbarState: PropTypes.object,
    user: PropTypes.object,
    location: PropTypes.object,
    logout: PropTypes.func.isRequired
  }

  state = {
    navbarExpanded: false
  };

  handleLogout = (event) => {
    event.preventDefault();
    this.props.logout();
  }

  handleToggle = (expanded, event) => {
    this.setState({navbarExpanded: expanded});
    if (window) {
      if (expanded){
        let bodyDom = window.document.getElementsByTagName("body");
        bodyDom[0].style.overflow="hidden"
      } else {
        let bodyDom = window.document.getElementsByTagName("body");
        bodyDom[0].style.overflow="inherit"
      }
    }
  }

  render() {
    const {navbarExpanded} = this.state;
    const {user, location, cart, navbarState} = this.props; // eslint-disable-line no-shadow
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
    const navbarClassName = ["fixedTop", navbarExpanded?"active":"", navbarState.color].join(' ');
    return (
      <Navbar collapseOnSelect className={navbarClassName} onToggle={this.handleToggle}>
        <Navbar.Header>
          <Navbar.Brand>
            <IndexLink to="/">
              <div>EchoMoment</div>
            </IndexLink>
          </Navbar.Brand>
          <Navbar.Toggle/>
        </Navbar.Header>

        <Navbar.Collapse eventKey={0}>
          <Nav >
            <LinkContainer to="/shop/buy-ring">
              <NavItem eventKey={1}>戒指</NavItem>
            </LinkContainer>
            <LinkContainer to="/shop/buy-necklace">
              <NavItem eventKey={2}>项链/吊坠</NavItem>
            </LinkContainer>
            <LinkContainer to="/shop/buy-earring">
              <NavItem eventKey={3}>耳钉/耳环</NavItem>
            </LinkContainer>
            <LinkContainer to="/shop/buy-package">
              <NavItem eventKey={4}>套装</NavItem>
            </LinkContainer>
            <LinkContainer to="/shop/buy-gift">
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
