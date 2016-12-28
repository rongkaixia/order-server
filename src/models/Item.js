var Mango  = require('mango')

let Types = Mango.Types;
let item = new Mango.Collection("item")

item.addSchema({
  spu_id: Types.ObjectId,
  name: Types.String,
  brief_desc: [Types.String],
  sell_props: Types.Mixed,
  price: Types.Double, // 商品原始单价
  real_price: Types.Double, // 商品实际单价，促销等情况
  sale: Types.Number, // 销量
  sku: Types.Number, // 库存
  images: Types.Mixed
})

/**
 * Registration
 */
// product.defaultColumns = 'name, email, isAdmin';
item.register();
