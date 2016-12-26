import Config from '../../Config';
import * as Validation from 'utils/Validation';
// import {Types as MongoTypes}from 'mongoose';

let grpc = require('grpc');
let protos = require('../protocol');
let host = Config.captainHost;
let port = Config.captainPort;

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an updateCart request is required");
    } else if (!req.session) {
      reject("session is required");
    } else if (Validation.empty(req.body.productId) || !Validation.isString(req.body.productId)) {
      reject("productId(string) is required");
    } else if (Validation.empty(req.body.num) && !Validation.isInteger(req.body.num)) {
      reject("num(int) is required");
    } else if (Validation.empty(req.body.choices)) {
      reject("choices(Object) is required, e.g, {material: xxx, size: xxx}");
    }else {
      // req.body.choices.forEach(choice => {
      //   if (!Validation.isString(choice.name)) {
      //     reject("name(string) is required for choices item, e.g, choices = [{name: xxx, value: xxx}]")
      //   }
      //   if (!Validation.isString(choice.value)) {
      //     reject("value(string) is required for choices item, e.g, choices = [{name: xxx, value: xxx}]")
      //   }
      // })
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
    let cartId = req.body.productId;
    let currentTimeMs = Date.now();
    Object.keys(req.body.choices).forEach(choiceName => {
      cartId += "-" + choiceName + "(" + req.body.choices[choiceName] + ")"
    })
    if (!req.session.cart) {
      req.session.cart = [{cartId: cartId, 
                          productId: req.body.productId, 
                          choices: req.body.choices,
                          num: req.body.num,
                          createAt: currentTimeMs,
                          updateAt: currentTimeMs}];
    } else {
      let index = req.session.cart.findIndex(elem => {return elem.cartId == cartId})
      if (index == -1) {
        req.session.cart.push({cartId: cartId,
                              productId: req.body.productId, 
                              choices: req.body.choices,
                              num: req.body.num,
                              createAt: currentTimeMs,
                              updateAt: currentTimeMs})
      } else {
        req.session.cart[index].num += req.body.num
        req.session.cart[index].updateAt = currentTimeMs
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
