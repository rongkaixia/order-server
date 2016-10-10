import Config from '../Config';
import Cookies from '../cookies';
import * as Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/captain.proto'));
let protos = protoDescriptor.com.echo.protocol;
let host = Config.captainHost;
let port = Config.captainPort;

let setCookie = (res, {username, token, userId}) => {
  res.cookie(Cookies.username, username, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.session, token, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.userID, userId, { domain: '.' + Config.mainDomain});
  res.cookie(Cookies.loggedIn, true, { domain: '.' + Config.mainDomain});
}


function validateLoginInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an login request is required");
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
  console.log(Validation);
  console.log('handle login request: ' + JSON.stringify(req.body));
  // check input
  validateLoginInput(req.body)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    // grpc的bug，request中有oneof field的话去调用service会错误
    let request = {phonenum: req.body.username, password: req.body.password};
    // let request = new protos.captain.LoginRequest();
    // request.setPhonenum(req.body.username);
    // request.setPassword(req.body.password);
    // console.log(request);

    // send request to backend server
    client.login(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send login request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve login response from captain server: " + JSON.stringify(response));
        result = response;
      }
      if (result.header.result == "SUCCESS") {
        req.session.access_token = result.token;
        req.session.username = result.username;
        req.session.user_id = result.user_id;
      }
      res.json(Object.assign({},result.header,result))
    })
  }
  ,(err) => {
    console.log(err);
    console.log("validateLoginInput error: " + JSON.stringify(err));
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
