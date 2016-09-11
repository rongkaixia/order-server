import Config from '../Config';
import Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/gold.proto'));
let protos = protoDescriptor.com.echo.protocol;
let host = Config.goldHost;
let port = Config.goldPort;

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

exports = module.exports = function(req, res) {
  console.log('handle query request: ' + JSON.stringify(req.body));
  // check input
  validateQueryInput(req.body).catch((err) => {
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header);
    return;
  })
  
  try{
    // construct signup request
    let client = new protos.gold.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.gold.QueryOrderRequest();
    request.setOrderId(req.body.orderId);

    // send request to backend server
    client.queryOrder(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send query request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.gold.OrderResponse().setHeader(header)
      }else {
        console.log("recieve query response from gold server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }catch(err){
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header);
  }
}