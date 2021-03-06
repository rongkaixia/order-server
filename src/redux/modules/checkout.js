import ApiPath from 'api/ApiPath';

const CHECKOUT = 'redux-example/checkout/CHECKOUT';

const LOAD_ITEM = 'redux-example/checkout/LOAD_ITEM';
const LOAD_ITEM_SUCCESS = 'redux-example/checkout/LOAD_ITEM_SUCCESS';
const LOAD_ITEM_FAIL = 'redux-example/checkout/LOAD_ITEM_FAIL';

const PRICING = 'redux-example/checkout/PRICING';
const PRICE_SUCCESS = 'redux-example/checkout/PRICE_SUCCESS';
const PRICE_FAIL = 'redux-example/checkout/PRICE_FAIL';

const ORDERING = 'redux-example/checkout/ORDERING';
const ORDER_SUCCESS = 'redux-example/checkout/ORDER_SUCCESS';
const ORDER_FAIL = 'redux-example/checkout/ORDER_FAIL';

const INVOKING_PAY = 'redux-example/checkout/INVOKING_PAY';
const INVOKE_PAY_SUCCESS = 'redux-example/checkout/INVOKE_PAY_SUCCESS';
const INVOKE_PAY_FAIL = 'redux-example/checkout/INVOKE_PAY_FAIL';

const FAKE_NOTIFYING = 'redux-example/checkout/FAKE_NOTIFYING';
const FAKE_NOTIFY_SUCCESS = 'redux-example/checkout/FAKE_NOTIFY_SUCCESS';
const FAKE_NOTIFY_FAIL = 'redux-example/checkout/FAKE_NOTIFY_FAIL';

