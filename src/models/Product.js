var Mango  = require('mango')

let Types = Mango.Types;
let product = new Mango.Collection("product")

product.addSchema({
  category_id: Types.ObjectId,
  category_name: Types.String,
  name: Types.String,
  brief_desc: [Types.String],
  common_props: [{name: Types.String, value: Types.String}],
  sell_props_name: [Types.String],
  images: Types.Mixed
})

/**
 * Registration
 */
// product.defaultColumns = 'name, email, isAdmin';
product.register();
