import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');

let mango = require('mango');
const productCollectionName = "product";

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an queryUserInfo request is required");
    } else if (req.query && req.query.id && !Validation.isString(req.query.id)) {
      reject("id MUST BE a string")
    } else if (req.query && req.query.type && !Validation.isString(req.query.type)) {
      reject("type MUST BE a string")
    } else if (req.query && req.query.id && req.query.type) {
      reject("type and id MUST NOT BE set at the same time")
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle queryProductInfo request: ' + JSON.stringify(req.query));
  // check input
  validateInput(req)
  .then(() => {
    let header = new protos.common.ResponseHeader();

    // construct query
    let query = null
    if (req.query.id) {
      query = mango.collections[productCollectionName].model.find({_id: req.query.id});
    } else if (req.query.type) {
      query = mango.collections[productCollectionName].model.find({type: req.query.type});
    } else {
      query = mango.collections[productCollectionName].model.find();
    }

    // do query
    query.exec((err, data) => {
      if (err) {
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        res.json(header.toRaw());
      } else {
        let result = [];
        if(data) {
          header.setResult(protos.common.ResultCode.SUCCESS);
          result = data;
        } else {
          header.setResult(protos.common.ResultCode.INVALID_REQUEST_ARGUMENT);
          header.setResultDescription("cannot find products by given query")
        }
        res.json(Object.assign({}, header.toRaw(), {products: result}))
      }
    })
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