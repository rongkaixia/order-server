import ApiPath from 'api/ApiPath';

const QUERYING = 'redux-example/order/QUERYING';
const QUERY_SUCCESS = 'redux-example/order/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/order/QUERY_FAIL';

const DELIVERING = 'redux-example/order/DELIVERING';
const DELIVER_SUCCESS = 'redux-example/order/DELIVER_SUCCESS';
const DELIVER_FAIL = 'redux-example/order/DELIVER_FAIL';

const DELIVER_CONFIRMING = 'redux-example/order/DELIVER_CONFIRMING';
const DELIVER_CONFIRM_SUCCESS = 'redux-example/order/DELIVER_CONFIRM_SUCCESS';
const DELIVER_CONFIRM_FAIL = 'redux-example/order/DELIVER_CONFIRM_FAIL';

const REFUNDING = 'redux-example/order/REFUNDING';
const REFUND_SUCCESS = 'redux-example/order/REFUND_SUCCESS';
const REFUND_FAIL = 'redux-example/order/REFUND_FAIL';

const REFUND_CONFIRMING = 'redux-example/order/REFUND_CONFIRMING';
const REFUND_CONFIRM_SUCCESS = 'redux-example/order/REFUND_CONFIRM_SUCCESS';
const REFUND_CONFIRM_FAIL = 'redux-example/order/REFUND_CONFIRM_FAIL';

const CANCELLING = 'redux-example/order/CANCELLING';
const CANCEL_SUCCESS = 'redux-example/order/CANCEL_SUCCESS';
const CANCEL_FAIL = 'redux-example/order/CANCEL_FAIL';

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  let orders = action.order_info;
  switch (action.type) {
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
        orders: orders
      };
    case QUERY_FAIL:
      return {
        ...state,
        querying: false,
        queryError: action.result,
        queryErrorDesc: action.result_description
      };
    case DELIVERING:
      return {
        ...state,
        delivering: true
      }
    case DELIVER_SUCCESS:
      return {
        ...state,
        delivering: false,
        deliverSuccess: true,
      };
    case DELIVER_FAIL:
      return {
        ...state,
        delivering: false,
        deliverError: action.result,
        deliverErrorDesc: action.result_description
      };
    case DELIVER_CONFIRMING:
      return {
        ...state,
        deliverConfirming: true
      }
    case DELIVER_CONFIRM_SUCCESS:
      return {
        ...state,
        deliverConfirming: false,
        deliverConfirmSuccess: true,
      };
    case DELIVER_CONFIRM_FAIL:
      return {
        ...state,
        deliverConfirming: false,
        deliverConfirmError: action.result,
        deliverConfirmErrorDesc: action.result_description
      };
    case REFUNDING:
      return {
        ...state,
        refunding: true
      }
    case REFUND_SUCCESS:
      return {
        ...state,
        refunding: false,
        refundSuccess: true,
      };
    case REFUND_FAIL:
      return {
        ...state,
        refunding: false,
        refundError: action.result,
        refundErrorDesc: action.result_description
      };
    case REFUND_CONFIRMING:
      return {
        ...state,
        refundConfirming: true
      }
    case REFUND_CONFIRM_SUCCESS:
      return {
        ...state,
        refundConfirming: false,
        refundConfirmSuccess: true,
      };
    case REFUND_CONFIRM_FAIL:
      return {
        ...state,
        refundConfirming: false,
        refundConfirmError: action.result,
        refundConfirmErrorDesc: action.result_description
      };
    case CANCELLING:
      return {
        ...state,
        cancelling: true
      }
    case CANCEL_SUCCESS:
      return {
        ...state,
        cancelling: false,
        cancelSuccess: true,
      };
    case CANCEL_FAIL:
      return {
        ...state,
        cancelling: false,
        cancelError: action.result,
        cancelErrorDesc: action.result_description
      };
    default:
      return state;
  }
}

/**
 * query user order action，查询用户订单信息
 *
 * @param   {string}  orderId, 订单号，如果订单号为空则查询用户所有订单
 * @return  {promise}
 */
export function queryOrder(orderId) {
  let path = ApiPath.USER_ORDER;
  if (orderId) {
    path += "?id=" + orderId;
  }
  return {
    types: [QUERYING, QUERY_SUCCESS, QUERY_FAIL],
    promise: ({apiClient}) => apiClient.get(path)
  };
}


// app.post(ApiPath.REFUND, api.Refund);
// app.post(ApiPath.REFUND_CONFIRM, api.RefundConfirm);
// app.post(ApiPath.CANCEL, api.Cancel);

/**
 * deliver action，发货请求
 *
 * @param   {object}  deliverReq
 * deliverReq format
 * {
 * orderId: string, order id
 * }
 * 
 * @return  {promise}
 */
export function deliver(deliverReq, authKey) {
  let postData = {...deliverReq, ...{_csrf: authKey}};
  return {
    types: [DELIVERING, DELIVER_SUCCESS, DELIVER_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.DELIVER, {
      data: postData
    })
  };
}
export function deliverConfirm(deliverConfirmReq, authKey) {
  let postData = {...deliverConfirmReq, ...{_csrf: authKey}};
  return {
    types: [DELIVER_CONFIRMING, DELIVER_CONFIRM_SUCCESS, DELIVER_CONFIRM_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.DELIVER_CONFIRM, {
      data: postData
    })
  };
}

/**
 * refund action，退款请求
 *
 * @param   {object}  refundReq
 * refundReq format
 * {
 * orderId: string, order id
 * }
 * 
 * @return  {promise}
 */
export function refund(refundReq, authKey) {
  let postData = {...refundReq, ...{_csrf: authKey}};
  return {
    types: [REFUNDING, REFUND_SUCCESS, REFUND_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.REFUND, {
      data: postData
    })
  };
}
export function refundConfirm(refundConfirmReq, authKey) {
  let postData = {...refundConfirmReq, ...{_csrf: authKey}};
  return {
    types: [REFUND_CONFIRMING, REFUND_CONFIRM_SUCCESS, REFUND_CONFIRM_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.REFUND_CONFIRM, {
      data: postData
    })
  };
}

/**
 * cancel action，取消订单请求
 *
 * @param   {object}  cancelReq
 * cancelReq format
 * {
 * orderId: string, order id
 * }
 * 
 * @return  {promise}
 */
export function cancel(cancelReq, authKey) {
  let postData = {...cancelReq, ...{_csrf: authKey}};
  return {
    types: [CANCELLING, CANCEL_SUCCESS, CANCEL_FAIL],
    promise: ({apiClient}) => apiClient.post(ApiPath.CANCEL, {
      data: postData
    })
  };
}