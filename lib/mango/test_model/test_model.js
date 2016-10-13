var Mango  = require('../../mango')

let userInfo = new Mango.Collection("user_info")

userInfo.addSchema({username: 'string'})
userInfo.schema.set('collection', 'user_info')

userInfo.register()