const QUERYING = 'redux-example/checkout/QUERYING';
const QUERY_SUCCESS = 'redux-example/checkout/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/checkout/QUERY_FAIL';

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  let orderInfo = action.order_info;
  let newCheckoutItems = {}
  let index = -1
  switch (action.type) {
    case CHECKOUT:
      return {
        ...state,
        checkoutItems: action.checkoutItems
      }
    case LOAD_ITEM:
      return {
        ...state,
        itemLoading: true
      };
    case LOAD_ITEM_SUCCESS:
      newCheckoutItems = state.checkoutItems;
      action.items.forEach((item) => {
        let index = newCheckoutItems.findIndex(elem => {return elem.skuId == item._id})
        if (index !== -1) {
          newCheckoutItems[index] = Object.assign(newCheckoutItems[index], item);
        }
      })
      return {
        ...state,
        itemLoading: false,
        itemLoaded: true,
        checkoutItems: newCheckoutItems,
        loadItemInfoError: false,
        loadItemInfoErrorDesc: action.result_description
      };
    case LOAD_ITEM_FAIL:
      return {
        ...state,
        itemLoading: false,
        itemLoaded: false,
        loadItemInfoError: action.result,
        loadItemInfoErrorDesc: action.result_description
      };
    case PRICING:
      console.log("PRICING")
      return {
        ...state,
        pricing: true
      }
    case PRICE_SUCCESS:
      console.log("PRICE_SUCCESS")
      // let newPrices = state.prices
      // newPrices[action.req.id] = {price: action.price, 
      //                             realPrice: action.real_price,
      //                             payAmt: action.pay_amt,
      //                             realPayAmt: action.real_pay_amt}
      newCheckoutItems = state.checkoutItems;
      index = newCheckoutItems.findIndex((elem) => {return elem.skuId == action.req.id})
      console.log(index)
      console.log(action.req.id)
      if (index != -1) {
        newCheckoutItems[index].price = action.price
        newCheckoutItems[index].realPrice = action.real_price
        newCheckoutItems[index].payAmt = action.pay_amt
        newCheckoutItems[index].realPayAmt = action.real_pay_amt
      }
      return {
        ...state,
        pricing: false,
        priceSuccess: true,
        checkoutItems: newCheckoutItems
      };
    case PRICE_FAIL:
      console.log("PRICE_FAIL")
      return {
        ...state,
        pricing: false,
        priceError: action.result,
        priceErrorDesc: action.result_description
      };
    case ORDERING:
      return {
        ...state,
        ordering: true
      }
    case ORDER_SUCCESS:
      return {
        ...state,
        ordering: false,
        orderSuccess: true,
        orderInfo: orderInfo
      };
    case ORDER_FAIL:
      return {
        ...state,
        ordering: false,
        orderError: action.result,
        orderErrorDesc: action.result_description
      };
    case INVOKING_PAY:
      return {
        ...state,
        invokePaying: true
      };
    case INVOKE_PAY_SUCCESS:
      return {
        ...state,
        invokePaying: false,
        invokePaySuccess: true
      };
    case INVOKE_PAY_FAIL:
      return {
        ...state,
        invokePaying: false,
        invokePayError: action.result,
        invokePayErrorDesc: action.result_description
      };
    case QUERYING:
      return {
        ...state,
        querying: true
      }
    case QUERY_SUCCESS:
      return {
        ...state,
        querying: false,
        querySuccess: true,
        orderInfo: orderInfo
      };
    case QUERY_FAIL:
      return {
        ...state,
        querying: false,
        queryError: action.result,
        queryErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

/**
 * checkout action
 * 用户post要购买的sku id跟数量num，用户post请求到服务器，服务器调用该action记录用户
 * 要购买的商品跟数量到store中，用于后续的批价跟下单
 *
 * @param Array of Object checkoutItems 购买的物品
 * checkoutItems 中的内容为
 * [{skuId: xxx, num: xxx}, ..., ...]
 * @param   {string}  skuId  商品ID
 * @param   {int}  num        购买数量
 *
 */
export function checkoutSync(checkoutItems) {
  return {
    type: CHECKOUT,
    checkoutItems: checkoutItems
  }
}

/**
 * load item info action
 * 获取商品信息
 *
 * @param {string} id sku id
 */
export function loadItemInfoBySku(id) {
  return {
    types: [LOAD_ITEM, LOAD_ITEM_SUCCESS, LOAD_ITEM_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.ITEM_INFO + '?sku_id=' + id)
  };
}

/**
 * isOrderInfoLoad action
 * 用于检查orderId对应的order info是否已经load到store中，避免checkout页面到payment页面是还需重新
 * load一遍order info
 *
 * @param   {string}  orderId  order id
 *
 */
export function isOrderInfoLoad(orderId, state) {
  if (state && state.checkout && 
      state.checkout.orderInfo && state.checkout.orderInfo.order_id == orderId)
    return true;
  else
    return false;
}

/**
 * pricing action, 批价请求
 *
 * @param   {object}  pricingReq
 * pricingReq format
 * {
 * id: string, sku id,
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

/**
 * order action, 下单请求
 *
 * @param   {object}  orderReq
 * orderReq format
 * {
 * userId: string, user id,
 * products [{skuId: string, product id, num: int, number}, ...],
 * payMethod: string, 'ONLINE' or 'COD',
 * deliverMethod: string, 'EXPRESS' or 'DTD',
 * recipientsName: string, recipients_name,
 * recipientsPhone: string, recipients_phone,
 * recipientsAddress: string, recipients_address,
 * recipientsPostcode: string, recipients_postcode,
 * comment: string, commnet
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function order(orderReq, authKey) {
  let postData = {...orderReq, ...{_csrf: authKey}};
  return {
    types: [ORDERING, ORDER_SUCCESS, ORDER_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.ORDER, {
      data: postData
    })
  };
}

/**
 * pay action, 拉起支付页面
 *
 * @param   {object}  payReq
 * payReq format
 * {
 * orderId: string, order id
 * }
 * 
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function pay(payReq, authKey) {
  let postData = {...payReq, ...{_csrf: authKey}};
  return {
    types: [INVOKING_PAY, INVOKE_PAY_SUCCESS, INVOKE_PAY_FAIL],
    promise: () => {return Promise.resolve()}
    // promise: () => {return Promise.reject({result: 'test error', result_description: 'test error'})}
  };
}

/**
 * query order action，查询订单状态
 *
 * @param   {object}  queryReq
 * queryReq format
 * {
 * orderId: string, order id
 * }
 * 
 * @return  {promise}
 */
export function query({orderId}) {
  return {
    types: [QUERYING, QUERY_SUCCESS, QUERY_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.ORDER_INFO + '?id=' + orderId)
  };
}

export function fakeNotify(notifyReq, authKey) {
  let postData = {...notifyReq, ...{_csrf: authKey}};
  return {
    types: [FAKE_NOTIFYING, FAKE_NOTIFY_SUCCESS, FAKE_NOTIFY_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.NOTIFY, {
      data: postData
    })
  };
}

/* eslint-disable */ 
export {ORDER_SUCCESS, QUERY_SUCCESS};
