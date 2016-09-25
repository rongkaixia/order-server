import Config from '../Config';
import * as Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/gold.proto'));
let protos = protoDescriptor.com.echo.protocol;
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
    } else if (Validation.isEmpty(req.userId) || !Validation.isString(req.userId)) {
      reject("userId(string) is required");
    } else if (Validation.isEmpty(req.title) || !Validation.isString(req.title)) {
      reject("title(string) is required");
    } else if (Validation.isEmpty(req.productId) || !Validation.isString(req.productId)) {
      reject("productId(string) is required");
    } else if (Validation.isEmpty(req.num) || !Validation.isInteger(req.num)) {
      reject("num(int) is required");
    } else if (Validation.isEmpty(req.payMethod) || !Validation.isString(req.payMethod)) {
      reject("payMethod(string) is required");
    } else if (Validation.isEmpty(req.deliverMethod) || !Validation.isString(req.deliverMethod)) {
      reject("deliverMethod(string) is required");
    } else if (Validation.isEmpty(req.recipientsName) || !Validation.isString(req.recipientsName)) {
      reject("recipientsName(string) is required");
    } else if (Validation.isEmpty(req.recipientsPhone) || !Validation.isString(req.recipientsPhone)) {
      reject("recipientsPhone(string) is required");
    } else if (Validation.isEmpty(req.recipientsAddress) || !Validation.isString(req.recipientsAddress)) {
      reject("recipientsAddress(string) is required");
    } else if (!Validation.isString(req.comment)) {
      reject("comment(string) is required");
    } else if (req.payMethod != PAY_METHOD_ONLINE && req.payMethod != PAY_METHOD_COD) {
      reject("payMethod MUST be ONLINE or COD");
    } else if (req.deliverMethod != DELIVER_METHOD_EXPRESS && req.deliverMethod != DELIVER_METHOD_DTD) {
      reject("deliverMethod MUST be EXPRESS or DTD");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle order request: ' + JSON.stringify(req.body));

  // check input
  validateOrderInput(req.body)
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
        result = new protos.gold.OrderResponse().setHeader(header)
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
    res.json(header);
  })
  .catch((err) => {
    console.log(err);
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  })
}