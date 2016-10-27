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
  console.log('handle queryUserOrders request: ' + JSON.stringify(req.body));
  // check input
  validateQueryInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.gold.OrderService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.gold.QueryOrderWithUserRequest();
    let userId = req.session.user_id;
    console.log(JSON.stringify(userId));
    console.log(typeof userId);
    request.setUserId(userId);

    // send request to backend server
    client.queryOrderWithUser(request, (err, response)=>{
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