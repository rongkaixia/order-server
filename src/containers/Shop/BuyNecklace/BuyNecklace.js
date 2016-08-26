import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {reduxForm} from 'redux-form';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import Image from 'react-bootstrap/lib/Image';
import ButtonToolbar from 'react-bootstrap/lib/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/lib/ButtonGroup';
import Button from 'react-bootstrap/lib/Button';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@reduxForm({
  form: 'address',
  fields: ['product_id', 'num']
})
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    return dispatch(shopAction.loadNecklace());
  }
}])
@connect((state => ({necklace: state.shop.products.necklace})),
        {redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    necklace: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  renderChoice(choice) {
    const styles = require('./BuyNecklace.scss');
    const option = choice.value.map((v) => {
      return (
        <Button bsSize="large">{v}</Button>
      );
    })
    return (
      <div>
        <p className={styles.subTitle}>{choice.name}</p>
        <ButtonToolbar>
          {option}
        </ButtonToolbar>
        <p className={styles.chooseOptionComment}>{choice.comment}</p>
      </div>
    );
  }
  renderItem(item) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const styles = require('./BuyNecklace.scss');
    const imagePath = require('../../../../static/diaozhui.png');
    const choices = item.choices.map((choice) => {
      return this.renderChoice(choice);
    })
    return (
      <div className={styles.gridItem + " container"}>
        <div className={styles.selectionImage}>
          <Image width={400} height={400} alt='400x400' src={imagePath} responsive rounded/>
        </div>
        <div className={styles.productSelectionArea}>
          <p className={styles.introductionTitle}>{item.name}</p>
          <p className={styles.introductionSummary}>{item.name}</p>
          {choices}
          <p className={styles.subTitle}>{"选择数量"}</p>
          <ButtonGroup>
            <Button bsSize="large">-</Button>
            <Button bsSize="large">0</Button>
            <Button bsSize="large">+</Button>
          </ButtonGroup>
          <p className={styles.chooseOptionComment}></p>
          <Button bsSize="large" bsStyle="info" href="/buy/checkout/0000001">立即购买</Button>
        </div>
      </div>
    );
  }

  render() {
    const styles = require('./BuyNecklace.scss');
    const {necklace, location} = this.props;
    var id = location.pathname.split("/").reverse()[0]
    let item = necklace[id];
    let itemView = null;
    if (item) {
      itemView = this.renderItem(item);
    }

    return (
      <div className={styles.necklacePage + ' container'}>
        {itemView}
      </div>
    );
  }
}
