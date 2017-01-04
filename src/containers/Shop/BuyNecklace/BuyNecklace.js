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
import {addCart, loadCart} from 'redux/modules/cart';
import Config from 'config';
import Querystring from 'querystring';

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
    var spuId = globalState.routing.location.pathname.split("/").reverse()[0]

    // load product info
    if (!shopAction.isProductLoaded(spuId, globalState)) {
      promises.push(dispatch(shopAction.loadProductInfo(spuId)));
    }
    promises.push(dispatch(shopAction.loadItemInfoBySpu(spuId)))

    // pricing with num=1
    // let pricingReq = {id: id, num: 1};
    // promises.push(dispatch(shopAction.pricing(pricingReq, globalState.csrf._csrf)))
    return Promise.all(promises);
  }
}])
@connect((state => ({shop: state.shop,
                    auth: state.auth,
                    authKey: state.csrf._csrf})),
        {...shopAction, 
        loadCart: loadCart, 
        addCart: addCart, 
        redirectTo: routeActions.push})
export default class UserCenter extends Component {
  static propTypes = {
    shop: PropTypes.object,
    authKey: PropTypes.object,
    redirectTo: PropTypes.func.isRequired
  };

  state = {
    validateFormError: null,
    skuId: null,
    currentChoices: null,
    num: 1,
    realPayAmt: null
  };

  componentWillMount(){
    this.product = null;
    this.items = null;
    let spuId = this.props.location.pathname.split("/").reverse()[0]
    let index = this.props.shop.products.findIndex(elem => {return elem._id == spuId})
    if (index != -1) {
      this.product = this.props.shop.products[index];
      this.items = this.props.shop.items.filter(elem => {return elem.spu_id == spuId})
    }
  }

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

  setChoicesAndPricing(name, value, event) {
    let newChoices = this.state.currentChoices;
    if (!newChoices) newChoices = {};
    newChoices[name] = value;
    this.setState({currentChoices: newChoices});
    let needPricing = true
    this.product.sell_props_name.forEach((choiceKey) => {
      if (!(choiceKey in newChoices)) {
        needPricing = false
      }
    })
    if (needPricing) {
      let selectedItemIndex = this.items.findIndex((elem) => {
        let found = true
        Object.keys(newChoices).forEach((choiceKey) => {
          if (elem.sell_props[choiceKey] != newChoices[choiceKey])  found = false
        })
        return found;
      })
      if (selectedItemIndex != -1) {
        let selectedItem = this.items[selectedItemIndex];
        this.setState({skuId: selectedItem._id})
        let pricingReq = {id: selectedItem._id, num: this.state.num};
        this.props.pricing(pricingReq, this.props.authKey).then((res) => {
          this.setState({realPayAmt: res.real_pay_amt})
        })
      }
    }
  }

