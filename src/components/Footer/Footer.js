import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Helmet from 'react-helmet';
import {Grid, Row, Col, Well, Collapse, Button} from 'react-bootstrap/lib';

const tabletBreakpoint = 768
export default class Footer extends Component {
  static propTypes = {
  };

  constructor(props) {
    super(props)
    console.log("========getInitialState===========")
    console.log(JSON.stringify(props))
    if (__SERVER__) {
      this.state = {windowWidth: null,
                    needCollapse: false,
                    openOrderService: true,
                    openSupport: true,
                    openAboutUs: true}
    } else {
      if (window.outerWidth < tabletBreakpoint) {
        this.state = {windowWidth: window.outerWidth,
                      needCollapse: true,
                      openOrderService: false,
                      openSupport: false,
                      openAboutUs: false}
      } else {
        this.state = {windowWidth: window.outerWidth,
                      needCollapse: false,
                      openOrderService: true,
                      openSupport: true,
                      openAboutUs: true}
      }
    }
  }

  // state = {
  //   needCollapse: false,
  //   openOrderService: true,
  //   openSupport: true,
  //   openAboutUs: true
  // };

  getInitialState() {
    console.log("========getInitialState===========")
    if (window.outerWidth < tabletBreakpoint) {
      return {windowWidth: window.outerWidth,
              needCollapse: true,
              openOrderService: false,
              openSupport: false,
              openAboutUs: false}
    } else {
      return {windowWidth: window.outerWidth,
              needCollapse: false,
              openOrderService: true,
              openSupport: true,
              openAboutUs: true}

    }
  }

