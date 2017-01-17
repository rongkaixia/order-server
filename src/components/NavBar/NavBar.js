import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { asyncConnect } from 'redux-async-connect';
// import Navbar from 'react-bootstrap/lib/Navbar';
// import Nav from 'react-bootstrap/lib/Nav';
// import NavItem from 'react-bootstrap/lib/NavItem';
import config from '../../config';
import Querystring from 'querystring';
import { Collapse, Navbar, NavbarToggler, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

/* eslint-disable */ 
@connect(state => ({location: state.routing.location}))
export default class NavBar extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  
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
      <div>
        <Navbar color="faded" light toggleable>
          <NavbarToggler right onClick={this.toggle} />
          <NavbarBrand href="/">reactstrap</NavbarBrand>
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="/components/">Components</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="https://github.com/reactstrap/reactstrap">Github</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
      </div>
    );
    // return (
    //   <Navbar style={{'margin-bottom': '0px'}}>
    //     <Navbar.Header>
    //       <Navbar.Brand>
    //         <IndexLink to="/" activeStyle={{color: '#33e0ff'}}>
    //           <div className={styles.brand}/>
    //           <span>{config.app.title}</span>
    //         </IndexLink>
    //       </Navbar.Brand>
    //       <Navbar.Toggle/>
    //     </Navbar.Header>

    //     <Navbar.Collapse eventKey={0}>
    //       <Nav>
    //         <LinkContainer to="/necklace">
    //           <NavItem eventKey={3}>项链/吊坠</NavItem>
    //         </LinkContainer>
    //         {user &&
    //         <LinkContainer to="/account">
    //           <NavItem eventKey={4}>Account</NavItem>
    //         </LinkContainer>}

    //         {!user &&
    //         <LinkContainer to={'/login' + returnTo}>
    //           <NavItem eventKey={5}>Login</NavItem>
    //         </LinkContainer>}
    //         {!user &&
    //         <LinkContainer to={"/signup" + returnTo}>
    //           <NavItem eventKey={7}>Signup</NavItem>
    //         </LinkContainer>}
    //         {user &&
    //         <LinkContainer to="/logout">
    //           <NavItem eventKey={6} className="logout-link" onClick={this.handleLogout}>
    //             Logout
    //           </NavItem>
    //         </LinkContainer>}
    //       </Nav>
    //       {user &&
    //       <p className={styles.loggedInMessage + ' navbar-text'}>Logged in as <strong>{user.username}</strong>.</p>}
    //       <Nav>
    //         <LinkContainer to="/cart">
    //           <NavItem eventKey={3}>{"购物车(" + numCart + ")"}</NavItem>
    //         </LinkContainer>
    //       </Nav>
    //       <Nav pullRight>
    //         <NavItem eventKey={1} target="_blank" title="View on Github" href="https://github.com/erikras/react-redux-universal-hot-example">
    //           <i className="fa fa-github"/>
    //         </NavItem>
    //       </Nav>
    //     </Navbar.Collapse>
    //   </Navbar>
    // );
  }
}
