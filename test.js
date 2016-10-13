var mongoose = require('mongoose');

class Model {
}
/**
 * Mango Class
 */
var Mango = function () {
    this.data = "hello";
    this.mongoose = mongoose;
}
var mango = module.exports = exports = new Mango();
Mango.prototype.getModel = function(name) {
    return this.mongoose.model(name);
}
