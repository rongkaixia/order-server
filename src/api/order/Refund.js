import Config from '../../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.goldHost;
let port = Config.goldPort;

function validateRefundInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an cancel request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (!req.session.access_token) {
      reject("token is required");
    } else if (!Validation.isString(req.body.orderId) || Validation.isEmpty(req.body.orderId)) {
      reject("orderId(string) is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle refund request: ' + JSON.stringify(req.body));
  // check input
  validateRefundInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.gold.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.gold.RefundRequest();
    request.setOrderId(req.body.orderId);

    // send request to backend server
    client.refund(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send refund request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.gold.RefundResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve refund response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }
  ,(err) => {
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
