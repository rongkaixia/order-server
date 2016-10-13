var mongoose = require('mongoose');

var moduleRoot = (function (_rootPath) {
	var parts = _rootPath.split(path.sep);
	parts.pop(); // get rid of /node_modules from the end of the path
	return parts.join(path.sep);
})(module.parent ? module.parent.paths[0] : module.paths[0]);

/**
 * Mango Class
 */
var Mango = function () {
  this.data = "hello";
  this.mongoose = mongoose;
  this.collections = {};

  // default options
  this.options = {
  	'module root': moduleRoot
  }
}
var mango = module.exports = exports = new Mango();

mango.Collection = require('./collection')
mango.Collection.prototype.mango = mango

Mango.prototype.getModel = function(name) {
  return this.mongoose.model(name);
}

Mango.prototype.register = function(collection) {
	let name = collection.name
	if(name in this.collections) {
		throw new Error("collection with name" + collection.name + " has already register")
	}
	this.collections[name] = collection
}

Mango.prototype.start = function() {
	// start mongo connection
	this._connect_mongo();
}

Mango.prototype._connect_mongo = function() {
	mongoose.connect(this.mongo || process.env.MONGO_URI );
	var db = mongoose.connection;
	this.db  = db;
	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
	  // we're connected!
	});
}

Mango.prototype.importModels = function (dirname) {

	var initialPath = path.join(this.options['module root'], dirname);

	var doImport = function (fromPath) {
		var imported = {};

		fs.readdirSync(fromPath).forEach(function (name) {

			var fsPath = path.join(fromPath, name);
			var info = fs.statSync(fsPath);

			// recur
			if (info.isDirectory()) {
				imported[name] = doImport(fsPath);
			} else {
				// only import files that we can `require`
				var ext = path.extname(name);
				var base = path.basename(name, ext);
				if (require.extensions[ext]) {
					imported[base] = require(fsPath);
				}
			}

		});

		return imported;
	};

	return doImport(initialPath);
};