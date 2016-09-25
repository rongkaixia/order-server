import Config from '../Config';
import Cookies from '../cookies';
import * as Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/captain.proto'));
let protos = protoDescriptor.com.echo.protocol;
let host = Config.captainHost;
let port = Config.captainPort;

const UPDATE_FIELD_USERNAME = 'username';
const UPDATE_FIELD_PASSWORD = 'password';
const UPDATE_FIELD_EMAIL = 'email';
const UPDATE_FIELD_PHONENUM = 'phonenum';
const UPDATE_FIELD_SECURITY_QUESTION1 = 'security_question1';
const UPDATE_FIELD_SECURITY_QUESTION2 = 'security_question2';
const UPDATE_FIELD_SECURITY_QUESTION3 = 'security_question3';
const allowedUpdateFields = [UPDATE_FIELD_USERNAME, 
                             UPDATE_FIELD_PASSWORD,
                             UPDATE_FIELD_EMAIL,
                             UPDATE_FIELD_PHONENUM,
                             UPDATE_FIELD_SECURITY_QUESTION1,
                             UPDATE_FIELD_SECURITY_QUESTION2,
                             UPDATE_FIELD_SECURITY_QUESTION3];

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an auth request is required");
    } else if (!req.cookies || !req.cookies[Cookies.session]) {
      reject("token is required");
    } else if (Validation.empty(req.params.field)) {
      reject("update field is required");
    } else if (allowedUpdateFields.indexOf(req.params.field) == -1) {
      reject("update field " + req.params.field + "is not allowed");
    } else if (Validation.empty(req.body.value) || !Validation.isString(req.body.value)) {
      reject("value(string) is required");
    }else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle updateUserInfo request: ' + JSON.stringify(req.body));
  console.log(req.params);
  // check input
  validateInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.UpdateUserInfoRequest();
    let token = (req.cookies && req.cookies[Cookies.session]) ? req.cookies[Cookies.session] : ''; 
    request.setToken(token);
    if (req.params.field == UPDATE_FIELD_USERNAME) {
      request.setUsername(req.body.value);
    } else if (req.params.field == UPDATE_FIELD_PASSWORD) {
      request.setPassword(req.body.value);
    } else if (req.params.field == UPDATE_FIELD_PHONENUM) {
      request.setPhonenum(req.body.value);
    } else if (req.params.field == UPDATE_FIELD_EMAIL) {
      request.setEmail(req.body.value);
    } else {
      throw new Error("update field " + req.params.field + " is not allowed");
    }

    // send request to backend server
    client.updateUserInfo(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send updateUserInfo request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header)
      }else {
        console.log("recieve updateUserInfo response from captain server: " + JSON.stringify(response));
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
