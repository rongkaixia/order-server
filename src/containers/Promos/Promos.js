import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { IndexLink } from 'react-router';
import { LinkContainer } from 'react-router-bootstrap';
import { asyncConnect } from 'redux-async-connect';
import {Grid, Row, Col} from 'react-bootstrap/lib';
import config from '../../config';
import Querystring from 'querystring';
var Card = require('react-material-card')
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
          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className="promoCard">
              <div className={styles.promoContentTop}>
                <h6>戒指</h6>
                <p>项链吊坠有多重设计。搭配18k白金、黄金和双色项链来表达您的个人风格</p>
              </div>
              <figure className={styles.promoRing}/>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className={styles.promoNecklace}>
              <div className={styles.promoContentTop}>
                <h6 className={"inverse"}>项链</h6>
                <p className={"inverse"}>项链吊坠有多重设计。搭配18k白金、黄金和双色项链来表达您的个人风格</p>
              </div>
              {/*<figure className={styles.promoNecklace}/>*/}
            </Card>
          </Col>

          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className="promoCard">
              <div className={styles.promoContentTop}>
                <h6>戒指</h6>
                <p>项链吊坠有多重设计。搭配18k白金、黄金和双色项链来表达您的个人风格</p>
              </div>
              <figure className={styles.promoEaring}/>
            </Card>
          </Col>

          <Col xs={12} sm={6} md={6} lg={3} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className="promoCard">
              <div className={styles.promoContentTop}>
                <h6>礼品</h6>
                <p>多样礼物，总有一款适合您</p>
              </div>
              <figure className={styles.promoOther}/>
            </Card>
          </Col>

        </Row>
      </Grid>
    );
  }
}
