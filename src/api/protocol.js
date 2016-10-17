
var path = require('path');
let grpc = require('grpc');
let protoDescriptor = grpc.load(path.resolve('lib/echo-common/protobuf/protocol.proto'));
let protos = protoDescriptor.com.echo.protocol;

exports = module.exports = protos