import API from 'order-sdk/api';

const QUERYING = 'redux-example/order/QUERY';
const QUERY_SUCCESS = 'redux-example/order/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/order/QUERY_FAIL';
const ORDERING = 'redux-example/order/ORDER';
const ORDER_SUCCESS = 'redux-example/order/ORDER_SUCCESS';
const ORDER_FAIL = 'redux-example/order/ORDER_FAIL';
const PAYING = 'redux-example/order/PAY';
const PAY_SUCCESS = 'redux-example/order/PAY_SUCCESS';
const PAY_FAIL = 'redux-example/order/PAY_FAIL';

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ORDER_SUCCESS:
      let orderInfo = action.order_info;
      return {
        ...state,
        data: {}
      };
    case ORDER_FAIL:
      return {
        ...state,
        error: action.error
      };
    default:
      return state;
  }
}

/**
 * order action
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
    promise: ({goldClient}) => goldClient.post(API.ORDER, {
      data: postData
    })
  };
}

export function pay(payReq, authKey) {
  let postData = {...payReq, ...{_csrf: authKey}};
  return {
    types: [PAYING, PAY_SUCCESS, PAY_FAIL],
    promise: ({goldClient}) => goldClient.post(API.PAY, {
      data: postData
    })
  };
}


/* eslint-disable */ 
export {ORDER_SUCCESS, QUERY_SUCCESS};