  handleResize(e) {
    if (this.state.windowWidth >= tabletBreakpoint && window.outerWidth < tabletBreakpoint) {
      this.setState({needCollapse: true,
                    openOrderService: false,
                    openSupport: false,
                    openAboutUs: false})
    }
    if (this.state.windowWidth < tabletBreakpoint && window.outerWidth >= tabletBreakpoint) {
      this.setState({needCollapse: false,
                    openOrderService: true,
                    openSupport: true,
                    openAboutUs: true})
    }
    
    this.setState({windowWidth: window.outerWidth});
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleCollapseOrderService(e) {
    if (this.state.needCollapse) {
      this.setState({openOrderService: !this.state.openOrderService})
    }
  }

  handleCollapseSupport(e) {
    if (this.state.needCollapse) {
      this.setState({openSupport: !this.state.openSupport})
    }
  }

  handleCollapseAboutUs(e) {
    if (this.state.needCollapse) {
      this.setState({openAboutUs: !this.state.openAboutUs})
    }
  }


  renderHelper() {
    const styles = require('./Footer.scss');
    const {needCollapse} = this.state;
    return (
      <div className={styles.footer}>
        <div className={styles.footerContent}>
          <Row>
            <Col md={2} sm={2} xs={12}>
              <div className={styles.helpColumn}>
                <h6 onClick={this.handleCollapseOrderService.bind(this)}>
                订单服务
                </h6>
                <Collapse in={this.state.openOrderService} timeout={200}>
                  <div>
                    <ul>
                      <li>购物指南</li>
                      <li>支付方式</li>
                      <li>送货服务</li>
                    </ul>
                  </div>
                </Collapse>
              </div>
            </Col>
            <Col md={2} sm={2} xs={12}>
              <div className={styles.helpColumn}>
                <h6 onClick={this.handleCollapseSupport.bind(this)}>
                服务支持
                </h6>
                <Collapse in={this.state.openSupport} timeout={200}>
                  <div>
                    <ul>
                      <li>珠宝保养</li>
                      <li>售后服务</li>
                    </ul>
                  </div>
                </Collapse>
              </div>
            </Col>
            <Col md={2} sm={2} xs={12}>
              <div className={styles.helpColumn}>
                <h6 onClick={this.handleCollapseAboutUs.bind(this)}>
                关于我们
                </h6>
                <Collapse in={this.state.openAboutUs} timeout={200}>
                  <div>
                    <ul>
                      <li>了解我们</li>
                      <li>加入我们</li>
                      <li>联系我们</li>
                    </ul>
                  </div>
                </Collapse>
              </div>
            </Col>
                {/*<dl>
                  <dt onClick={ ()=> this.setState({ open: !this.state.open })}>关于我们</dt>
                    <dd>了解我们</dd>
                    <dd>加入我们</dd>
                    <dd>联系我们</dd>
                </dl>
                <dl>
                  <dt>订单服务</dt>
                  <dd>购物指南</dd>
                  <dd>支付方式</dd>
                  <dd>送货服务</dd>
                </dl>*/}
            <Col md={3} sm={3} xs={12}>
              <div className={styles.footerBrand}>
                <h4>EchoMoment<p>一刻珠宝</p></h4>
                <div className={styles.contactSocial + " smHide"}>
                  <a className={styles.contactWechat} />
                  <a className={styles.contactQQ} />
                  <a className={styles.contactWeibo} />
                </div>
              </div>
            </Col>
            <Col md={3} sm={3} xs={12}>
              <div className={styles.contactUs}>
                <h5>400-619-0909<p>周一至周五09:00~18:00</p></h5>
                <div className={styles.contactSocial}>
                  <a className={styles.contactWechat} />
                  <a className={styles.contactQQ} />
                  <a className={styles.contactWeibo} />
                </div>
              </div>
            </Col>        
          </Row>

        {/* copyright */}
          <Row className={styles.copyright}>
            <h2>Copyright © <span copyright-year="">2016</span>, Smartisan Digital Co., Ltd. All Rights Reserved.
            <span>深圳市壹刻珠宝有限公司</span>
            </h2>
            <h4>
              <a href="http://www.miibeian.gov.cn/" target="_blank">
                <span>京ICP备14041720号-1</span>
                <span>京ICP证140622号</span>
                <span>京公网安备11010502025474</span>
              </a>
            </h4>
          </Row>
        </div>
      </div>
    );
  }

  renderHelperRows() {
    const styles = require('./Footer.scss');
    const {windowWidth} = this.state;
    return (
      <div>
        {windowWidth < tabletBreakpoint &&
        <div>
          <Col md={2} sm={2} xs={12}>
            <div className={styles.helpRow}>
              <h6 onClick={this.handleCollapseOrderService.bind(this)}>
              订单服务
              </h6>
              <Collapse in={this.state.openOrderService}>
                <ul>
                  <li>购物指南</li>
                  <li>支付方式</li>
                  <li>送货服务</li>
                </ul>
              </Collapse>
            </div>
          </Col>
          <Col md={2} sm={2} xs={12}>
            <div className={styles.helpRow}>
              <h6 onClick={this.handleCollapseSupport.bind(this)}>
              服务支持
              </h6>
              <Collapse in={this.state.openSupport}>
                <ul>
                  <li>珠宝保养</li>
                  <li>售后服务</li>
                </ul>
              </Collapse>
            </div>
          </Col>
          <Col md={2} sm={2} xs={12}>
            <div className={styles.helpRow}>
              <h6 onClick={this.handleCollapseAboutUs.bind(this)}>
              关于我们
              </h6>
              <Collapse in={this.state.openAboutUs}>
                <ul>
                  <li>了解我们</li>
                  <li>加入我们</li>
                  <li>联系我们</li>
                </ul>
              </Collapse>
            </div>
          </Col> 
        </div>}
        {windowWidth >= tabletBreakpoint &&
        <div>
        <Col md={6} sm={6} xs={12}>
          <div className={styles.helpContent}>
            <div className={styles.helpRow}>
              <h6>
              订单服务
              </h6>
              <ul>
                <li>购物指南</li>
                <li>支付方式</li>
                <li>送货服务</li>
              </ul>
            </div>
            <div className={styles.helpRow}>
              <h6>
              服务支持
              </h6>
              <ul>
                <li>珠宝保养</li>
                <li>售后服务</li>
              </ul>
            </div>

            <div className={styles.helpRow}>
              <h6>
              关于我们
              </h6>
              <ul>
                <li>了解我们</li>
                <li>加入我们</li>
                <li>联系我们</li>
              </ul>
            </div>
          </div>
        </Col>
        </div>}
      </div>
    );
  }

  renderHelper2() {
    const styles = require('./Footer.scss');
    const {needCollapse} = this.state;
    const helperView = this.renderHelperRows();
    return (
      <div className={styles.footer}>
        <Row className={styles.footerContent}>
          <Col md={3} sm={3} xs={12}>
            <div className={styles.footerBrand}>
              <h4>EchoMoment<p>一刻珠宝</p></h4>
            </div>
          </Col>
          <Col md={3} sm={3} xs={12}>
            <div className={styles.contactUs}>
              <h5>400-619-0909<p>周一至周五09:00~18:00</p></h5>
              <div className={styles.contactSocial}>
                <a className={styles.contactWechat} />
                <a className={styles.contactQQ} />
                <a className={styles.contactWeibo} />
              </div>
            </div>
          </Col>
          {helperView}
        </Row>

      {/* copyright */}
        <Row className={styles.copyright}>
          <h2>Copyright © <span copyright-year="">2016</span>, Smartisan Digital Co., Ltd. All Rights Reserved.
          <span>深圳市壹刻珠宝有限公司</span>
          </h2>
          <h4>
            <a href="http://www.miibeian.gov.cn/" target="_blank">
              <span>京ICP备14041720号-1</span>
              <span>京ICP证140622号</span>
              <span>京公网安备11010502025474</span>
            </a>
          </h4>
        </Row>
      </div>
    );
  }

  render() {
    return this.renderHelper();
  }
}
