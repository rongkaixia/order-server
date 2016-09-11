import Config from '../Config';
import Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/order-sdk/protobuf/protocol.proto'));
let protos = protoDescriptor.com.echo.gold;
let host = Config.goldHost;
let port = Config.goldPort;

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

exports = module.exports = function(req, res) {
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
}
