/**
 * THIS IS THE ENTRY POINT FOR THE CLIENT, JUST LIKE server.js IS THE ENTRY POINT FOR THE SERVER.
 */
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import createStore from './redux/create';
import ApiClient from './helpers/ApiClient';
import io from 'socket.io-client';
import {Provider} from 'react-redux';
import { Router, browserHistory } from 'react-router';
import { ReduxAsyncConnect } from 'redux-async-connect';
import useScroll from 'scroll-behavior/lib/useStandardScroll';

import getRoutes from './routes';

const client = new ApiClient();
const history = useScroll(() => browserHistory)();
const dest = document.getElementById('content');
const store = createStore(history, client, window.__data);

// function initSocket() {
//   const socket = io('', {path: '/ws'});
//   socket.on('news', (data) => {
//     console.log(data);
//     socket.emit('my other event', { my: 'data from client' });
//   });
//   socket.on('msg', (data) => {
//     console.log(data);
//   });

//   return socket;
// }

// global.socket = initSocket();

/**
 * 这里一定要用ReduxAsyncConnect，因为router的时候都在客服端，如果没用的话，子部件的asyncConnect将不起作用。
 * If you hit refresh on your browser, the data loading will take place on the server
 * before the page is returned. If you navigated here from another page,
 * the data was fetched from the client after the route transition.
 * This uses the decorator method @asyncConnect with the deferred: true flag.
 * To block a route transition until some data is loaded, remove the deffered: true flag.
 * To always render before loading data, even on the server, use componentDidMount.
 * 注意与server side的区别，server side的rendering不应该有filter，必须全部load完才能发给客服端。
 */
const component = (
  <Router render={(props) =>
        <ReduxAsyncConnect {...props} helpers={{client}} filter={item => !item.deferred} />
      } history={history}>
    {getRoutes(store)}
  </Router>
);

ReactDOM.render(
  <Provider store={store} key="provider">
    {component}
  </Provider>,
  dest
);

if (process.env.NODE_ENV !== 'production') {
  window.React = React; // enable debugger

  if (!dest || !dest.firstChild || !dest.firstChild.attributes || !dest.firstChild.attributes['data-react-checksum']) {
    console.error('Server-side React render was discarded. Make sure that your initial render does not contain any client-side code.');
  }
}

if (__DEVTOOLS__ && !window.devToolsExtension) {
  const DevTools = require('./containers/DevTools/DevTools');
  ReactDOM.render(
    <Provider store={store} key="provider">
      <div>
        {component}
        <DevTools />
      </div>
    </Provider>,
    dest
  );
}
