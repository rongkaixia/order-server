import Config from '../Config';
import Cookies from '../cookies';
import * as Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/captain.proto'));
let protos = protoDescriptor.com.echo.protocol;
let host = Config.captainHost;
let port = Config.captainPort;

function validateAuthInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an auth request is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle auth request: ' + JSON.stringify(req.body));
  console.log('req.session: ' + JSON.stringify(req.session));
  let header = new protos.common.ResponseHeader();
  let result = {};
  if (req.session.access_token && req.session.username && req.session.user_id) {
    header.setResult(protos.common.ResultCode.SUCCESS);
    result = {user_id: req.session.user_id, username: req.session.username}
  } else {
    header.setResult(protos.common.ResultCode.SUCCESS);
  }
  console.log("auth result: " + JSON.stringify(Object.assign({}, header.toRaw(), result)))
  res.json(Object.assign({}, header.toRaw(), result))
}

/*
exports = module.exports = function(req, res) {
  console.log('handle auth request: ' + JSON.stringify(req.body));
  console.log('req.session: ' + JSON.stringify(req.session));
  // check input
  validateAuthInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.AuthRequest();
    let token = (req.cookies && req.cookies[Cookies.session]) ? req.cookies[Cookies.session] : ''; 
    request.setToken(token);

    // send request to backend server
    client.auth(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send auth request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header)
      }else {
        console.log("recieve auth response from captain server: " + JSON.stringify(response));
        result = response;
      }
      if (result.is_expired) {
        console.log("clear session cookies")
        clearCookie(req, res);
      }
      res.json(Object.assign({},result.header,result))
    })
  }
  ,(err) => {
    console.log("validateAuthInput error: " + err);
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
*/
