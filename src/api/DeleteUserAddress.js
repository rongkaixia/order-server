import Config from '../Config';
import Cookies from '../cookies';
import * as Validation from 'utils/Validation';

var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/captain.proto'));
let protos = protoDescriptor.com.echo.protocol;
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an auth request is required");
    } else if (!req.cookies || !req.cookies[Cookies.session]) {
      reject("token is required");
    } else if (Validation.empty(req.body.addressId)) {
      reject("addressId(string) is required");
    }else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle deleteUserAddress request: ' + JSON.stringify(req.body));
  console.log(req.params);
  // check input
  validateInput(req)
  .then(() => {
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.DeleteUserAddressRequest();
    let token = (req.cookies && req.cookies[Cookies.session]) ? req.cookies[Cookies.session] : ''; 
    request.setToken(token);
    request.setAddressId(req.body.addressId);

    // send request to backend server
    client.deleteUserAddress(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send deleteUserAddress request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header)
      }else {
        console.log("recieve deleteUserAddress response from captain server: " + JSON.stringify(response));
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
