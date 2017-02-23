import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';

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
    const styles = require('./BuyNecklace.scss');
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
    const styles = require('./BuyNecklace.scss');
    const {shop} = this.props;
    let items = [];
    // console.log("necklaces: " + JSON.stringify(necklaces))
    if (shop && shop.products) {
      shop.products.filter(elem => {return elem.category_name == JADE_NECKLACE_CATEGORY_NAME})
      .forEach((elem) => {
        items.push(this.renderItem(elem));;
      })
    }

    return (
      <div className={styles.buyNecklaceHome}>
        <h1 className={styles.headline}>项链/吊坠</h1>
        <div className="container">
          <ul>{items}</ul>
        </div>
      </div>
    );
  }
}
