import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';


// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(shopAction.loadNecklace());
  }
}])
@connect((state => ({necklaces: state.shop.productsByType.necklace})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    necklaces: PropTypes.object,
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
    const {necklaces} = this.props;
    let items = [];
    // console.log("necklaces: " + JSON.stringify(necklaces))
    if (necklaces) {
      Object.keys(necklaces).forEach((id) => {
        let item = necklaces[id];
        items.push(this.renderItem(item));;
      })
    }

    return (
      <div className={styles.necklacePage + ' container'}>
        <h1 className={styles.headline}>项链/吊坠</h1>
        <div className="container">
          <ul>{items}</ul>
        </div>
      </div>
    );
  }
}
