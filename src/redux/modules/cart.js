import ApiPath from 'api/ApiPath';

const LOAD = 'redux-example/cart/LOAD';
const LOAD_SUCCESS = 'redux-example/cart/LOAD_SUCCESS';
const LOAD_FAIL = 'redux-example/cart/LOAD_FAIL';

const ADD = 'redux-example/cart/ADD';
const ADD_SUCCESS = 'redux-example/cart/ADD_SUCCESS';
const ADD_FAIL = 'redux-example/cart/ADD_FAIL';

const UPDATE = 'redux-example/cart/UPDATE';
const UPDATE_SUCCESS = 'redux-example/cart/UPDATE_SUCCESS';
const UPDATE_FAIL = 'redux-example/cart/UPDATE_FAIL';

const DELETE = 'redux-example/cart/DELETE';
const DELETE_SUCCESS = 'redux-example/cart/DELETE_SUCCESS';
const DELETE_FAIL = 'redux-example/cart/DELETE_FAIL';

const PRICING = 'redux-example/cart/PRICING';
const PRICE_SUCCESS = 'redux-example/cart/PRICE_SUCCESS';
const PRICE_FAIL = 'redux-example/cart/PRICE_FAIL';

const initialState = {
  loaded: false
};

export default function reducer(state = initialState, action = {}) {
  let newCartData = null
  let index = -1
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
    case ADD:
      return {
        ...state,
        adding: true
      };
    case ADD_SUCCESS:
      return {
        ...state,
        adding: false,
        added: true
      };
    case ADD_FAIL:
      return {
        ...state,
        adding: false,
        added: false,
        addError: action.result,
        addErrorDesc: action.result_description
      };
    case UPDATE:
      return {
        ...state,
        updating: true
      };
    case UPDATE_SUCCESS:
      newCartData = state.data
      let updateIdx = newCartData.findIndex(elem => {return elem.sku_id == action.req.skuId})
      if (updateIdx != -1) {
        newCartData[updateIdx].num = action.req.num
      }
      return {
        ...state,
        updating: false,
        updated: true,
        data: newCartData
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
      newCartData = state.data.filter(elem => {return elem.sku_id != action.req.skuId})
      return {
        ...state,
        deleting: false,
        deleted: true,
        data: newCartData
      };
    case DELETE_FAIL:
      return {
        ...state,
        deleting: false,
        deleted: false,
        deleteError: action.result,
        deleteErrorDesc: action.result_description
      };
    case PRICING:
      return {
        ...state,
        pricing: true
      }
    case PRICE_SUCCESS:
      newCartData = state.data
      index = newCartData.findIndex(elem => {return elem.sku_id == action.req.skuId})
      if (index != -1) {
        newCartData[index].price = action.price;
        newCartData[index].real_price = action.real_price;
        newCartData[index].pay_amt = action.pay_amt;
        newCartData[index].real_pay_amt = action.real_pay_amt;
      }
      return {
        ...state,
        pricing: false,
        priceSuccess: true,
        data: newCartData
      };
    case PRICE_FAIL:
      return {
        ...state,
        pricing: false,
        priceError: action.result,
        priceErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

export function isCartLoaded(globalState) {
  console.log("isCartLoaded")
  console.log(JSON.stringify(globalState))
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
 * add cart item action，增加购物车item内容
 *
 * @param   {object}  addReq
 * addReq format
 * {
 * skuId: string, skuId
 * num: int, num
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function addCart(addReq, authKey) {
  let postData = {...addReq, ...{_csrf: authKey}};
  return {
    types: [ADD, ADD_SUCCESS, ADD_FAIL],
    req: addReq,
    promise: ({apiClient}) => apiClient.post(ApiPath.USER_CART, {
      data: postData
    })
  };
}

/**
 * update cart item action，更新购物车item内容
 *
 * @param   {object}  updateReq
 * updateReq format
 * {
 * skuId: string, skuId
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
    req: updateReq,
    promise: ({apiClient}) => apiClient.put(ApiPath.USER_CART, {
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
 * skuId: string, skuId
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
    req: deleteReq,
    promise: ({apiClient}) => apiClient.del(ApiPath.USER_CART, {
      data: postData
    })
  };
}

/**
 * pricing action, 批价请求
 *
 * @param   {object}  pricingReq
 * pricingReq format
 * {
 * skuId: string, sku id,
 * num: int, number,
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function pricing(pricingReq, authKey) {
  let postData = {...pricingReq, ...{_csrf: authKey}};
  return {
    types: [PRICING, PRICE_SUCCESS, PRICE_FAIL],
    req: pricingReq,
    promise: ({apiClient}) => apiClient.post(ApiPath.PRICING, {
      data: postData
    })
  };
}
