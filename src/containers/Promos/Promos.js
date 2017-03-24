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

  render() {
    const {user, location, cart} = this.props; // eslint-disable-line no-shadow
    const styles = require('./Promos.scss');
    return (
      <Grid className={styles.promoContainer}>
        <Row>

          <Col xs={12} sm={4} md={4} lg={4} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className={"promoCard"}>
              <div className={styles.promoContentTop}>
                <h6>项链</h6>
                <p>精美绝伦，极致璀璨</p>
              </div>
              <figure className={styles.promoNecklace}/>
            </Card>
          </Col>

          <Col xs={12} sm={4} md={4} lg={4} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className="promoCard">
              <div className={styles.promoContentTop}>
                <h6>戒指</h6>
                <p>翠璨翡翠搭配精致钻石与白金</p>
              </div>
              <figure className={styles.promoRing}/>
            </Card>
          </Col>

          <Col xs={12} sm={4} md={4} lg={4} className={styles.promoColumn}>
            <Card onOver={card => card.setLevel(2)} onOut={card => card.setLevel(1)}
            className={"promoCard"}>
              <div className={styles.promoShadow}/>
              <div className={styles.promoContentTop}>
                <h6 className={"inverse"}>礼品</h6>
                <p className={"inverse"}>多样礼物，总有一款适合您</p>
              </div>
              <figure className={styles.promoGift}/>
            </Card>
          </Col>

        </Row>
      </Grid>
    );
  // render() {
  //   const {user, location, cart} = this.props; // eslint-disable-line no-shadow
  //   const styles = require('./Promos.scss');
  //   return (
  //     <Grid className={styles.promoContainer}>
  //       <Row>
  //         <Col xs={12} sm={6} md={6} lg={4} className={styles.promoColumn}>
  //           <Col xs={7} sm={7} md={7} lg={7}className={styles.promoImage}>
  //             <div className="promoCard">
  //               <figure className={styles.promoNecklace}/>
  //             </div>
  //           </Col>
  //           <Col xs={5} sm={5} md={5} lg={5}>
  //             <div className={styles.promoContentCenter}>
  //               <h6>戒指</h6>
  //               <p>精美绝伦，极致璀璨</p>
  //               <a>立即查看</a>
  //             </div>
  //           </Col>
  //         </Col>


  //         <Col xs={12} sm={6} md={6} lg={4} className={styles.promoColumn}>
  //           <Col xs={7} sm={7} md={7} lg={7}className={styles.promoImage}>
  //             <div className="promoCard">
  //               <figure className={styles.promoRing}/>
  //             </div>
  //           </Col>
  //           <Col xs={5} sm={5} md={5} lg={5}>
  //             <div className={styles.promoContentCenter}>
  //               <h6>项链</h6>
  //               <p>翠璨翡翠搭配精致钻石与白金</p>
  //               <a>立即查看</a>
  //             </div>
  //           </Col>
  //         </Col>


  //         <Col xs={12} sm={6} md={6} lg={4} className={styles.promoColumn}>
  //           <Col xs={7} sm={7} md={7} lg={7}className={styles.promoImage}>
  //             <div className="promoCard">
  //               <figure className={styles.promoGift}/>
  //             </div>
  //           </Col>
  //           <Col xs={5} sm={5} md={5} lg={5}>
  //             <div className={styles.promoContentCenter}>
  //               <h6>礼物</h6>
  //               <p>多样礼物，总有一款适合您</p>
  //               <a>立即查看</a>
  //             </div>
  //           </Col>
  //         </Col>
  //       </Row>
  //     </Grid>
  //   );
  
  }
}
