import Config from '../../config';
import * as Validation from 'utils/Validation';
// import {Types as MongoTypes}from 'mongoose';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an addCart request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (Validation.empty(req.body.skuId) || !Validation.isString(req.body.skuId)) {
      reject("skuId(string) is required");
    } else if (Validation.empty(req.body.num) && !Validation.isInteger(req.body.num)) {
      reject("num(int) is required");
    }else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle addCart request: ' + JSON.stringify(req.body));
  console.log(req.params);
  // check input
  validateInput(req)
  .then(() => {
    let currentTimeMs = Date.now();
    let header = new protos.common.ResponseHeader();
    if (!req.session.cart) {
      req.session.cart = [{sku_id: req.body.skuId, 
                          num: req.body.num,
                          create_at: currentTimeMs,
                          update_at: currentTimeMs}];
    } else {
      let index = req.session.cart.findIndex(elem => {return elem.sku_id == req.body.skuId})
      if (index == -1) {
        req.session.cart.push({sku_id: req.body.skuId, 
                              num: req.body.num,
                              create_at: currentTimeMs,
                              update_at: currentTimeMs})
      } else {
        req.session.cart[index].num += req.body.num
        req.session.cart[index].update_at = currentTimeMs
      }
    }
    header.setResult(protos.common.ResultCode.SUCCESS);

    res.json(header.toRaw());
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
