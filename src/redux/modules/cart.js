import ApiPath from 'api/ApiPath';

const LOAD = 'redux-example/cart/LOAD';
const LOAD_SUCCESS = 'redux-example/cart/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/cart/LOAD_FAIL';

const UPDATE = 'redux-example/cart/UPDATE';
const UPDATE_SUCCESS = 'redux-example/cart/UPDATE_SUCCESS';
const UPDATE_FAIL = 'redux-example/cart/UPDATE_FAIL';

const DELETE = 'redux-example/cart/DELETE';
const DELETE_SUCCESS = 'redux-example/cart/DELETE_SUCCESS';
const DELETE_FAIL = 'redux-example/cart/DELETE_FAIL';

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
        data: action.data,
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadError: action.result,
        loadErrorDesc: action.result_description
      };
    case UPDATE:
      return {
        ...state,
        updating: true
      };
    case UPDATE_SUCCESS:
      return {
        ...state,
        updating: false,
        updated: true
      };
    case UPDATE_FAIL:
      return {
        ...state,
        updating: false,
        updated: false,
        updateError: action.result,
        updateErrorDesc: action.result_description
      };
    case DELETE:
      return {
        ...state,
        deleting: true
      };
    case DELETE_SUCCESS:
      return {
        ...state,
        deleting: false,
        deleted: true
      };
    case DELETE_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false,
        deleteError: action.result,
        deleteErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.cart && globalState.cart.loaded;
}

/**
 * load cart action，获取购物车内容
 */
export function loadCart() {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.USER_CART)
  };
}

/**
 * update cart item action，更新购物车item内容
 *
 * @param   {object}  updateReq
 * updateReq format
 * {
 * productId: string, productId
 * num: int, num
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function updateCart(updateReq, authKey) {
  let postData = {...updateReq, ...{_csrf: authKey}};
  return {
    types: [UPDATE, UPDATE_SUCCESS, UPDATE_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_CART, {
      data: postData
    })
  };
}

/**
 * delete cart item action，删除购物车item
 *
 * @param   {object}  deleteReq
 * deleteReq format
 * {
 * productId: string, productId
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function deleteCart(deleteReq, authKey) {
  let postData = {...deleteReq, ...{_csrf: authKey}};
  return {
    types: [DELETE, DELETE_SUCCESS, DELETE_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_CART, {
      data: postData
    })
  };
}