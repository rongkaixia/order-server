import ApiPath from 'api/ApiPath';

const LOAD = 'redux-example/cart/LOAD';
const LOAD_SUCCESS = 'redux-example/cart/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/cart/LOAD_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadError: action.result,
        loadErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.cart && globalState.cart.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.AUTH)
  };
}

/**
 * load cart action，获取购物车内容
 *
 * @param   {object}  loginReq
 * loginReq format
 * {
 * username: string, username
 * password: string, password
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function login(loginReq, authKey) {
  let postData = {...loginReq, ...{_csrf: authKey}};
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.LOGIN, {
      data: postData
    })
  };
}

/* eslint-disable */ 
export {LOAD_SUCCESS, LOGIN_SUCCESS, SIGNUP_SUCCESS, LOGOUT_SUCCESS};
