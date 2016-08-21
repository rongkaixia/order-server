import {LOAD_SUCCESS as LOAD_AUTH_SUCCESS,
        LOGIN_SUCCESS,
        LOGOUT_SUCCESS,
        SIGNUP_SUCCESS} from './auth';
import API from 'echo-common/api/api'

const LOAD_INFO = 'redux-example/userInfo/LOAD_INFO';
const LOAD_INFO_SUCCESS = 'redux-example/userInfo/LOAD_INFO_SUCCESS';
const LOAD_INFO_FAIL = 'redux-example/userInfo/LOAD_INF_FAIL';

const UPDATE_INFO = 'redux-example/userInfo/UPDATE_INFO';
const UPDATE_INFO_SUCCESS = 'redux-example/userInfo/UPDATE_INFO_SUCCESS';
const UPDATE_INFO_FAIL = 'redux-example/userInfo/UPDATE_INFO_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  let newInfo = {};
  switch (action.type) {
    case LOAD_AUTH_SUCCESS:
      return {
        ...state,
        user: action.data.userId ? action.data : null
      }
    case LOGIN_SUCCESS:
      return {
        ...state,
        user: action.data.userId ? action.data : null
      }
    case SIGNUP_SUCCESS:
      return {
        ...state,
        user: action.data.userId ? action.data : null
      }
    case LOGOUT_SUCCESS:
      return {
        ...state,
        user: null
      }
    case LOAD_INFO:
      return {
        ...state,
        loading: true
      };
    case LOAD_INFO_SUCCESS:
      newInfo = {...(state.user), ...(action.data)};
      return {
        ...state,
        loading: false,
        loaded: true,
        user: newInfo,
        loadInfoError: false,
        loadInfoErrorDesc: action.errorDescription
      };
    case LOAD_INFO_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadInfoError: action.errorCode,
        loadInfoErrorDesc: action.errorDescription
      };
    case UPDATE_INFO:
      return {
        ...state,
        updating: true
      };
    case UPDATE_INFO_SUCCESS:
      newInfo = {...(state.user), ...(action.data)};
      return {
        ...state,
        updating: false,
        updated: true,
        user: newInfo,
        updateInfoError: false,
        updateInfoErrorDesc: action.errorDescription
      };
    case UPDATE_INFO_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        updateInfoError: action.errorCode,
        updateInfoErrorDesc: action.errorDescription
      };

    default:
      return state;
  }
}

export function loadInfo() {
  return {
    types: [LOAD_INFO, LOAD_INFO_SUCCESS, LOAD_INFO_FAIL],
    promise: (client) => client.get(API.USER_INFO_API_PATH)
  };
}

export function updateUsername(newUsername, authKey) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.post(API.USER_INFO_API_PATH + '/' + API.USER_INFO_API_USERNAME_SUFFIX, {
      data: {
        newUsername: newUsername,
        _csrf: authKey
      }
    })
  };
}

export function updateEmail(newEmail, authKey) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.post(API.USER_INFO_API_PATH + '/' + API.USER_INFO_API_EMAIL_SUFFIX, {
      data: {
        newEmail: newEmail,
        _csrf: authKey
      }
    })
  };
}

export function updatePhonenum(newPhonenum, authKey) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.post(API.USER_INFO_API_PATH + '/' + API.USER_INFO_API_PHONENYM_SUFFIX, {
      data: {
        newPhonenum: newPhonenum,
        _csrf: authKey
      }
    })
  };
}

export function updatePassword(oldPassword, newPassword, authKey) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.post(API.USER_INFO_API_PATH + '/' + API.USER_INFO_API_PASSWORD_SUFFIX, {
      data: {
        oldPassword: oldPassword,
        newPassword: newPassword,
        _csrf: authKey
      }
    })
  };
}

export function addUserAddress({recipientsName, recipientsPhone, recipientsAddress, authKey}) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.post(API.USER_ADDRESS_API_PATH, {
      // authenticity_token
      data: {
        recipientsName: recipientsName,
        recipientsPhone: recipientsPhone,
        recipientsAddress: recipientsAddress,
        _csrf: authKey
      }
    })
  };
}

export function updateUserAddress({id, recipientsName, recipientsPhone, recipientsAddress, authKey}) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.put(API.USER_ADDRESS_API_PATH, {
      // authenticity_token
      data: {
        id: id,
        recipientsName: recipientsName,
        recipientsPhone: recipientsPhone,
        recipientsAddress: recipientsAddress,
        _csrf: authKey
      }
    })
  };
}

export function deleteUserAddress({id, authKey}) {
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: (client) => client.del(API.USER_ADDRESS_API_PATH, {
      // authenticity_token
      data: {
        id: id,
        _csrf: authKey
      }
    })
  };
}
