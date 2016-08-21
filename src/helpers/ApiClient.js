import superagent from 'superagent';
// import unirest from 'unirest';
import config from '../config';
import ErrorMessage from '../error';
// let protocol = require('protocol');
const protocol = require('../../lib/protocol/protocol_pb');

const methods = ['get', 'post', 'put', 'patch', 'del'];

function formatUrl(path) {
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  if (__SERVER__) {
    // Prepend host and port of the API server to the path.
    console.log("api client sever");
    return 'http://' + config.host + ':' + config.port + adjustedPath;
  }
  // Prepend `/api` to relative URL, to proxy to API server.
  // return '/api' + adjustedPath;
  return adjustedPath;
}

/*
 * This silly underscore is here to avoid a mysterious "ReferenceError: ApiClient is not defined" error.
 * See Issue #14. https://github.com/erikras/react-redux-universal-hot-example/issues/14
 *
 * Remove it at your own risk.
 */
class CApiClient {
  constructor(req, res) { // express req and res
    methods.forEach((method) =>
      this[method] = (path, { params, data} = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));
        console.log('ApiClient path: ' + formatUrl(path));
        if (!__SERVER__) {
          console.log('request cookie: ' + document.cookie);
        }
        // request.headers({'Accept': 'application/json', 'Content-Type': 'application/json'})
        // request.set('Access-Control-Allow-Credentials', 'true');
        // const request = superagent.agent()[method](formatUrl(path));

        if (params) {
          request.query(params);
        }

        if (__SERVER__ && req && req.get('cookie')) {
          // console.log(req);
          // console.log("=========cookie========")
          // console.log(req.get('cookie'))
          request.set('cookie', req.get('cookie'));
        }
        // else if (document && document.cookie) {
        //   request.set('cookie', document.cookie);
        // }

        if (data) {
          request.send(data);
        }

        // request.end((err, { body } = {}) => err ? reject(body || err) : resolve(body));
        // unirest
        // request.end(response => {
        //   console.log(response.body);
        //   let body = response.body;
        //   console.log(typeof(body));
        //   if (body && body.errorCode) {
        //     console.log('reject');
        //     reject(body);
        //   }else {
        //     resolve(body);
        //   }
        // })
        // superagent
        request.end((err, response) => {
          // console.log("__SERVER__ set-cookie: " + JSON.stringify(response));
          if (__SERVER__ && response && response.get('set-cookie') && res) {
            console.log("__SERVER__ set-cookie: " + response.get('set-cookie'));
            res.set('set-cookie', response.get('set-cookie'));
          }
          if (err) {
            console.log("ApiClient recieve error: " + err);
            let errorMsg = new ErrorMessage(protocol.ResultCode.INTERNAL_SERVER_ERROR, "INTERNAL_SERVER_ERROR");
            reject(errorMsg);
          }
          let body = response.body;
          if (body && body.errorCode) {
            reject(body);
          }else {
            console.log("request end");
            resolve(body);
          }
        })
      }));
  }
}

const ApiClient = CApiClient;

export default ApiClient;
