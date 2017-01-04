import * as Validation from 'utils/Validation';

let grpc = require('grpc');
let protos = require('../protocol');

let mango = require('mango');
const itemCollectionName = "item";

function validateInput(req) {
  return new Promise((resolve, reject) => {
    if (!req) {
      reject("an pricing request is required");
    } else if (req.body && req.body.id && !Validation.isString(req.body.id)) {
      reject("id MUST BE a string")
    } else if (req.body && req.body.num && !Validation.isInteger(req.body.num)) {
      reject("num MUST BE a positive integer")
    } else if (req.body.num <= 0) {
      reject("num MUST BE a positive integer")
    } else {
      resolve();
    }
  })
}

exports = module.exports = function(req, res) {
  console.log('handle pricing request: ' + JSON.stringify(req.body));
  let tmp = req.body && req.body.num && (!Validation.isInteger(req.body.num) || req.body.num <= 0)
  let tmp2 = req.body.num <= 0
  console.log("tmp: " + tmp)
  console.log("tmp2: " + tmp2)
  // check input
  validateInput(req)
  .then(() => {
    let header = new protos.common.ResponseHeader();

    // construct query
    let query = mango.collections[itemCollectionName].model.findById(req.body.id);

    // do query
    query.exec((err, data) => {
      if (err) {
        header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
        header.setResultDescription(JSON.stringify(err));
        res.json(header.toRaw());
      } else {
        let result = {};
        if(data) {
        	console.log("pricing data: " + JSON.stringify(data));
          let pay_amt = req.body.num * data.get('real_price');
          let real_pay_amt = pay_amt;
          console.log(data.get('real_price'))
          console.log(req.body.num)
          if (!pay_amt || !real_pay_amt) {
	          header.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
	          header.setResultDescription("内部错误，批价有问题");
          } else {
	          header.setResult(protos.common.ResultCode.SUCCESS);
	          result = {sku_id: req.body.id,
                      num: req.body.num,
                      price: data.price,
    	          			real_price: data.real_price,
    	          			discount: 0.0,
    	          			pay_amt: pay_amt,
    	          			real_pay_amt: real_pay_amt}
      		}
        } else {
          header.setResult(protos.common.ResultCode.INVALID_REQUEST_ARGUMENT);
          header.setResultDescription("cannot find products by given query")
        }
        res.json(Object.assign({}, header.toRaw(), result))
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