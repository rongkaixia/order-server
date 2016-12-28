var Mango  = require('mango')

let Types = Mango.Types;
let category = new Mango.Collection("category")

category.addSchema({
  name: Types.String,
  desc: Types.String,
  pid: Types.ObjectId,
  pname: Types.String
})

/**
 * Registration
 */
category.register();
