import Config from '../../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.goldHost;
let port = Config.goldPort;

function validateQueryInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an query request is required");
    } else if (!Validation.isEmpty(req.query.id) && !Validation.isString(req.query.id)) {
      reject("id MUST BE a string");
    } else if (!req.session) {
      reject("session is required");
    } else if (!req.session.user_id) {
      reject("user_id is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle queryUserOrder request: ' + JSON.stringify(req.query));
  // check input
  validateQueryInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.gold.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let handleFunc = (err, response)=>{
      let result = {};
      if (err) {
        console.log(err);
        console.log("send query request to Gold Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.gold.OrderResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve query response from gold server: " + JSON.stringify(response));
        if (req.query.id) {
          let orderInfo = response.order_info;
          response.order_info = [orderInfo];
        }
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    }

    // send request to backend server
    let request = new protos.gold.QueryOrderWithUserRequest();
    if (req.query.id) {
      console.log("req.query.id: " + req.query.id);
      request = new protos.gold.QueryOrderRequest();
      request.setOrderId(req.query.id);
      client.queryOrder(request, handleFunc);
    } else {
      let userId = req.session.user_id;
      console.log(JSON.stringify(userId));
      console.log(typeof userId);
      request.setUserId(userId);
      client.queryOrderWithUser(request, handleFunc);
    }
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