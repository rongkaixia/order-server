import React, { Component } from 'react';
import { Link } from 'react-router';
import { CounterButton, GithubButton } from 'components';
import { Promos } from 'containers';
import config from '../../config';
import Helmet from 'react-helmet';
import Slider from 'react-slick';

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


export default class Home extends Component {

  renderSlider() {
    const settings = {
      dots: true,
      adaptiveHeight: true,
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
              <a className={styles.galleryItem}>
                {/*<div className={styles.galleryImage}>1</div>*/}
                <figure className={styles.galleryImage + ' ' + styles.galleryImageTest}/>
              </a>
              <a className={styles.galleryItem}>
                <figure className={styles.galleryImage + ' ' + styles.galleryImageClassic}/>
              </a>
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

