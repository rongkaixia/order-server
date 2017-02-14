import ApiPath from 'api/ApiPath';
import _ from 'lodash';

const LOAD_PRODUCT = 'redux-example/product/LOAD_PRODUCT';
const LOAD_PRODUCT_SUCCESS = 'redux-example/product/LOAD_PRODUCT_SUCCESS';
const LOAD_PRODUCT_FAIL = 'redux-example/product/LOAD_INF_FAIL';

const LOAD_ITEM = 'redux-example/product/LOAD_ITEM';
const LOAD_ITEM_SUCCESS = 'redux-example/product/LOAD_ITEM_SUCCESS';
const LOAD_ITEM_FAIL = 'redux-example/product/LOAD_ITEM_FAIL';

const PRICING = 'redux-example/product/PRICING';
const PRICE_SUCCESS = 'redux-example/product/PRICE_SUCCESS';
const PRICE_FAIL = 'redux-example/product/PRICE_FAIL';

const initialState = {
  productLoaded: false,
  products: [],
  items: []
};

export default function reducer(state = initialState, action = {}) {
  let newProducts = [];
  let newItems = [];
  switch (action.type) {
    case LOAD_PRODUCT:
      return {
        ...state,
        productLoading: true
      };
    case LOAD_PRODUCT_SUCCESS:
      // newProducts = state.products;
      // action.products.forEach((product) => {
      //   let index = newProducts.findIndex(elem => {return elem._id == product._id})
      //   if (index !== -1) {
      //     newProducts[index] = product;
      //   } else {
      //     newProducts.push(product)
      //   }
      // })
      return {
        ...state,
        productLoading: false,
        productLoaded: true,
        products: action.products,
        loadProductInfoError: false,
        loadProductInfoErrorDesc: action.result_description
      };
    case LOAD_PRODUCT_FAIL:
      return {
        ...state,
        productLoading: false,
        productLoaded: false,
        loadProductInfoError: action.result,
        loadProductInfoErrorDesc: action.result_description
      };
    case LOAD_ITEM:
      return {
        ...state,
        itemLoading: true
      };
    case LOAD_ITEM_SUCCESS:
      // newItems = state.items;
      // action.items.forEach((item) => {
      //   let index = newItems.findIndex(elem => {return elem._id == item._id})
      //   if (index !== -1) {
      //     newItems[index] = item;
      //   } else {
      //     newItems.push(item)
      //   }
      // })
      return {
        ...state,
        itemLoading: false,
        itemLoaded: true,
        items: action.items,
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
    default:
      return state;
  }
}

export function isProductLoaded(id, globalState) {
  return globalState.shop && 
         globalState.shop.products && 
         (globalState.shop.products.findIndex(elem=>{return elem._id == id}) != -1);
}

/**
 * load product info
 *
 * @param   {string}  type  ring, necklace, earring
 */
function _loadProductInfo(path) {
  return {
    types: [LOAD_PRODUCT, LOAD_PRODUCT_SUCCESS, LOAD_PRODUCT_FAIL],
    promise: ({apiClient}) => apiClient.get(path)
  };
}

export function loadProductInfo(id) {
  return _loadProductInfo(ApiPath.PRODUCT_INFO + '?spu_id=' + id);
}

export function loadNecklace() {
  return _loadProductInfo(ApiPath.PRODUCT_INFO + '?category=jade-necklace');
}

export function loadEarring() {
  return _loadProductInfo(ApiPath.PRODUCT_INFO + '?category=jade-earring');
}

export function loadRing(id) {
  return _loadProductInfo(ApiPath.PRODUCT_INFO + '?category=jade-ring');
}

export function isItemLoaded(id, globalState) {
  return globalState.shop && 
         globalState.shop.items && 
         (globalState.shop.items.findIndex(elem=>{return elem._id == id}) != -1);
}

export function loadItemInfoBySku(id) {
  return {
    types: [LOAD_ITEM, LOAD_ITEM_SUCCESS, LOAD_ITEM_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.ITEM_INFO + '?sku_id=' + id)
  };
}

export function loadItemInfoBySpu(id) {
  return {
    types: [LOAD_ITEM, LOAD_ITEM_SUCCESS, LOAD_ITEM_FAIL],
    promise: ({apiClient}) => apiClient.get(ApiPath.ITEM_INFO + '?spu_id=' + id)
  };

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
    promise: ({apiClient}) => apiClient.post(ApiPath.PRICING, {
      data: postData
    })
  };
}
