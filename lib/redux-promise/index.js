function createReduxPromiseMiddleware(extraArgument) {
  return ({dispatch, getState}) => {
    // console.log("createReduxPromiseMiddleware");
    return next => action => {
      if (typeof action === 'function') {
        // console.log("action is function");
        // console.log("action: " + action);
        return action(dispatch, getState, extraArgument);
      }

      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
      // console.log("promise: " + promise);
      // console.log("types: " + JSON.stringify(types));
      if (!promise) {
        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({...rest, type: REQUEST});

      const actionPromise = promise(extraArgument);
      actionPromise.then(
        (result) => {
          console.log('ReduxPromiseMiddleware result:', result);
          if (typeof(result) === 'object') {
            next({...rest, ...result, type: SUCCESS});
          }else {
            next({...rest, result, type: SUCCESS});
          }
        },
        (error) => {
          console.log('ReduxPromiseMiddleware ERROR:', error);
          if (typeof(error) === 'object') {
            next({...rest, ...error, type: FAILURE});
          }else {
            next({...rest, error, type: FAILURE});
          }
        }
      ).catch((error)=> {
        console.error('ReduxPromiseMiddleware catch ERROR:', error);
        next({...rest, error, type: FAILURE});
      });

      return actionPromise;
    };
  };
}

const reduxPromise = createReduxPromiseMiddleware();
reduxPromise.withExtraArgument = createReduxPromiseMiddleware;

export default reduxPromise;
