import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import config from './config';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import GoldClient from 'order-sdk/client/ApiClient';
import Html from './helpers/Html';
import PrettyError from 'pretty-error';
import http from 'http';

import { RouterContext, match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-async-connect';
import createHistory from 'react-router/lib/createMemoryHistory';
import {Provider} from 'react-redux';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import getRoutes from './routes';
import CaptainMiddleware from './middleware/CaptainMiddleware';
import ProductMiddleware from './middleware/ProductMiddleware';
import ApiMiddleware from './middleware/ApiMiddleware';
import {generateCsrfToken} from 'utils/AuthenticityToken';
import csurf from 'csurf';
import {load as loadCsrfToken} from './redux/modules/csrf';

const pretty = new PrettyError();
const csrfProtection = csurf({ cookie: true })
const app = new Express();
const server = new http.Server(app);

app.use(CookieParser())
app.use(BodyParser.json()); // for parsing application/json
app.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(csrfProtection)
app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));

app.use(Express.static(path.join(__dirname, '..', 'static')));

// captain router, redirect request to captain server
app.use(CaptainMiddleware);
app.use(ProductMiddleware);
app.use(ApiMiddleware);

app.use((req, res) => {
  console.log("*************In normal app use((req,res)=>{...})***************")
  console.log("baseurl: " + req.baseUrl)
  console.log("path: " + req.path)
  console.log("query: " + req.query)
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }
  const client = new ApiClient(req, res);
  const goldClient = new GoldClient(req,res);
  const history = createHistory(req.originalUrl);
  const initData = undefined;

  const store = createStore(history, client, initData, {goldClient: goldClient});

  // load csrf token into store
  store.dispatch(loadCsrfToken(req.csrfToken()));

  function hydrateOnClient() {
    res.send('<!doctype html>\n' +
      ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} store={store}/>));
  }

  if (__DISABLE_SSR__) {
    hydrateOnClient();
    return;
  }

  match({ history, routes: getRoutes(store), location: req.originalUrl }, (error, redirectLocation, renderProps) => {
    if (redirectLocation) {
        console.info('redirect')
      res.redirect(redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      console.error('ROUTER ERROR:', pretty.render(error));
      res.status(500);
      hydrateOnClient();
    } else if (renderProps) {
      loadOnServer({...renderProps, store, helpers: {client}}).then(() => {
          const component = (
          <Provider store={store} key="provider">
            <ReduxAsyncConnect {...renderProps} />
          </Provider>
        );

        res.status(200);

        global.navigator = {userAgent: req.headers['user-agent']};

        res.send('<!doctype html>\n' +
          ReactDOM.renderToString(<Html assets={webpackIsomorphicTools.assets()} component={component} store={store}/>));
      });
    } else {
      res.status(404).send('Not found');
    }
  });
});

if (config.port) {
  server.listen(config.port, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', config.host, config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
