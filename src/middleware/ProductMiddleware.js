import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import CaptainClient from 'echo-common-tmp/api/captain/CaptainClient';
import API from 'echo-common-tmp/api/api';
import ErrorMessage from '../error';
import Cookies from '../cookies';
import {queryProduct} from 'echo-common-tmp/api/product/product';
// let protocol = require('protocol');
const protocol = require('../../lib/protocol/protocol_pb');
const captainClient = new CaptainClient();

function checkPassword(password){
	return true
}

function checkPhonenum(phonenum){
	return true
}

let router = Express.Router();
router.use(BodyParser.json()); // for parsing application/json
router.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(CookieParser())

router.get(API.PRODUCT_API_PATH + '/:type', (req, res) => {
  let data = queryProduct();
  res.json({data: data});
})
export default router
