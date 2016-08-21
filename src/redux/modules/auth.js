import API from 'echo-common/api/api'

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
        loaded: true
        // user: action.data.userId ? action.data : null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        error: action.errorDescription
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
        loginError: false,
        loginErrorDesc: action.errorDescription
      };
    case LOGIN_FAIL:
      return {
        ...state,
        loggingIn: false,
        loginError: action.errorCode,
        loginErrorDesc: action.errorDescription
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
        logoutError: false,
        logoutErrorDesc: action.errorDescription
      };
    case LOGOUT_FAIL:
      return {
        ...state,
        loggingOut: false,
        logoutError: action.errorCode,
        logoutErrorDesc: action.errorDescription
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
        signupError: false,
        signupErrorDesc: action.errorDescription
      };
    case SIGNUP_FAIL:
      return {
        ...state,
        signingUp: false,
        signupError: action.errorCode,
        signupErrorDesc: action.errorDescription
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
    promise: (client) => client.get(API.VALIDATE_TOKEN_API_PATH)
  };
}

export function login(username, password, authKey) {
  return {
    types: [LOGIN, LOGIN_SUCCESS, LOGIN_FAIL],
    promise: (client) => client.post(API.LOGIN_API_PATH, {
      data: {
        username: username,
        password: password,
        _csrf: authKey
      }
    })
  };
}

export function logout(authKey) {
  return {
    types: [LOGOUT, LOGOUT_SUCCESS, LOGOUT_FAIL],
    promise: (client) => client.post(API.LOGOUT_API_PATH, {
      data: {
        _csrf: authKey
      }
    })
  };
}

export function signup(username, password, authKey) {
  return {
    types: [SIGNUP, SIGNUP_SUCCESS, SIGNUP_FAIL],
    promise: (client) => client.post(API.SIGNUP_API_PATH, {
      // authenticity_token
      data: {
        username: username,
        password: password,
        _csrf: authKey
      }
    })
  };
}

/* eslint-disable */ 
export {LOAD_SUCCESS, LOGIN_SUCCESS, SIGNUP_SUCCESS, LOGOUT_SUCCESS};
