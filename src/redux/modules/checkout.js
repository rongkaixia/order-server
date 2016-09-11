import ApiPath from 'api/ApiPath';

const CHECKOUT = 'redux-example/checkout/CHECKOUT';

const QUERYING = 'redux-example/checkout/QUERYING';
const QUERY_SUCCESS = 'redux-example/checkout/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/checkout/QUERY_FAIL';

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

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  let orderInfo = action.order_info;
  switch (action.type) {
    case CHECKOUT:
      return {
        ...state,
        productId: action.productId,
        num: action.num
      }
    case PRICING:
      console.log("PRICING")
      return {
        ...state,
        pricing: true
      }
    case PRICE_SUCCESS:
      console.log("PRICE_SUCCESS")
      return {
        ...state,
        pricing: false,
        priceSuccess: true,
        price: action.price,
        realPrice: action.real_price,
        payAmt: action.pay_amt,
        realPayAmt: action.real_pay_amt
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
 * 用户post要购买的product id跟数量num，用户post请求到服务器，服务器调用该action记录用户
 * 要购买的商品跟数量到store中，用于后续的批价跟下单
 *
 * @param   {string}  productId  商品ID
 * @param   {int}  num        购买数量
 *
 */
export function checkoutSync(productId, num) {
  return {
    type: CHECKOUT,
    productId: productId,
    num: num
  }
}

export function pricing(pricingReq, authKey) {
  let postData = {...pricingReq, ...{_csrf: authKey}};
  return {
    types: [PRICING, PRICE_SUCCESS, PRICE_FAIL],
    promise: () => {
      return Promise.resolve({
        price: 1000,
        real_price: 1000,
        discount: 0.0,
        pay_amt: 0.0,
        real_pay_amt: 2000
      })
    }
  };
}
/**
 * order action, 下单请求
 *
 * @param   {object}  orderReq
 * orderReq format
 * {
 * userId: string, user id,
 * titile: string, title,
 * productId: string, product id,
 * num: int, number,
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
 * @param   {string}  authKey   csrf token
 *
 * @return  {promise}
 */
export function query(queryReq, authKey) {
  let postData = {...queryReq, ...{_csrf: authKey}};
  return {
    types: [QUERYING, QUERY_SUCCESS, QUERY_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.QUERY, {
      data: postData
    })
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
