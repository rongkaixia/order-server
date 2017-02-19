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
import Slider from 'react-slick';

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
    localNavBarFixedBottom: true,
    localNavBarFixedBottomTop: null
  };

  handleScroll(e) {
    const localnavbarEl = window.document.getElementById("localnavbar")
    const productSelectionEl = window.document.getElementById("productSelection")

    if (localnavbarEl && productSelectionEl) {
      const localnavbarElRect = localnavbarEl.getBoundingClientRect()
      const productSelectionElRect = productSelectionEl.getBoundingClientRect()
      console.log("localnavbarEl.top: " + localnavbarElRect.top)
      console.log("productSelectionEl.bottom: " + productSelectionElRect.bottom)
      // set localNavBarFixedBottomTop if need
      if (this.state.localNavBarFixedBottomTop == null && this.state.localNavBarFixedBottom)
        this.setState({localNavBarFixedBottomTop: localnavbarElRect.top})

      if (this.state.localNavBarFixedBottom && productSelectionElRect.bottom <= localnavbarElRect.top)
        this.setState({localNavBarFixedBottom: false})

      if (!this.state.localNavBarFixedBottom && productSelectionElRect.bottom > this.state.localNavBarFixedBottomTop)
        this.setState({localNavBarFixedBottom: true})
    }
    // const el = window.document.getElementById("productSelectionHeader")
    // const navbar = window.document.getElementById("navbar")
    // if (el){
    //   console.log("========productSelectionHeader handleScroll===========")
    //   const bottom = el.getBoundingClientRect().bottom;
    //   console.log(JSON.stringify(bottom))
    //   if (this.state.isLocalNavVisable && bottom > 0) {
    //     this.setState({isLocalNavVisable: false})
    //   }
    //   if (!this.state.isLocalNavVisable && bottom <= 0) {
    //     this.setState({isLocalNavVisable: true})
    //   }
    // }
    // if (navbar){
    //   console.log("========navbar handleScroll===========")
    //   const bottom = navbar.getBoundingClientRect().bottom;
    //   console.log(JSON.stringify(bottom))
    //   if (!this.state.isMobileLocalNavFixedTop && bottom <= 0) {
    //     this.setState({isMobileLocalNavFixedTop: true})
    //   }
    //   if (this.state.isMobileLocalNavFixedTop && bottom > 0) {
    //     this.setState({isMobileLocalNavFixedTop: false})
    //   }
    // }
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

  renderSlider() {
    const settings = {
      dots: true,
      adaptiveHeight: true,
    };
    const styles = require('./BuyNecklace.scss');
    return (
      <article className={styles.galleryContainer}>
        <div className={styles.gallery}>
          <div className={styles.gallerySlideWrapper}>
            <Slider {...settings} style={{height: '100%'}}>
              <a className={styles.galleryItem}>
                {/*<div className={styles.galleryImage}>1</div>*/}
                <figure className={styles.galleryImage + ' ' + styles.galleryImageTest}/>
              </a>
              <a className={styles.galleryItem}>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageClassic}/>
              </a>
              <a className={styles.galleryItem}>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageSnow}/>
              </a>
            </Slider>
          </div>
        </div>
      </article>
    );
  }

  renderLocalNav(product) {
    const styles = require('./BuyNecklace.scss');
    const {authKey} = this.props;
    const {localNavBarFixedBottom, currentChoices, num, skuId, realPayAmt} = this.state;
    let summaryStr = ""
    const summary = Object.keys(currentChoices).map(key => {
      return (
        <li>{key + ": " + currentChoices[key]}</li>
      );
    })
    return (
      <div className={[styles.localnavbar,
                      localNavBarFixedBottom==true?"fixedBottom":""].join(' ')}
      id = {"localnavbar"}>
        <div className={styles.nav}>
          <div className={styles.navContent}>
            <p className={styles.header}>
              你已选择
            </p>
            <div className={styles.summary}>
              <p className={styles.name}> 
                {product.name} 
                {realPayAmt && 
                <span className={styles.mobileAmount}>{'¥' + realPayAmt}</span> }
              </p>
              <ul> {summary} </ul>
            </div>
            <div className={styles.numberWrapper}>
              <div className={styles.number}><span className={styles.times}></span>{num}</div>
            </div>
          </div>
          <div className={styles.submit}>
            <form className={styles.submitForm} action={"http://" + Config.orderDomain + "/buy/checkout"} 
                method="post" onSubmit={this.handleSubmit.bind(this)}>
              <input type="hidden" name="items[][skuId]" value={skuId} />
              <input type="hidden" name="items[][num]" value={num} />
              <input name="_csrf" type="hidden" value={authKey} />
              <Button bsClass={styles.submitButton} bsSize="large" type="submit">立即购买</Button>
            </form>
          </div>
          { realPayAmt && <div className={styles.amount}>{'¥' + realPayAmt}</div>}
        </div>
      </div>
    );
  }

  renderChoice(choiceKey, choiceValues, availableSellProps, isHeroButton) {
    const styles = require('./BuyNecklace.scss');
    const currentChoices = this.state.currentChoices;
    // choiceValues = ["18k白金", "18k黄金", "18k白金", "18k黄金", "18k白金", "18k黄金"]
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
    const localnav = this.renderLocalNav(product);
    const slider = this.renderSlider();
    return (
      <div className={styles.buyNecklaceContainer}>
        <Row id = {"productSelection"}>
          <Col xs={12} sm={6} md={6} lg={6} className={styles.productColumn}>
            {slider}
          </Col>
          <Col xs={12} sm={6} md={6} lg={6} className={styles.productColumn}>
            <div className={styles.productSelectionArea}>
              <div className={styles.productSelectionHeader}>
                <h3 className={styles.introductionTitle}>{product.name}</h3>
                <p className={styles.introductionSummary}>
                {product.name}
                </p>
              </div>
              {choicesSection}
              <div className={styles.selection}>
                <p className={styles.subTitle}>{"数量"}</p>
                <div className={styles.numberSelection}>
                  <Button bsClass={styles.buttonFocusDisabled} bsSize="large" onClick={this.decreaseNum.bind(this)}>-</Button>
                  <span className={styles.number}>{num}</span>
                  <Button bsClass={styles.buttonFocusDisabled} bsSize="large" onClick={this.increaseNum.bind(this)}>+</Button>
                </div>
                <p className={styles.chooseOptionComment}></p>
              </div>
              {/*<form id="shop-form" action={"http://" + Config.orderDomain + "/buy/checkout"} 
              method="post" onSubmit={this.handleSubmit.bind(this)}>
                <input type="hidden" name="items[][skuId]" value={skuId} />
                <input type="hidden" name="items[][num]" value={num} />
                <input name="_csrf" type="hidden" value={authKey} />
                <Button bsSize="large" bsStyle="info" type="submit">立即购买</Button>
                <Button bsSize="large" onClick={this.handleAddToCart.bind(this, skuId, num)}>加入购物车</Button>
              </form>*/}
              {/*validateFormError && <div>{validateFormError}</div>*/}
            </div>
          </Col>
        </Row>
        {localnav}
      </div>
    );
  }

  render() {
    const styles = require('./BuyNecklace.scss');
    let itemView = null;
    if (this.product) {
      itemView = this.renderItem(this.product);
    }

    return itemView;
  }
}
