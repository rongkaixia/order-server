import Express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import favicon from 'serve-favicon';
import compression from 'compression';
import httpProxy from 'http-proxy';
import path from 'path';
import PrettyError from 'pretty-error';
import http from 'http';
import {Provider} from 'react-redux';
import BodyParser from 'body-parser';
import CookieParser from 'cookie-parser';
import { RouterContext, match } from 'react-router';
import { ReduxAsyncConnect, loadOnServer } from 'redux-async-connect';
import createHistory from 'react-router/lib/createMemoryHistory';

import createStore from './redux/create';
import ApiClient from 'api/ApiClient';
import Html from './helpers/Html';
import getRoutes from './routes';
import ProductMiddleware from './middleware/ProductMiddleware';
import csurf from 'csrf-protection';
import {load as loadCsrfToken} from './redux/modules/csrf';
import ApiPath from 'api/ApiPath';
import {checkoutSync} from './redux/modules/checkout';
import Config from 'config';
// api
import * as api from 'api';

const pretty = new PrettyError();
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

// mongo options
const mongoOptions = {url: Config.mongo.url};

// cookie options
const cookieOptions = {path: '/', httpOnly: true, secure: false, 
                       maxAge: null, domain: Config.mainDomain};
// app and server
const app = new Express();
const server = new http.Server(app);

// express middleware
app.use(CookieParser())
app.use(BodyParser.json()); // for parsing application/json
app.use(BodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(compression());
app.use(favicon(path.join(__dirname, '..', 'static', 'favicon.ico')));
app.use(Express.static(path.join(__dirname, '..', 'static')));
app.use(session({
    secret: 'foo',
    cookie: cookieOptions,
    saveUninitialized: false, // don't create session until something stored 
    resave: false, //don't save session if unmodified
    store: new MongoStore(mongoOptions)
}));

// csrf protection
const csrfProtection = csurf({cookie: true, ignoredPath: ['/buy/checkout']})
app.use(csrfProtection)

// captain router, redirect request to captain server
app.use(ProductMiddleware);

// api
app.use(ApiPath.ORDER, api.Order);
app.use(ApiPath.QUERY_ORDER, api.QueryOrder);
app.use(ApiPath.NOTIFY, api.Notify);

app.use(ApiPath.AUTH, api.Auth);
app.use(ApiPath.LOGIN, api.Login);
app.use(ApiPath.LOGOUT, api.Logout);
app.use(ApiPath.SIGNUP, api.Signup);

app.get(ApiPath.USER_INFO, api.QueryUserInfo);
app.post(ApiPath.USER_INFO + '/:field', api.UpdateUserInfo);

app.post(ApiPath.USER_ADDRESS, api.AddUserAddress);
app.delete(ApiPath.USER_ADDRESS, api.DeleteUserAddress);
app.put(ApiPath.USER_ADDRESS, api.UpdateUserAddress);

app.use((req, res) => {
  console.log("*************In normal app use((req,res)=>{...})***************")
  console.log("req.originalUrl: " + req.originalUrl)
  console.log("req.path: " + req.path)
  console.log("req.method: " + req.method)
  if (__DEVELOPMENT__) {
    // Do not cache webpack stats: the script file would change since
    // hot module replacement is enabled in the development env
    webpackIsomorphicTools.refresh();
  }

  const apiClient = new ApiClient(req,res);
  const history = createHistory(req.originalUrl);
  const initData = undefined;

  const store = createStore(history, initData, {apiClient: apiClient});

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
      // load csrf token into store
      store.dispatch(loadCsrfToken(req.csrfToken()));

      if (req.path === '/buy/checkout' && req.method === 'POST' && req.body) {
        store.dispatch(checkoutSync(req.body.productId, req.body.num));
      }

      loadOnServer({...renderProps, store, helpers: {apiClient}}).then(() => {
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

if (Config.port) {
  server.listen(Config.port, (err) => {
    if (err) {
      console.error(err);
    }
    console.info('==> 💻  Open http://%s:%s in a browser to view the app.', Config.host, Config.port);
  });
} else {
  console.error('==>     ERROR: No PORT environment variable has been specified');
}
