require('babel-polyfill');

const environment = {
  development: {
    isProduction: false
  },
  production: {
    isProduction: true
  }
}[process.env.NODE_ENV || 'development'];

module.exports = Object.assign({
  host: process.env.HOST || 'localhost',
  port: process.env.PORT,
  captainHost: process.env.CAPTAIN_HOST || 'localhost',
  captainPort: process.env.CAPTAIN_PORT || 19876,
  goldHost: process.env.GOLD_HOST || 'localhost',
  goldPort: process.env.GOLD_PORT || 50051,
  captainApiPath: '/api/v1.0',
  staticResourcePath: 'http://localhost:4000/dist',
  mainDomain: 'echomoment.cn',
  mainDomainAbsPath: 'http://echomoment.cn:4000',
  orderDomain: 'order.echomoment.cn:4000',
  mongo: {
    session_url: 'mongodb://localhost:27017/app-session',
    product_url: 'mongodb://localhost:27017/product'
  },
  app: {
    title: 'jade-web-server',
    description: 'All the modern best practices in one example.',
    head: {
      titleTemplate: 'React Redux Example: %s',
      meta: [
        {name: 'description', content: 'All the modern best practices in one example.'},
        {charset: 'utf-8'},
        {property: 'og:site_name', content: 'React Redux Example'},
        {property: 'og:image', content: 'https://react-redux.herokuapp.com/logo.jpg'},
        {property: 'og:locale', content: 'en_US'},
        {property: 'og:title', content: 'React Redux Example'},
        {property: 'og:description', content: 'All the modern best practices in one example.'},
        {property: 'og:card', content: 'summary'},
        {property: 'og:site', content: '@erikras'},
        {property: 'og:creator', content: '@erikras'},
        {property: 'og:image:width', content: '200'},
        {property: 'og:image:height', content: '200'}
      ]
    }
  },

}, environment);
