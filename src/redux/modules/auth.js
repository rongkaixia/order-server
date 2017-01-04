import ApiPath from 'api/ApiPath';

const LOAD = 'redux-example/auth/LOAD';
const LOAD_SUCCESS = 'redux-example/auth/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/auth/LOAD_FAIL';
const LOGIN = 'redux-example/auth/LOGIN';
const LOGIN_SUCCESS = 'redux-example/auth/LOGIN_SUCCESS';
const LOGIN_FAIL = 'redux-example/auth/LOGIN_FAIL';
const LOGOUT = 'redux-example/auth/LOGOUT';
const LOGOUT_SUCCESS = 'redux-example/auth/LOGOUT_SUCCESS';
const LOGOUT_FAIL = 'redux-example/auth/LOGOUT_FAIL';

const SIGNUP = 'redux-example/auth/SIGNUP';
const SIGNUP_SUCCESS = 'redux-example/auth/SIGNUP_SUCCESS';
const SIGNUP_FAIL = 'redux-example/auth/SIGNUP_FAIL';

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
        loaded: true,
        loginSuccess: action.is_login
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        authError: action.result,
        authErrorDesc: action.result_description
      };
    case LOGIN:
      return {
        ...state,
        loggingIn: true
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        loggingIn: false,
        isLogined: true,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        loginError: action.result,
        loginErrorDesc: action.result_description
      };
    case LOGOUT:
      return {
        ...state,
        loggingOut: true
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        loggingOut: false,
        logoutSuccess: true,
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.result,
        logoutErrorDesc: action.result_description
      };
    case SIGNUP:
      return {
        ...state,
        signingUp: true
      };
    case SIGNUP_SUCCESS:
      return {
        ...state,
        signingUp: false,
        signupSuccess: true,
      };
    case SIGNUP_FAIL:
      return {
        ...state,
        signingUp: false,
        signupError: action.result,
        signupErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function load() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.AUTH)
  };
}

/**
 * login action，登录
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

/**
 * logout action，登出
 *
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function logout(authKey) {
  let postData = {_csrf: authKey};
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.LOGOUT, {
      data: postData
    })
  };
}

/**
 * signup action，登录
 *
 * @param   {object}  signupReq
 * signupReq format
 * {
 * username: string, username
 * password: string, password
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function signup(signupReq, authKey) {
  let postData = {...signupReq, ...{_csrf: authKey}};
  return {
    types: [SIGNUP, SIGNUP_SUCCESS, SIGNUP_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.SIGNUP, {
      data: postData
    })
  };
}

/* eslint-disable */ 
export {LOAD_SUCCESS, LOGIN_SUCCESS, SIGNUP_SUCCESS, LOGOUT_SUCCESS};
