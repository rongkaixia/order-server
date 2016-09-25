import superagent from 'superagent';
// import unirest from 'unirest';

const methods = ['get', 'post', 'put', 'patch', 'del'];

class CApiClient {
  formatUrl(path) {
    let self = this;
    const adjustedPath = path[0] !== '/' ? '/' + path : path;
    if (__SERVER__) {
      // Prepend host and port of the API server to the path.
      console.log("order api client sever");
      return 'http://' + self.host + ':' + self.port + adjustedPath;
    }
    // Prepend `/api` to relative URL, to proxy to API server.
    // return '/api' + adjustedPath;
    return adjustedPath;
  }

  constructor(req, res, host = "localhost", port = 4000) { // express req and res
    let self = this;
    self.host = host;
    self.port = port;
    methods.forEach((method) =>
      this[method] = (path, { params, data} = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](this.formatUrl(path));
        console.log('ApiClient path: ' + this.formatUrl(path));
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
          request.set('cookie', req.get('cookie'));
        }

        if (data) {
          request.send(data);
        }

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
            // let errorMsg = new protos.common.ResponseHeader();
            // errorMsg.setResult(protos.common.ResultCode.INTERNAL_SERVER_ERROR);
            // errorMsg.setResultDescription("INTERNAL_SERVER_ERROR");
            let errorMsg = {result: 'INTERNAL_SERVER_ERROR', result_description: 'INTERNAL_SERVER_ERROR'};
            reject(errorMsg);
          }
          let body = response.body;
          console.log("ApiClient: response.body: " + JSON.stringify(body));
          if (body && body.result !== "SUCCESS") {
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
