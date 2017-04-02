import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';
import {Grid, Row, Col, Well, Collapse, Button} from 'react-bootstrap/lib';

const JADE_NECKLACE_CATEGORY_NAME = "jade-necklace";
// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(shopAction.loadNecklace());
  }
}])
@connect((state => ({shop: state.shop})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    shop: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  render() {
    const styles = require('./Ring.scss');

    return (
      <div className={styles.ringPage}>
        <section className={styles.fpHero + " padTop"}>
          <div className={styles.fpSectionContent}>
            <div className={styles.fpProductContent}>
              <div className={styles.centeralign}>
                <h3>经典垂形，<br/>钻石与翡翠的经典结合。</h3>
                <div className={styles.fpHeroMoreblock}>
                  <a className={styles.more}>立即购买</a>
                </div>
              </div>
            </div>
            <figure className={styles.ringCrownWhite}/>
          </div>
        </section>
        <section className={styles.fpHero}>
          <div className={styles.fpBillboard}>
            <div className={styles.fpProductContent}>
              <h3 className={styles.fontWhiteLighter}>翠璨主石，星光璀璨。</h3>
              <div className={styles.fpHeroMoreblock}>
                <a className={styles.more}>立即购买</a>
              </div>
            </div>
            <figure className={styles.ringCircleBlue}/>
          </div>
        </section>


        <section className={styles.fpHero}>
          <Row className={styles.fpSectionContentWider}>
            <Col xs={12} sm={6} md={6} lg={6} className={styles.fpColumn}>
              <div className={styles.fpProductContent}>
                <div className={styles.centeralign}>
                  <h3>经典垂形，<br/>钻石与翡翠的经典结合。</h3>
                  <div className={styles.fpHeroMoreblock}>
                    <a className={styles.more}>立即购买</a>
                  </div>
                </div>
              </div>
              <figure className={styles.ringCircleWhite}/>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6} className={styles.fpColumn}>
              <div className={styles.fpProductContent}>
                <div className={styles.centeralign}>
                  <h3>经典垂形，<br/>钻石与翡翠的经典结合。</h3>
                  <div className={styles.fpHeroMoreblock}>
                    <a className={styles.more}>立即购买</a>
                  </div>
                </div>
              </div>
              <figure className={styles.ringDiamondWhite}/>
            </Col>
          </Row>
        </section>

      </div>
    );
  }
}
