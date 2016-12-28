import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');

let mango = require('mango');
const itemCollectionName = "item";

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an queryItemInfo request is required");
    } else if (req.query && req.query.spu_id && !Validation.isString(req.query.spu_id)) {
      reject("spu_id MUST BE a string")
    } else if (req.query && req.query.category && !Validation.isString(req.query.category)) {
      reject("category MUST BE a string")
    } else if (req.query && req.query.spu_id && req.query.category) {
      reject("category and spu_id MUST NOT BE set at the same time")
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle queryItemInfo request: ' + JSON.stringify(req.query));
  // check input
  validateInput(req)
  .then(() => {
    let header = new protos.common.ResponseHeader();

    // construct query
    let query = null
    if (req.query.spu_id) {
      query = mango.collections[itemCollectionName].model.find({_id: req.query.spu_id});
    } else if (req.query.category) {
      query = mango.collections[itemCollectionName].model.find({category_name: req.query.category});
    } else {
      query = mango.collections[itemCollectionName].model.find();
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
          header.setResultDescription("cannot find items by given query")
        }
        res.json(Object.assign({}, header.toRaw(), {items: result}))
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