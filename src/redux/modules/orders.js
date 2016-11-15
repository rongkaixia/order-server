import ApiPath from 'api/ApiPath';

const QUERYING = 'redux-example/orders/QUERYING';
const QUERY_SUCCESS = 'redux-example/orders/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/orders/QUERY_FAIL';

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
