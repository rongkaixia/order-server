import Config from '../../Config';
import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an auth request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (Validation.empty(req.body.productId) || !Validation.isString(req.body.productId)) {
      reject("productId(string) is required");
    } else if (Validation.empty(req.body.num) && !Validation.isInteger(req.body.num)) {
      reject("num(int) is required");
    }else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle updateCart request: ' + JSON.stringify(req.body));
  console.log(req.params);
  // check input
  validateInput(req)
  .then(() => {
    let header = new protos.common.ResponseHeader();
    if (!req.session.cart) {
      req.session.cart = [{productId: req.body.productId, num: req.body.num}];
    } else {
      let index = req.session.cart.findIndex(elem => {return elem.productId == req.body.productId})
      if (index == -1) {
        req.session.cart.push({productId: req.body.productId, num: req.body.num})
      } else {
        req.session.cart[index] = {productId: req.body.productId, num: req.body.num}
      }
    }
    header.setResult(protos.common.ResultCode.SUCCESS);
    // // construct signup request
    // let client = new protos.captain.CaptainService(host + ':' + port, grpc.credentials.createInsecure());

    // let request = new protos.captain.UpdateUserAddressRequest();
    // let token = req.session.access_token; 
    // request.setToken(token);
    // request.setAddressId(req.body.addressId);
    // if (!Validation.empty(req.body.recipientsName)) request.setRecipientsName(req.body.recipientsName);
    // if (!Validation.empty(req.body.recipientsPhone)) request.setRecipientsPhone(req.body.recipientsPhone);
    // if (!Validation.empty(req.body.recipientsAddress)) request.setRecipientsAddress(req.body.recipientsAddress);

    // // send request to backend server
    // client.updateUserAddress(request, (err, response)=>{
    //   let result = {};
    //   if (err) {
    //     console.log("send updateUserAddress request to Captain Server error: " + JSON.stringify(err));
    //     let header = new protos.common.ResponseHeader();
    //     header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
    //     header.setResultDescription(JSON.stringify(err));
    //     result = new protos.captain.LoginResponse().setHeader(header)
    //   }else {
    //     console.log("recieve updateUserAddress response from captain server: " + JSON.stringify(response));
    //     result = response;
    //   }
    //   res.json(Object.assign({},result.header,result))
    // })
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
