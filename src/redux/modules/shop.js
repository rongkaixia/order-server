import ApiPath from 'api/ApiPath';

const LOAD_PRODUCT = 'redux-example/product/LOAD_PRODUCT';
const LOAD_PRODUCT_SUCCESS = 'redux-example/product/LOAD_PRODUCT_SUCCESS';
const LOAD_PRODUCT_FAIL = 'redux-example/product/LOAD_INF_FAIL';

const initialState = {
  loaded: false,
  productsByType: {},
  productsById: {}
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
      let productsById = state.productsById;
      let productsByType = state.productsByType;
      action.data.forEach((item) => {
        let data = {};
        data[item.id] = item;
        Object.assign(productsById, data)
        if (!productsByType[item.type]) {
          productsByType[item.type] = {};
        }
        Object.assign(productsByType[item.type], data);
      })
      return {
        ...state,
        loading: false,
        loaded: true,
        productsByType: productsByType,
        productsById: productsById,
        loadInfoError: false,
        loadInfoErrorDesc: action.result_description
      };
    case LOAD_PRODUCT_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        loadInfoError: action.result,
        loadInfoErrorDesc: action.result_description
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
function loadInfo(path) {
  return {
    types: [LOAD_PRODUCT, LOAD_PRODUCT_SUCCESS, LOAD_PRODUCT_FAIL],
    promise: ({apiClient}) => apiClient.get(path ? ApiPath.QUERY_PRODUCT + '/' + path : ApiPath.QUERY_PRODUCT)
  };
}

export function isProductLoad(id, globalState) {
  return globalState.shop && globalState.shop.productsById && globalState.shop.productsById[id];
}

export function loadProductInfo(id) {
  return loadInfo(ApiPath.PRODUCT_INFO + '?id=' + id);
}

export function loadNecklace() {
  return loadInfo(ApiPath.PRODUCT_INFO + '?type=necklace');
}

export function isNecklaceLoad(globalState) {
  return globalState.shop && globalState.shop.productsByType && globalState.shop.productsByType['necklace'];
}

export function loadEarring() {
  return loadInfo(ApiPath.PRODUCT_INFO + '?type=earring');
}

export function loadRing(id) {
  return loadInfo(ApiPath.PRODUCT_INFO + '?type=ring');
}
