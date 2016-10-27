import Config from '../../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

// TODO: client.signup(request, (err, response)=>{ 返回中的reponse.header跟protos构造的header不太一样
// 的考虑怎么解决
function validateSignupInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an signup request is required");
    } else if (!Validation.isString(req.username) || Validation.empty(req.username)) {
      reject("username(string) is required");
    } else if (!Validation.isString(req.password) || Validation.empty(req.password)) {
      reject("password(string) is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle signup request: ' + JSON.stringify(req.body));
  // check input
  validateSignupInput(req.body)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.SignupRequest();
    request.setPhonenum(req.body.username);
    request.setPassword(req.body.password);

    // send request to backend server
    client.signup(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send signup request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve signup response from captain server: " + JSON.stringify(response));
        result = response;
      }
      // if (result.header.result == protos.common.ResultCode.SUCCESS) {
      if (result.header.result == "SUCCESS") {
        console.log("set user session cookie")
        req.session.access_token = result.token;
        req.session.username = result.username;
        req.session.user_id = result.user_id;
      }
      res.json(Object.assign({},result.header,result))
    })
  },
  (err) => {
    console.log("validateSignupInput error: " + err);
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
