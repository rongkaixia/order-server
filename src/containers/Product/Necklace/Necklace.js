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
        <section className={styles.fpHero}>
          <Row className={styles.fpSectionContent + " " + styles.flex}>
            <Col xs={12} sm={12} md={6} lg={6} mdPush={6} lgPush={6} className={styles.fpProductContent}>
              <h3>你的下一台电脑，现更以两种尺寸呈现。</h3>
              <div className={styles.fpHeroMoreblock}>
                <a className={styles.more}>立即购买</a>
              </div>
            </Col>
            <Col xs={12} sm={12} md={6} lg={6} mdPull={6} lgPull={6}>
            <figure className={styles.necklaceWhite}/>
            </Col>
          </Row>
        </section>
        <section className={styles.fpHero}>
          <div className={styles.fpBillboard}>
            {/*<div className={styles.fpSectionHeader}>
              <h3>你的下一台电脑，现更以两种尺寸呈现。</h3>
              <div className={styles.fpHeroMoreblock}>
                <a className={styles.more}>立即购买</a>
              </div>
            </div>*/}
            <figure className={styles.necklaceBlack}/>
          </div>
        </section>

      </div>
    );
  }
}
