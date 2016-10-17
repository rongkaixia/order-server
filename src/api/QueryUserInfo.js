import Config from '../Config';
import Cookies from '../cookies';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('./protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an queryUserInfo request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (!req.session.access_token) {
      reject("token is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle queryUserInfo request: ' + JSON.stringify(req.body));
  // check input
  validateInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.QueryUserInfoRequest();
    let token = req.session.access_token; 
    request.setToken(token);

    // send request to backend server
    client.queryUserInfo(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send queryUserInfo request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve queryUserInfo response from captain server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  }
  ,(err) => {
    console.log("validateInput error: " + err);
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
