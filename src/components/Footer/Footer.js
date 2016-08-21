import React, {Component, PropTypes} from 'react';
import {Link} from 'react-router';
import Helmet from 'react-helmet';
import Navbar from 'react-bootstrap/lib/Navbar';
import Nav from 'react-bootstrap/lib/Nav';
import NavItem from 'react-bootstrap/lib/NavItem';
import MenuItem from 'react-bootstrap/lib/MenuItem';
import NavDropdown from 'react-bootstrap/lib/NavDropdown';

export default class Footer extends Component {
  static propTypes = {
  };

  render() {
    const styles = require('./Footer.scss');
    return (
      <div className="well text-center">
        <div className="row">
          <div className="col-md-2">
            <dl>
              <dt>订单服务</dt>
              <dd>购物指南</dd>
              <dd>支付方式</dd>
              <dd>送货服务</dd>
            </dl>
          </div>
          <div className="col-md-2">
            <dl>
              <dt>服务支持</dt>
              <dd>珠宝保养</dd>
              <dd>售后服务</dd>
            </dl>
          </div>
          <div className="col-md-2">
            <dl>
              <dt>关于我们</dt>
              <dd>了解我们</dd>
              <dd>加入我们</dd>
              <dd>联系我们</dd>
            </dl>
          </div>
        </div>
        <div className="row">
          <div className={styles.copyright}>
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
          </div>
        </div>
      </div>
    );
  }
}
