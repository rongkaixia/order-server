var mongoose = require('mongoose');

/**
 * Model Class
 */
export default class Collection {
  constructor(name, options) { // express req and res
  	// check name
  	if (!name) {
			throw new Error("a collection name is required")
  	}

  	let defaultOptions = {}
  	if (!options) {
  		options = defaultOptions
  	}

  	// validate options
  	
  	this.options = options;
  	this.name = name;
  	this.schema = mongoose.Schema()
  }

  addSchema(obj, prefix, options) {
  	this.schema.add(obj, prefix)
  }

// l(name, [schema], [collection], [skipInit])

  model() {
  	return mongoose.model(this.name, this.schema)
  }

  register() {
  	if (!this.mango) {
  		throw new Error("this.mango is not exist")
  	}
  	this.mango.register(this)
  }
}