  handleSubmit(event) {
    const {necklaces, location, auth} = this.props;
    if (!auth.loginSuccess) {
      event.preventDefault();
      const redirectPath = location.pathname + location.search;
      const returnTo = '?' + Querystring.stringify({return_to: redirectPath});
      console.log("returnTo: " + returnTo)
      this.props.redirectTo('/login' + returnTo)
    } else {
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
  }

  handleAddToCart(productId, num, event) {
    const {necklaces, location, authKey} = this.props;
    let isValidate = true;
    let item = necklaces[productId];
    const currentChoices = this.state.currentChoices;
    item.choices.forEach((choice) => {
      if (!currentChoices || !currentChoices[choice.name]) {
        event.preventDefault();
        isValidate = false;
        this.setState({validateFormError: "请选择 " + choice.display_name})
      }
    })
    if (isValidate) {
      return this.props.addCart({productId: productId, choices: currentChoices, num: num}, authKey)
                       .then(() => { return this.props.loadCart()})
    }
  }

  renderChoice(choiceKey, choiceValues, availableSellProps) {
    const styles = require('./BuyNecklace.scss');
    const currentChoices = this.state.currentChoices;
    const option = choiceValues.map((v) => {
      let active = currentChoices && currentChoices[choiceKey] === v;
      let disabled = (availableSellProps.indexOf(v) == -1)
      return (
        <Button bsSize="large" disabled={disabled} active={active} onClick={this.setChoicesAndPricing.bind(this, choiceKey, v)}>
        {v}
        </Button>
      );
    })
    return (
      <div>
        <p className={styles.subTitle}>{choiceKey}</p>
        <ButtonToolbar>
          {option}
        </ButtonToolbar>
        <p className={styles.chooseOptionComment}>{}</p>
      </div>
    );
  }

  renderSellProps() {
    const {currentChoices} = this.state;
    const sellPropsName = this.product.sell_props_name;
    let filteredItems = this.items;
    const choicesSection = sellPropsName.map((choiceKey) => {
      const allSellProps = Array.from(
        new Set(
          this.items.map((item) => {
            return item.sell_props[choiceKey]
          })
        )
      )
      const availableSellProps = Array.from(
        new Set(
          filteredItems.map((item) => {
            return item.sell_props[choiceKey]
          })
        )
      )
      if (currentChoices && (choiceKey in currentChoices)) {
        let secondFilteredItems = filteredItems.filter((item) => {
          return item.sell_props[choiceKey] == currentChoices[choiceKey];
        })
        filteredItems = secondFilteredItems;
      }
      console.log("=======allSellProps========")
      console.log(JSON.stringify(allSellProps))
      console.log("=======availableSellProps========")
      console.log(JSON.stringify(availableSellProps))
      return this.renderChoice(choiceKey, allSellProps, availableSellProps);
    })
    return choicesSection;
  }

  renderItem(product) {
      // <div className="col-md-3" style={{width:'250px', height:'180px'}}>
    const {shop, authKey, location} = this.props;
    const {currentChoices, num, skuId, realPayAmt, validateFormError} = this.state;
    const styles = require('./BuyNecklace.scss');
    const imagePath = this.product.images.hero_image;
    const choicesSection = this.renderSellProps();
    return (
      <div className={styles.gridItem + " container"}>
        <div className={styles.selectionImage}>
          <Image width={400} height={400} alt='400x400' src={imagePath} responsive rounded/>
        </div>
        <div className={styles.productSelectionArea}>
          <p className={styles.introductionTitle}>{product.name}</p>
          <p className={styles.introductionSummary}>{product.name}</p>
          {choicesSection}
          <p className={styles.subTitle}>{"选择数量"}</p>
          <ButtonGroup>
            <Button bsSize="large" onClick={this.decreaseNum.bind(this)}>-</Button>
            <Button bsSize="large">{num}</Button>
            <Button bsSize="large" onClick={this.increaseNum.bind(this)}>+</Button>
          </ButtonGroup>
          <p className={styles.chooseOptionComment}></p>
          { realPayAmt && <p>{realPayAmt}</p>}
          <form id="shop-form" action={"http://" + Config.orderDomain + "/buy/checkout"} 
          method="post" onSubmit={this.handleSubmit.bind(this)}>
            <input name="skuId" type="hidden" value={skuId} />
            <input name="num" type="hidden" value={num} />
            <input name="_csrf" type="hidden" value={authKey} />
            <Button bsSize="large" bsStyle="info" type="submit">立即购买</Button>
            <Button bsSize="large" onClick={this.handleAddToCart.bind(this, skuId, num)}>加入购物车</Button>
          </form>
          {validateFormError && <div>{validateFormError}</div>}
        </div>
      </div>
    );
  }

  render() {
    const styles = require('./BuyNecklace.scss');
    let itemView = null;
    if (this.product) {
      itemView = this.renderItem(this.product);
    }

    return (
      <div className={styles.necklacePage + ' container'}>
        {itemView}
      </div>
    );
  }
}
