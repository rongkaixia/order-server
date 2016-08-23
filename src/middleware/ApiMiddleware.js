import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';

import ErrorMessage from '../error';
import Config from '../Config';

import API from 'order-sdk/api';
var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/order-sdk/protobuf/protocol.proto'));
let protos = protoDescriptor.com.echo.gold;
let host = Config.goldHost;
let port = Config.goldPort;

const RESULT_CODE = 'resultCode';
const RESULT_DESCRIPTION = 'resultDescription';
const DATA = 'data';

let router = Express.Router();
router.use(BodyParser.json()); // for parsing application/json
router.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(CookieParser())

router.post(API.ORDER, (req, res) => {
  console.log('handle order request: ' + JSON.stringify(req.body));
  // check input
  
  // construct signup request
  let client = new protos.OrderService(host + ':' + port, grpc.credentials.createInsecure());

  let request = new protos.OrderRequest();

  request.setUserId(req.body.userId);
  request.setTitle(req.body.title);
  request.setProductId(req.body.productId);
  request.setNum(req.body.num);
  request.setPayMethod(req.body.payMethod);
  request.setDeliverMethod(req.body.deliverMethod);
  request.setRecipientsName(req.body.recipientsName);
  request.setRecipientsPhone(req.body.recipientsPhone);
  request.setRecipientsAddress(req.body.recipientsAddress);
  request.setRecipientsPostcode(req.body.recipientsPostcode);
  request.setComment(req.body.comment);
  console.log("send request to Gold Server");
  console.log("request: " + JSON.stringify(request));

  // send request to backend server
  client.order(request, (err, response)=>{
    let result = {};
    if (err) {
      let header = new protos.ResponseHeader();
      header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
      header.setResultDescription("INTERNAL_SERVER_ERROR");
      result = new protos.OrderResponse().setHeader(header).toRaw()
    }else {
      result = response.toRaw();
    }
    res.json(Object.assign({},result.header.toRaw(),result.toRaw()))
  })
})

export default router
