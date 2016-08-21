var superagent =  require('superagent');
var protocol = require('../lib/protocol/protocol_pb')
// let protocol = require('protocol');
var textEncoding = require('text-encoding')

function binaryParser(res, callback) {
	console.log("in binaryParser");
    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
    	console.log("======binaryParser======");
    	console.log(res.data);
        callback(null, new Buffer(res.data, 'binary'));
    });
}

var msg = new protocol.Message();
var req = new protocol.Request();
var signupReq = new protocol.Request.SignupRequest();
signupReq.setPhonenum("1111123");
signupReq.setPassword("1234124");
req.setSignupRequest(signupReq);
msg.setRequest(req);

var bytes = msg.serializeBinary();
var buf = Buffer(bytes.length);
for (var i=0, strLen=bytes.length; i<strLen; i++) {
  buf[i] = bytes[i];
}

// var request = superagent["post"]("http://localhost:19876/signup");
// var response = 1;
// request.send(buf).end((res) => {
// 	console.log("res:" + res.raw_body)
// 	// var buffer = new Buffer(res.raw_body);
// 	// var buffer = Buffer(res.raw_body.length);
// 	// for (var i=0, strLen=res.raw_body.length; i<strLen; i++) {
// 		// console.log(res.raw_body[i]);
// 	  // buffer[i] = res.raw_body.charAt(i);
// 	// }

// 	// var data = new Uint8Array(buffer);
// 	var data = new textEncoding.TextEncoder('binary').encode(res.raw_body);
// 	console.log(data);
// 	var r = protocol.Message.deserializeBinary(data);
// 	console.log(JSON.stringify(r.toObject()));
// })

var request = superagent["post"]("http://localhost:19876/signup");
var response = 1;
// request.parse(binaryParser).write(buf);
request.write(buf);

request.end((err,res) => {
	response = res;
	console.log("res.buffer: " + res.buffer);
	console.log("res.data: " + res.res.data);
	console.log("res.body: " + JSON.stringify(res.res.body));

    res.setEncoding('binary');
    res.data = '';
    res.on('data', function (chunk) {
        res.data += chunk;
    });
    res.on('end', function () {
    	console.log("======res.on('end')======");
    	var buffer = new Buffer(res.data, 'binary')
    	console.log(buffer);
    	var uint8Data = new Uint8Array(buffer);
    	console.log("uint8Data: " + uint8Data);
		var r = protocol.Message.deserializeBinary(uint8Data);
		console.log(JSON.stringify(r.toObject()));
    });

})
