import Express from 'express';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';

import Config from '../Config';

import API from 'order-sdk/api';
import Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/order-sdk/protobuf/protocol.proto'));
let protos = protoDescriptor.com.echo.gold;
let host = Config.goldHost;
let port = Config.goldPort;

const PAY_METHOD_ONLINE = 'ONLINE';
const PAY_METHOD_COD = 'COD';
const DELIVER_METHOD_EXPRESS = 'EXPRESS';
const DELIVER_METHOD_DTD = 'DTD';

const RESULT_CODE = 'resultCode';
const RESULT_DESCRIPTION = 'resultDescription';
const DATA = 'data';

let router = Express.Router();
router.use(BodyParser.json()); // for parsing application/json
router.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
router.use(CookieParser())

function validateOrderInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an order request is required");
    } else if (!req.userId || Validation.isString(req.userId)) {
      reject("userId(string) is required");
    } else if (!req.title || Validation.isString(req.title)) {
      reject("title(string) is required");
    } else if (!req.productId || Validation.isString(req.productId)) {
      reject("productId(string) is required");
    } else if (!req.num || Validation.integer(req.num)) {
      reject("num(int) is required");
    } else if (!req.payMethod || Validation.isString(req.payMethod)) {
      reject("payMethod(string) is required");
    } else if (!req.deliverMethod || Validation.isString(req.deliverMethod)) {
      reject("deliverMethod(string) is required");
    } else if (!req.recipientsName || Validation.isString(req.setRecipientsName)) {
      reject("recipientsName(string) is required");
    } else if (!req.recipientsPhone || Validation.isString(req.setRecipientsPhone)) {
      reject("recipientsPhone(string) is required");
    } else if (!req.recipientsAddress || Validation.isString(req.setRecipientsAddress)) {
      reject("recipientsAddress(string) is required");
    } else if (!req.comment || Validation.isString(req.comment)) {
      reject("comment(string) is required");
    } else if (req.payMethod !== PAY_METHOD_ONLINE || req.payMethod !== PAY_METHOD_COD) {
      reject("payMethod MUST be PAY_METHOD_ONLINE or PAY_METHOD_COD");
    } else if (req.deliverMethod !== DELIVER_METHOD_EXPRESS || req.deliverMethod !== DELIVER_METHOD_DTD) {
      reject("deliverMethod MUST be DELIVER_METHOD_EXPRESS or DELIVER_METHOD_DTD");
    } else {
      resolve();
    }
  })
}

router.post(API.ORDER, (req, res) => {
  console.log('handle order request: ' + JSON.stringify(req.body));
  // check input
  validateOrderInput(req.body).catch((err) => {
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header);
    return;
  })
  
  try{
    // construct signup request
    let client = new protos.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.OrderRequest();

    request.setUserId(req.body.userId);
    request.setTitle(req.body.title);
    request.setProductId(req.body.productId);
    request.setNum(req.body.num);
    if (req.body.payMethod === PAY_METHOD_ONLINE) {
      request.setPayMethod(protos.PayMethod.ONLINE);
    } else {
      request.setPayMethod(protos.PayMethod.COD);
    }
    if (req.body.deliverMethod === DELIVER_METHOD_EXPRESS) {
      request.setDeliverMethod(protos.DeliverMethod.EXPRESS)
    } else {
      request.setDeliverMethod(protos.DeliverMethod.DTD)
    }
    request.setRecipientsName(req.body.recipientsName);
    request.setRecipientsPhone(req.body.recipientsPhone);
    request.setRecipientsAddress(req.body.recipientsAddress);
    if (req.body.recipientsPostcode) request.setRecipientsPostcode(req.body.recipientsPostcode);
    request.setComment(req.body.comment);
    console.log("send request to Gold Server");
    console.log("request: " + JSON.stringify(request));

    // send request to backend server
    client.order(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send order request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.ResponseHeader();
        header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.OrderResponse().setHeader(header)
      }else {
        console.log("recieve order response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }catch(err){
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  }
})

function validatePayInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an pay request is required");
    } else if (!Validation.isString(req.orderId) || Validation.empty(req.orderId)) {
      reject("orderId(string) is required");
    } else {
      resolve();
    }
  })
}

router.post(API.PAY, (req, res) => {
  console.log('handle pay request: ' + JSON.stringify(req.body));
  // check input
  validatePayInput(req.body).catch((err) => {
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header);
    return;
  })
  
  try{
    // construct signup request
    let client = new protos.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.PayRequest();
    request.setOrderId(req.body.orderId);

    // send request to backend server
    client.pay(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send pay request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.ResponseHeader();
        header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.OrderResponse().setHeader(header)
      }else {
        console.log("recieve pay response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }catch(err){
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  }
})

function validateQueryInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an query request is required");
    } else if (!Validation.isString(req.orderId) || Validation.empty(req.orderId)) {
      reject("orderId(string) is required");
    } else {
      resolve();
    }
  })
}

router.post(API.QUERY, (req, res) => {
  console.log('handle query request: ' + JSON.stringify(req.body));
  // check input
  validateQueryInput(req.body).catch((err) => {
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header);
    return;
  })
  
  try{
    // construct signup request
    let client = new protos.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.QueryOrderRequest();
    request.setOrderId(req.body.orderId);

    // send request to backend server
    client.queryOrder(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send query request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.ResponseHeader();
        header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.OrderResponse().setHeader(header)
      }else {
        console.log("recieve query response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }catch(err){
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  }
})

function validateNotifyInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an notify request is required");
    } else if (!Validation.isString(req.orderId) || Validation.empty(req.orderId)) {
      reject("orderId(string) is required");
    } else {
      resolve();
    }
  })
}

router.post(API.NOTIFY, (req, res) => {
  console.log('handle notify request: ' + JSON.stringify(req.body));
  // check input
  validateNotifyInput(req.body).catch((err) => {
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header);
    return;
  })
  
  try{
    // construct signup request
    let client = new protos.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.NotifyRequest();
    request.setOrderId(req.body.orderId);

    // send request to backend server
    client.notify(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send notify request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.ResponseHeader();
        header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.OrderResponse().setHeader(header)
      }else {
        console.log("recieve notify response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }catch(err){
    let header = new protos.ResponseHeader();
    header.setResult(protos.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  }
})

export default router
