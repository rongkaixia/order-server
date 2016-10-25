var Mango  = require('mango')

let Types = Mango.Types;
let product = new Mango.Collection("product")

  // let p1 = new Product({
  //   name: "经典 - 18k白金翡翠吊坠",
  //   type: "necklace",
  //   type_name: "吊坠",
  //   brief_desc: ["精选心型18K翡翠吊坠", "18k白金、18k黄金", "吊坠大小 - 1.8cm * 0.5cm * 0.2cm"], // 简要描述，用于购买页展示
  //   choices: [
  //     {id: 1, name: "material", display_name: "材质", value: ["18k白金", "18k黄金", "18k玫瑰金"]},
  //     {id: 2, name: "size", display_name: "手寸", value: ["11", "12", "13", "14", "15"], comment: "如何量手寸"}
  //   ], //商品选择
  //   specs: [
  //     {name: "大小", value: ["主石大小 1.8cm * 0.5cm * 0.2cm", "吊坠大小 1.8cm * 0.5cm * 0.2cm"]},
  //     {name: "重量", value: ["主石重量 0.018g", "吊坠总重量 1.02g"]}
  //   ], //参数
  //   images: {
  //     hero_image: 'http://localhost:4000/dist' + "/static/diaozhui.png", //商品主图，单张图片， 用于点击进入详情页或购买页面
  //     thumbnail: 'http://localhost:4000/dist' + "/static/diaozhui80x80.jpg", //商品小图，用于订单中展示等
  //     gallery: {}, //商品gallery，多张
  //     banner: {} // banner图片，用于商品详细页面
  //   },
  //   price: 1750, // 商品原始单价
  //   real_price: 1750 // 商品实际单价，促销等情况
  // })

product.addSchema({
  // id: Types.String,
  type: Types.String,
  name: Types.String,
  type_name: Types.String,
  brief_desc: [Types.String],
  choices: [Types.Mixed],
  specs: [Types.Mixed],
  price: Types.Number, // 商品原始单价
  real_price: Types.Number, // 商品实际单价，促销等情况
  images: {hero_image: Types.String,
          thumbnail: Types.String,
          gallery: Types.Mixed,
          banner: Types.Mixed}
})

/**
 * Registration
 */
// product.defaultColumns = 'name, email, isAdmin';
product.register();
