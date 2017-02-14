import React, {Component, PropTypes} from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {reduxForm} from 'redux-form';
import Helmet from 'react-helmet';
import { asyncConnect } from 'redux-async-connect';
import {UserCenterLeftPanel} from 'containers';
import { routeActions } from 'react-router-redux';
import * as shopAction from 'redux/modules/shop';
import {addCart, loadCart} from 'redux/modules/cart';
import Config from 'config';
import Querystring from 'querystring';
import Image from 'react-bootstrap/lib/Image';
import {Grid, Row, Col, Well, Collapse, ButtonToolbar, ButtonGroup, Button} from 'react-bootstrap/lib';

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
    realPayAmt: null,
    isLocalNavVisable: false
  };

  handleScroll(e) {
    console.log("========BuyNecklace handleScroll===========")
    const el = window.document.getElementById("productSelectionHeader")
    if (el){
      const bottom = el.getBoundingClientRect().bottom;
      console.log(JSON.stringify(bottom))
      if (this.state.isLocalNavVisable && bottom > 0) {
        this.setState({isLocalNavVisable: false})
      }
      if (!this.state.isLocalNavVisable && bottom <= 0) {
        this.setState({isLocalNavVisable: true})
      }
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll.bind(this));
  }

  componentWillMount(){
    this.product = null;
    this.items = null;
    let spuId = this.props.location.pathname.split("/").reverse()[0]
    let index = this.props.shop.products.findIndex(elem => {return elem._id == spuId})
    if (index != -1) {
      this.product = this.props.shop.products[index];
      this.items = this.props.shop.items.filter(elem => {return elem.spu_id == spuId})
      if (this.items.length > 0) {
        const currentChoices = Object.assign({}, this.items[0].sell_props);
        this.setState({currentChoices: currentChoices, skuId: this.items[0]._id})
        let pricingReq = {id: this.items[0]._id, num: this.state.num};
        this.props.pricing(pricingReq, this.props.authKey).then((res) => {
          this.setState({realPayAmt: res.real_pay_amt})
        })
      }
    }
  }

  increaseNum() {
    let num = this.state.num + 1;
    this.setState({num: num});
    let pricingReq = {id: this.state.skuId, num: num};
    this.props.pricing(pricingReq, this.props.authKey).then((res) => {
      this.setState({realPayAmt: res.real_pay_amt})
    })
  }

  decreaseNum() {
    let num = Math.max(1, this.state.num - 1);
    this.setState({num: num});
    let pricingReq = {id: this.state.skuId, num: num};
    this.props.pricing(pricingReq, this.props.authKey).then((res) => {
      this.setState({realPayAmt: res.real_pay_amt})
    })

  }

  setChoicesAndPricing(name, value, event) {
    let newChoices = this.state.currentChoices;
    if (!newChoices) newChoices = {};
    newChoices[name] = value;
    // clean useless choices
    let index = this.product.sell_props_name.indexOf(name)
    for (let i = index + 1; i < this.product.sell_props_name.length; i++) {
      delete newChoices[this.product.sell_props_name[i]]
    }
    console.log("=====newChoices======")
    console.log(JSON.stringify(newChoices))
    this.setState({currentChoices: newChoices, realPayAmt: null});

    // pricing
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
    if (!auth.loggedIn) {
      event.preventDefault();
      const redirectPath = location.pathname + location.search;
      const returnTo = '?' + Querystring.stringify({return_to: redirectPath});
      console.log("returnTo: " + returnTo)
      this.props.redirectTo('/login' + returnTo)
    } else {
      const currentChoices = this.state.currentChoices;
      for (let i = 0; i < this.product.sell_props_name.length; i++) {
        let choiceKey = this.product.sell_props_name[i];
        if (!currentChoices || !(choiceKey in currentChoices)) {
          event.preventDefault();
          this.setState({validateFormError: "请选择 " + choiceKey})
          return;

        }
      }
    }
  }

  handleAddToCart(skuId, num, event) {
    const {authKey} = this.props;
    return this.props.addCart({skuId: skuId, num: num}, authKey)
                     .then(() => { return this.props.loadCart()})
  }

  renderChoice(choiceKey, choiceValues, availableSellProps, isHeroButton) {
    const styles = require('./BuyNecklace.scss');
    const currentChoices = this.state.currentChoices;
    const option = choiceValues.map((v) => {
      let active = currentChoices && currentChoices[choiceKey] === v;
      let disabled = (availableSellProps.indexOf(v) == -1)
        // <Button bsSize="large" disabled={disabled} active={active} onClick={this.setChoicesAndPricing.bind(this, choiceKey, v)}>
      return (
        <Button bsClass={styles.heroButton} bsSize="large" disabled={disabled} active={active} onClick={this.setChoicesAndPricing.bind(this, choiceKey, v)}>
        {v}
        </Button>
      );
    })
    return (
      <div className={styles.selection}>
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
    const {isLocalNavVisable, currentChoices, num, skuId, realPayAmt, validateFormError} = this.state;
    const styles = require('./BuyNecklace.scss');
    const imagePath = this.product.images.hero_image;
    const choicesSection = this.renderSellProps();
    return (
      <div className={styles.gridItem}>
        <div className={[styles.localnav, isLocalNavVisable==true?"active":""].join(' ')}>
          <div className={styles.navContent}>
            <h6>
            {product.name}
            { realPayAmt && <span className={styles.price}>{'¥' + realPayAmt}</span>}
            </h6>
          </div>
        </div>
        <Row>
          <Col xs={12} sm={6} md={6} lg={6} className={styles.productColumn}>
            <div className={styles.selectionImage}>
              <Image width={400} height={400} alt='400x400' src={imagePath} responsive rounded/>
            </div>
          </Col>
          <Col xs={12} sm={6} md={6} lg={6} className={styles.productColumn}>
            <div className={styles.productSelectionArea}>
              <div className={styles.productSelectionHeader} id={"productSelectionHeader"}>
                <h3 className={styles.introductionTitle}>{product.name}</h3>
                <p className={styles.introductionSummary}>
                {product.name}
                { realPayAmt && <span className={styles.price}>{'¥' + realPayAmt}</span>}
                </p>
              </div>
              {choicesSection}
              <div className={styles.selection}>
                <p className={styles.subTitle}>{"选择数量"}</p>
                <ButtonGroup>
                  <Button bsSize="large" onClick={this.decreaseNum.bind(this)}>-</Button>
                  <Button bsSize="large">{num}</Button>
                  <Button bsSize="large" onClick={this.increaseNum.bind(this)}>+</Button>
                </ButtonGroup>
                <p className={styles.chooseOptionComment}></p>
              </div>
              { realPayAmt && <p>{realPayAmt}</p>}
              <form id="shop-form" action={"http://" + Config.orderDomain + "/buy/checkout"} 
              method="post" onSubmit={this.handleSubmit.bind(this)}>
                <input type="hidden" name="items[][skuId]" value={skuId} />
                <input type="hidden" name="items[][num]" value={num} />
                <input name="_csrf" type="hidden" value={authKey} />
                <Button bsSize="large" bsStyle="info" type="submit">立即购买</Button>
                <Button bsSize="large" onClick={this.handleAddToCart.bind(this, skuId, num)}>加入购物车</Button>
              </form>
              {validateFormError && <div>{validateFormError}</div>}
            </div>
          </Col>
        </Row>
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
      <div className={styles.buyNecklacePage}>
        {itemView}
      </div>
    );
  }
}
