import API from 'order-sdk/api';

const QUERY = 'redux-example/order/QUERY';
const QUERY_SUCCESS = 'redux-example/order/QUERY_SUCCESS';
const QUERY_FAIL = 'redux-example/order/QUERY_FAIL';
const ORDER = 'redux-example/order/ORDER';
const ORDER_SUCCESS = 'redux-example/order/ORDER_SUCCESS';
const ORDER_FAIL = 'redux-example/order/ORDER_FAIL';
const PAY = 'redux-example/order/PAY';
const PAY_SUCCESS = 'redux-example/order/PAY_SUCCESS';
const PAY_FAIL = 'redux-example/order/PAY_FAIL';

const initialState = {
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case ORDER_SUCCESS:
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

export function orderSuccess(data) {
  return {
    type: ORDER_SUCCESS,
    data: data
  }
}

export function orderFail(error) {
  return {
    type: ORDER_FAIL,
    error: error
  }
}

export function order(orderReq, authKey) {
  return (dispatch, getState, {goldClient}) => {
    let postData = {...orderReq, ...{_csrf: authKey}};
    console.log("postData: " + JSON.stringify(postData));
    return goldClient.post(API.ORDER, {
      data: postData
    }).then(
      response => dispatch(orderSuccess(response)),
      error => dispatch(orderFail(error))
    )
  }
}

/* eslint-disable */ 
export {ORDER_SUCCESS, QUERY_SUCCESS};
