import Config from '../../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an QueryCart request is required");
    } else if (!req.session) {
      reject("session is required");
    }else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle queryCart request: ' + JSON.stringify(req.body));
  console.log(req.params);
  // check input
  validateInput(req)
  .then(() => {
    let header = new protos.common.ResponseHeader();
    header.setResult(protos.common.ResultCode.SUCCESS);
    let result = {data: []}
    if (req.session && req.session.cart) {
      result = {data: req.session.cart}
    }
    res.json(Object.assign({}, header, result))
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
