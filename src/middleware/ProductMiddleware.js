import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import ApiPath from 'api/ApiPath';
import Cookies from '../cookies';
import {queryProduct} from 'echo-common-tmp/api/product/product';

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

router.get(ApiPath.QUERY_PRODUCT + '/:type', (req, res) => {
  let data = queryProduct();
  res.json({result: "SUCCESS", data: data});
})
export default router
