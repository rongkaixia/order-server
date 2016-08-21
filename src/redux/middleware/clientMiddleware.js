export default function clientMiddleware(client) {
  return ({dispatch, getState}) => {
    return next => action => {
      if (typeof action === 'function') {
        return action(dispatch, getState);
      }

      const { promise, types, ...rest } = action; // eslint-disable-line no-redeclare
      if (!promise) {
        return next(action);
      }

      const [REQUEST, SUCCESS, FAILURE] = types;
      next({...rest, type: REQUEST});

      const actionPromise = promise(client);
      actionPromise.then(
        (result) => {
          if (typeof(result) === 'object') {
            next({...rest, ...result, type: SUCCESS});
          }else {
            next({...rest, result, type: SUCCESS});
          }
        },
        (error) => {
          if (typeof(error) === 'object') {
            next({...rest, ...error, type: FAILURE});
          }else {
            next({...rest, error, type: FAILURE});
          }
        }
      ).catch((error)=> {
        console.error('MIDDLEWARE ERROR:', error);
        next({...rest, error, type: FAILURE});
      });

      return actionPromise;
    };
  };
}
