import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { CounterButton, GithubButton } from 'components';
import { Promos } from 'containers';
import config from '../../config';
import Helmet from 'react-helmet';
import Slider from 'react-slick';
import * as navbarAction from 'redux/modules/navbar';

var SampleNextArrow = React.createClass({
  render: function() {
    return <div {...this.props}></div>;
  }
});

var SamplePrevArrow = React.createClass({
  render: function() {
    return (
      <div {...this.props}></div>
    );
  }
});

@connect((state => ({navbarColor: state.navbar.color})),
        {...navbarAction})
export default class Home extends Component {
  static propTypes = {
    changeToBlack: PropTypes.func.isRequired,
    changeToWhite: PropTypes.func.isRequired
  };
  afterSliderChange(sliderIdx) {
    console.log(JSON.stringify(sliderIdx))
    if (sliderIdx == 3) {
      this.props.changeToBlack()
    } else {
      this.props.changeToWhite()
    }
  }

  renderSlider() {
    const settings = {
      dots: true,
      adaptiveHeight: true,
      afterChange: this.afterSliderChange.bind(this),
      nextArrow: <SampleNextArrow />,
      prevArrow: <SamplePrevArrow />
    };
    const styles = require('./Home.scss');
    const imgPath = require('./jade2.jpg');
    return (
      <article className={styles.galleryContainer}>
        <div className={styles.gallery}>
          <div className={styles.gallerySlideWrapper}>
            <Slider {...settings} style={{height: '100%'}}>
              <div className={styles.galleryItem}>
                {/*<div className={styles.galleryImage}>1</div>*/}
                <figure className={styles.galleryImage + ' ' + styles.galleryImageTest}/>
              </div>
              <div className={styles.galleryItem}>
                <div className={styles.galleryItemContent + " absolute"}>
                  <h3 className={"white"}>翠璨主石，<br/>星光璀璨。</h3>
                  <div className={styles.galleryMoreblock}>
                    <a className={styles.more}>立即购买</a>
                  </div>
                </div>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageClassicBlack}/>
              </div>
              <div className={styles.galleryItem}>
                <div className={styles.galleryItemContent}>
                  <h3>冰钻翠芯，<br/>冷艳登场。</h3>
                  <div className={styles.galleryMoreblock}>
                    <a className={styles.more}>立即购买</a>
                  </div>
                </div>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageSnowWhite}/>
              </div>
              <div className={styles.galleryItem}>
                <div className={styles.galleryItemContent + " absolute"}>
                  <h3 className={"white"}>翠璨主石，<br/>星光璀璨。</h3>
                  <div className={styles.galleryMoreblock}>
                    <a className={styles.more}>立即购买</a>
                  </div>
                </div>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageRingCircleBlue}/>
              </div>
            </Slider>
          </div>
        </div>
      </article>
    );
  }
  render() {
    const styles = require('./Home.scss');
    console.log("=========styles========")
    console.log(JSON.stringify(styles))
    // require the logo image both from client and server
    const logoImage = require('./logo.png');
    const slider = this.renderSlider()
    return (
      <div className={styles.home}>
        <Helmet title="Home"/>
        {slider}
        <Promos />
      </div>
    );
  }
}

