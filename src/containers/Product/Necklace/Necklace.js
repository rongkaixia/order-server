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

  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const styles = require('./Necklace.scss');
    // const imagePath = require('../../../../static/diaozhui.png');
    const imagePath = item.images.hero_image;
    console.log("imagePath: " + imagePath);
    return (
      <div className={styles.gridItem}>
        <div className="col-md-3">
          <a className="block" href={"/necklaces/" + item._id}>
            <Image alt="150x150 pull-xs-left" src={imagePath} responsive rounded/>
          </a>
          <p>{item.name}</p>
          <span>
              <Link className="btn btn-success" to={"/shop/buy-necklace/" + item._id}>购买</Link>
          </span>
        </div>
      </div>
    );
  }

  render() {
    const styles = require('./Necklace.scss');

    return (
      <div className={styles.necklacePage}>
        <section className={styles.fpHero + " padTop"}>
          <Row className={styles.fpSectionContent}>
            <Col xs={12} sm={6} md={6} lg={6} smPush={6} mdPush={6} lgPush={6} className={styles.fpProductContent}>
              <div className={styles.centeralign}>
                <h3>经典垂形，<br/>钻石与翡翠的经典结合。</h3>
                <div className={styles.fpHeroMoreblock}>
                  <a className={styles.more}>立即购买</a>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6} smPull={6} mdPull={6} lgPull={6}>
            <figure className={styles.necklaceWhite}/>
            </Col>
          </Row>
        </section>
        <section className={styles.fpHero}>
          <div className={styles.fpBillboard}>
            <div className={styles.fpProductContent}>
              <h3 className={styles.fontWhiteLighter}>翠璨主石，星光璀璨。</h3>
              <div className={styles.fpHeroMoreblock}>
                <a className={styles.more + ' ' + 'inverse'}>立即购买</a>
              </div>
            </div>
            <figure className={styles.necklaceBlack}/>
          </div>
        </section>


        <section className={styles.fpHero}>
          <Row className={styles.fpSectionContent}>
            <Col xs={12} sm={6} md={6} lg={6} smPush={6} mdPush={6} lgPush={6} className={styles.fpProductContent}>
              <div className={styles.centeralign}>
                <h3>冰钻翠芯，<br/>冷艳登场，只为您。</h3>
                <div className={styles.fpHeroMoreblock}>
                  <a className={styles.more}>立即购买</a>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={6} md={6} lg={6} smPull={6} mdPull={6} lgPull={6}>
            <figure className={styles.necklaceSnowWhite}/>
            </Col>
          </Row>
        </section>

        <section className={styles.fpHero}>
          <Row className={styles.fpSectionContentWider}>
            <Col xs={12} sm={5} md={5} lg={5} className={styles.fpProductContent + " gray"}>
              <div className={styles.centeralign}>
                <h3>花瓣钻石，<br/>只为翠璨主石。</h3>
                <div className={styles.fpHeroMoreblock}>
                  <a className={styles.more}>立即购买</a>
                </div>
              </div>
            </Col>
            <Col xs={12} sm={7} md={7} lg={7} className={styles.columnImage}>
            <figure className={styles.necklaceSnowBlack}/>
            </Col>
          </Row>
        </section>


      </div>
    );
  }
}
