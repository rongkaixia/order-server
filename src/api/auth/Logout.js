import Config from '../../config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateLogoutInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an logout request is required");
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle logout request: ' + JSON.stringify(req.body));
  let token = null;
  if (!req.sessionID) {
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.SUCCESS);
    header.setResultDescription('ok');
    res.json(header.toRaw());
    return;
  }
  // check input
  validateLogoutInput(req)
  .then(() => {
    return new Promise((resolve, reject) => {
      console.log("clear session with id: " + JSON.stringify(req.sessionID));
      token = req.session.access_token;
      req.session.destroy(function(err) {
        if (err) {
          reject("cannot destroy session")
        } else {
          resolve()
        }
      })
    })
  }
  ,(err) => {
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INVALID_REQUEST_ARGUMENT);
    header.setResultDescription(err);
    res.json(header.toRaw());
    return;
  })
  .then(() => {
    console.log('send logout request to Captain Server...');
    // construct signup request
    let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    let request = new protos.captain.LogoutRequest();
    request.setToken(token);

    // send request to backend server
    client.logout(request, (err, response)=>{
      let result = {};
      if (err) {
        console.log("send logout request to Captain Server error: " + JSON.stringify(err));
        let header = new protos.common.ResponseHeader();
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        result = new protos.captain.LoginResponse().setHeader(header).toRaw();
      }else {
        console.log("recieve logout response from captain server: " + JSON.stringify(response));
        result = response;
      }
      res.json(Object.assign({},result.header,result))
    })
  })
  .catch((err) => {
    console.log(err);
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
    header.setResultDescription(JSON.stringify(err));
    res.json(header.toRaw());
  })
}
