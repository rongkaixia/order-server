import { createStore as _createStore, applyMiddleware, compose } from 'redux';
import reduxPromise from 'redux-promise';
// import createMiddleware from './middleware/clientMiddleware';
import { syncHistory } from 'react-router-redux';

export default function createStore(history, data, extraArgs) {
  // Sync dispatched route actions to the history
  const reduxRouterMiddleware = syncHistory(history);

  console.log("extraArgs: " + JSON.stringify(extraArgs));
  const middleware = [reduxRouterMiddleware, reduxPromise.withExtraArgument({...extraArgs})];

  let finalCreateStore;
  if (__DEVELOPMENT__ && __CLIENT__ && __DEVTOOLS__) {
    const { persistState } = require('redux-devtools');
    const DevTools = require('../containers/DevTools/DevTools');
    finalCreateStore = compose(
      applyMiddleware(...middleware),
      window.devToolsExtension ? window.devToolsExtension() : DevTools.instrument(),
      persistState(window.location.href.match(/[?&]debug_session=([^&]+)\b/))
    )(_createStore);
  } else {
    finalCreateStore = applyMiddleware(...middleware)(_createStore);
  }

  const reducer = require('./modules/reducer');
  const store = finalCreateStore(reducer, data);

  reduxRouterMiddleware.listenForReplays(store);

  if (__DEVELOPMENT__ && module.hot) {
    module.hot.accept('./modules/reducer', () => {
      store.replaceReducer(require('./modules/reducer'));
    });
  }

  return store;
}
