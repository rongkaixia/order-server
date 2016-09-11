import superagent from 'superagent';
// import unirest from 'unirest';
const protocol = require('protocol/protocol_pb')

const methods = ['get', 'post', 'put', 'patch', 'del'];


export default class CaptainClient {
  constructor(captainHost = process.env.CAPTAIN_HOST,
              captainPort = process.env.CAPTAIN_PORT, 
              apiVersion = 'v1.0'){
    this.host = 'http://' + captainHost + ':' + captainPort;

    this.apiPath = '/api/' + apiVersion;

    methods.forEach((method) =>
      this[method] = (data = {}) => new Promise((resolve, reject) => {
        let self = this;
        let request = {};
        let msg = {};
        try{
          if (process.env.NODE_ENV !== 'production')
            console.log("recieve request: data = " + JSON.stringify(data.toObject()));
          request = superagent[method](self.host + self.apiPath);
          msg = self.serialize(data);
          if (process.env.NODE_ENV !== 'production') {
            console.log("serialized msg: " + JSON.stringify(msg));
          }
        }catch(err){
          reject(err);
        }
        console.log("send request to " + self.host + self.apiPath)
        request.write(msg);
        request.end((err,res) => {
          if (err){
            console.log("CaptainClient error: " + err);
            reject(err);
            return;
          }
          res.setEncoding('binary');
          res.data = '';
          res.on('data', function (chunk) {
              res.data += chunk;
          });
          res.on('end', function () {
            let response = {};
            try{
              response = self.deserialize(res.data)
            }catch(err){
              reject(err);
            }
            if (process.env.NODE_ENV !== 'production')
              console.log("CaptainClient: recieve response from Captain Server: " + JSON.stringify(response.toObject()));
            resolve(response);
          })
        })
      })//post
    )
  }

  serialize(req){
    let self = this;
    let message = new protocol.Message();
    message.setRequest(req);
    if (process.env.NODE_ENV !== 'production')
      console.log("packed message: " + JSON.stringify(message.toObject()));
    let bytes = message.serializeBinary();
    let buffer = Buffer(bytes.length);
    for (let i=0, strLen=bytes.length; i<strLen; i++) {
      buffer[i] = bytes[i];
    }
    return buffer;
  }

  deserialize(stringMessage){
    if (process.env.NODE_ENV !== 'production')
      console.log("deserializing msg: " + stringMessage);
    let buffer = new Buffer(stringMessage, 'binary');
    let uint8Data = new Uint8Array(buffer);
    if (process.env.NODE_ENV !== 'production')
      console.log("deserialized uint8Data: " + uint8Data);
    let msg = protocol.Message.deserializeBinary(uint8Data);
    return msg.getResponse();
  }
}
