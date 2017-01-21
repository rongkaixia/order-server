import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import {Grid, Row, Col} from 'react-bootstrap/lib';
import config from '../../config';
import Querystring from 'querystring';

/* eslint-disable */ 
@connect(state => ({location: state.routing.location}))
export default class Propagation extends Component {
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
    const styles = require('./Promos.scss');
    return (
      <Grid className={styles.promoContainer}>
        <Row>
          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}><code>&lt;{'Col xs={12} md={3}'} /&gt;</code></Col>
          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}><code>&lt;{'Col xs={12} md={3}'} /&gt;</code></Col>
          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}><code>&lt;{'Col xs={12} md={3}'} /&gt;</code></Col>
          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}><code>&lt;{'Col xs={12} md={3}'} /&gt;</code></Col>
        </Row>
      </Grid>
    );
  }
}
