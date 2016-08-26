import API from 'echo-common/api/api'

const LOAD_PRODUCT = 'redux-example/product/LOAD_PRODUCT';
const LOAD_PRODUCT_SUCCESS = 'redux-example/product/LOAD_PRODUCT_SUCCESS';
const LOAD_PRODUCT_FAIL = 'redux-example/product/LOAD_INF_FAIL';

const initialState = {
  loaded: false,
  products: {}
};

export default function reducer(state = initialState, action = {}) {
  let newInfo = {};
  switch (action.type) {
    case LOAD_PRODUCT:
      return {
        ...state,
        loading: true
      };
    case LOAD_PRODUCT_SUCCESS:
      let products = state.products;
      action.data.forEach((item) => {
        let data = {};
        data[item.id] = item;
        if (products[item.type] === undefined) {
          products[item.type] = {};
        }
        Object.assign(products[item.type], data);
      })
      return {
        ...state,
        loading: false,
        loaded: true,
        products: products,
        loadInfoError: false,
        loadInfoErrorDesc: action.errorDescription
      };
    case LOAD_PRODUCT_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadInfoError: action.errorCode,
        loadInfoErrorDesc: action.errorDescription
      };

    default:
      return state;
  }
}

/**
 * load product info
 *
 * @param   {string}  type  ring, necklace, earring
 */
export function loadInfo(path) {
  return {
    types: [LOAD_PRODUCT, LOAD_PRODUCT_SUCCESS, LOAD_PRODUCT_FAIL],
    promise: ({client}) => client.get(path ? API.PRODUCT_API_PATH + '/' + path : API.PRODUCT_API_PATH)
  };
}

export function loadNecklace(id) {
  return loadInfo(id ? 'necklace/' + id : 'necklace');
}

export function loadEarring(id) {
  return loadInfo(id ? 'earring/' + id : 'earring');
}

export function loadRing(id) {
  return loadInfo(id ? 'ring/' + id : 'ring');
}
