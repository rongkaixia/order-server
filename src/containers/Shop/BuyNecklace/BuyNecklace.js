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
import Config from 'config';

// TODO: 增加错误展示界面，监听loadInfo的错误
/* eslint-disable */ 
@reduxForm({
  form: 'address',
  fields: ['product_id', 'num']
})
@asyncConnect([{
  promise: ({store: {dispatch, getState}, helpers: {client}}) => {
    let globalState = getState();
    const promises = [];
    var id = globalState.routing.location.pathname.split("/").reverse()[0]

    // load product info
    if (!shopAction.isProductLoaded(id, globalState)) {
      promises.push(dispatch(shopAction.loadProductInfo(id)));
    }

    // pricing with num=1
    let pricingReq = {id: id, num: 1};
    promises.push(dispatch(shopAction.pricing(pricingReq, globalState.csrf._csrf)))
    return Promise.all(promises);
  }
}])
@connect((state => ({shop: state.shop,
                    necklaces: state.shop.productsByType.necklace,
                    authKey: state.csrf._csrf})),
        {...shopAction, redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    shop: PropTypes.object,
    necklaces: PropTypes.object,
    authKey: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    currentChoices: null,
    validateFormError: null,
    num: 1
  };

  increaseNum() {
    let num = this.state.num + 1;
    this.setState({num: num});
    const productId = location.pathname.split("/").reverse()[0]
    let pricingReq = {id: productId, num: num};
    this.props.pricing(pricingReq, this.props.authKey)
  }

  decreaseNum() {
    let num = Math.max(1, this.state.num - 1);
    this.setState({num: num});
    const productId = location.pathname.split("/").reverse()[0]
    let pricingReq = {id: productId, num: num};
    this.props.pricing(pricingReq, this.props.authKey)
  }

  setChoices(name, value, event) {
    let newChoices = this.state.currentChoices;
    if (!newChoices) newChoices = {};
    newChoices[name] = value;
    this.setState({currentChoices: newChoices});
  }

  handleSubmit(event) {
    const {necklaces, location} = this.props;
    var id = location.pathname.split("/").reverse()[0]
    let item = necklaces[id];
    const currentChoices = this.state.currentChoices;
    item.choices.forEach((choice) => {
      if (!currentChoices || !currentChoices[choice.name]) {
        event.preventDefault();
        this.setState({validateFormError: "请选择 " + choice.display_name})
        return;
      }
    })
  }

  renderChoice(choice) {
    const styles = require('./BuyNecklace.scss');
    const currentChoices = this.state.currentChoices;
    const option = choice.value.map((v) => {
      let active = currentChoices && currentChoices[choice.name] === v; 
      return (
        <Button bsSize="large" active={active} onClick={this.setChoices.bind(this, choice.name, v)}>{v}</Button>
      );
    })
    return (
      <div>
        <p className={styles.subTitle}>{choice.display_name}</p>
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
    const {shop, authKey, location} = this.props;
    const {currentChoices, num, validateFormError} = this.state;
    const productId = location.pathname.split("/").reverse()[0]
    const choicesSection = item.choices.map((choice) => {
      return this.renderChoice(choice);
    })
    const choicesInput = item.choices.map((choice) => {
      return (<input name={choice.name} type="hidden" value={currentChoices && currentChoices[choice.name]} />)
    })
    return (
      <div className={styles.gridItem + " container"}>
        <div className={styles.selectionImage}>
          <Image width={400} height={400} alt='400x400' src={imagePath} responsive rounded/>
        </div>
        <div className={styles.productSelectionArea}>
          <p className={styles.introductionTitle}>{item.name}</p>
          <p className={styles.introductionSummary}>{item.name}</p>
          {choicesSection}
          <p className={styles.subTitle}>{"选择数量"}</p>
          <ButtonGroup>
            <Button bsSize="large" onClick={this.decreaseNum.bind(this)}>-</Button>
            <Button bsSize="large">{num}</Button>
            <Button bsSize="large" onClick={this.increaseNum.bind(this)}>+</Button>
          </ButtonGroup>
          <p className={styles.chooseOptionComment}></p>
          <p>{shop.realPayAmt}</p>
          <form id="shop-form" action={"http://" + Config.orderDomain + "/buy/checkout"} 
          method="post" onSubmit={this.handleSubmit.bind(this)}>
            <input name="productId" type="hidden" value={productId} />
            <input name="num" type="hidden" value={num} />
            <input name="_csrf" type="hidden" value={authKey} />
            {choicesInput}
            <Button bsSize="large" bsStyle="info" type="submit">立即购买</Button>
          </form>
          {validateFormError && <div>{validateFormError}</div>}
        </div>
      </div>
    );
  }

  render() {
    const styles = require('./BuyNecklace.scss');
    const {necklaces, location} = this.props;
    var id = location.pathname.split("/").reverse()[0]
    let item = necklaces[id];
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
