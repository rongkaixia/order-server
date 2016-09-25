import {LOAD_SUCCESS as LOAD_AUTH_SUCCESS,
        LOGIN_SUCCESS,
        LOGOUT_SUCCESS,
        SIGNUP_SUCCESS} from './auth';
import ApiPath from 'api/ApiPath';

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
      newInfo = action.user_id ? {user_id: action.user_id, username: action.username} : null;
      return {
        ...state,
        user: newInfo
      }
    case LOGIN_SUCCESS:
      newInfo = action.user_id ? {user_id: action.user_id, username: action.username} : null;
      return {
        ...state,
        user: newInfo
      }
    case SIGNUP_SUCCESS:
      newInfo = action.user_id ? {user_id: action.user_id, username: action.username} : null;
      return {
        ...state,
        user: newInfo
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
      newInfo = {...(state.user), ...(action.user_info)};
      return {
        ...state,
        loading: false,
        loaded: true,
        user: newInfo,
        loadInfoSuccess: true
      };
    case LOAD_INFO_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadInfoError: action.result,
        loadInfoErrorDesc: action.result_description
      };
    case UPDATE_INFO:
      return {
        ...state,
        updating: true
      };
    case UPDATE_INFO_SUCCESS:
      newInfo = {...(state.user), ...(action.user_info)};
      return {
        ...state,
        updating: false,
        updated: true,
        user: newInfo,
        updateInfoSuccess: true
      };
    case UPDATE_INFO_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        updateInfoError: action.result,
        updateInfoErrorDesc: action.result_description
      };

    default:
      return state;
  }
}

export function loadInfo() {
  return {
    types: [LOAD_INFO, LOAD_INFO_SUCCESS, LOAD_INFO_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.USER_INFO)
  };
}

/**
 * update username action
 *
 * @param   {object}  req
 * req format
 * {
 * value: string, new username
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updateUsername(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_INFO + '/username', {
      data: postData
    })
  };
}

/**
 * update email action
 *
 * @param   {object}  req
 * req format
 * {
 * value: string, new email
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updateEmail(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_INFO + '/email', {
      data: postData
    })
  };
}

/**
 * update phonenum action
 *
 * @param   {object}  req
 * req format
 * {
 * value: string, new phonenum
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updatePhonenum(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_INFO + '/phonenum', {
      data: postData
    })
  };
}

/**
 * update password action
 *
 * @param   {object}  req
 * req format
 * {
 * value: string, new password
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updatePassword(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_INFO + '/password', {
      data: postData
    })
  };
}

/**
 * add user address action
 *
 * @param   {object}  req
 * req format
 * {
 * recipientsName: string, recipientsName
 * recipientsPhone: string, recipientsPhone
 * recipientsAddress: string, recipientsAddress
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function addUserAddress(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_ADDRESS, {
      data: postData
    })
  };
}

/**
 * update user address action
 *
 * @param   {object}  req
 * req format
 * {
 * addressId: string, addressId
 * recipientsName: string, recipientsName
 * recipientsPhone: string, recipientsPhone
 * recipientsAddress: string, recipientsAddress
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updateUserAddress(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.put(ApiPath.USER_ADDRESS, {
      data: postData
    })
  };
}

/**
 * delete user address action
 *
 * @param   {object}  req
 * req format
 * {
 * addressId: string, addressId
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function deleteUserAddress(req, authKey) {
  let postData = {...req, ...{_csrf: authKey}};
  return {
    types: [UPDATE_INFO, UPDATE_INFO_SUCCESS, UPDATE_INFO_FAIL],
    promise: ({apiClient}) => apiClient.del(ApiPath.USER_ADDRESS, {
      data: postData
    })
  };
}
