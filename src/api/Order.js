import Config from '../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('./protocol');
let host = Config.goldHost;
let port = Config.goldPort;

const PAY_METHOD_ONLINE = 'ONLINE';
const PAY_METHOD_COD = 'COD';
const DELIVER_METHOD_EXPRESS = 'EXPRESS';
const DELIVER_METHOD_DTD = 'DTD';

function validateOrderInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an order request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (!req.session.access_token) {
      reject("token is required");
    } else if (Validation.isEmpty(req.body.userId) || !Validation.isString(req.body.userId)) {
      reject("userId(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.title) || !Validation.isString(req.body.title)) {
      reject("title(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.productId) || !Validation.isString(req.body.productId)) {
      reject("productId(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.num) || !Validation.isInteger(req.body.num)) {
      reject("num(int) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.payMethod) || !Validation.isString(req.body.payMethod)) {
      reject("payMethod(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.deliverMethod) || !Validation.isString(req.body.deliverMethod)) {
      reject("deliverMethod(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.recipientsName) || !Validation.isString(req.body.recipientsName)) {
      reject("recipientsName(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.recipientsPhone) || !Validation.isString(req.body.recipientsPhone)) {
      reject("recipientsPhone(string) is req.bodyuired");
    } else if (Validation.isEmpty(req.body.recipientsAddress) || !Validation.isString(req.body.recipientsAddress)) {
      reject("recipientsAddress(string) is req.bodyuired");
    } else if (!Validation.isString(req.body.comment)) {
      reject("comment(string) is req.bodyuired");
    } else if (req.body.payMethod != PAY_METHOD_ONLINE && req.body.payMethod != PAY_METHOD_COD) {
      reject("payMethod MUST be ONLINE or COD");
    } else if (req.body.deliverMethod != DELIVER_METHOD_EXPRESS && req.body.deliverMethod != DELIVER_METHOD_DTD) {
      reject("deliverMethod MUST be EXPRESS or DTD");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle order request: ' + JSON.stringify(req.body));

  // check input
  validateOrderInput(req)
  .then(() => {
    // construct signup request
    console.log(host);
    console.log(port);
    let client = new protos.gold.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.gold.OrderRequest();

    request.setUserId(req.body.userId);
    request.setTitle(req.body.title);
    request.setProductId(req.body.productId);
    request.setNum(req.body.num);
    if (req.body.payMethod === PAY_METHOD_ONLINE) {
      request.setPayMethod(protos.gold.PayMethod.ONLINE);
    } else {
      request.setPayMethod(protos.gold.PayMethod.COD);
    }
    if (req.body.deliverMethod === DELIVER_METHOD_EXPRESS) {
      request.setDeliverMethod(protos.gold.DeliverMethod.EXPRESS)
    } else {
      request.setDeliverMethod(protos.gold.DeliverMethod.DTD)
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
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.gold.OrderResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve order response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }
  ,(err) => {
    console.log("validateOrderInput eror:" + JSON.stringify(err));
    console.log(err);
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header.toRaw());
  })
  .catch((err) => {
    console.log(err);
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header.toRaw());
  })
}