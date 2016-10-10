/*!
 * MIT Licensed
 */

'use strict'

/**
 * Module dependencies.
 * @private
 */

var Cookie = require('cookie')
var createError = require('http-errors')
var pathToRegexp = require('path-to-regexp')
var debug = require('debug')('express-session');
var onHeaders = require('on-headers')

/**
 * Module exports.
 * @public
 */

module.exports = session

/**
 * Setup session store with the given `options`.
 *
 * @param {Object} [options]
 * @param {Object} [options.cookie] Options for cookie
 * @param {Function} [options.genid]
 * @param {String} [options.name=connect.sid] Session ID cookie name
 * @param {Boolean} [options.proxy]
 * @param {Boolean} [options.resave] Resave unmodified sessions back to the store
 * @param {Boolean} [options.rolling] Enable/disable rolling session expiration
 * @param {Boolean} [options.saveUninitialized] Save uninitialized sessions to the store
 * @param {String|Array} [options.secret] Secret for signing session ID
 * @param {Object} [options.store=MemoryStore] Session store
 * @param {String} [options.unset]
 * @return {Function} middleware
 * @public
 */
function session(options) {
	return function(req, res, next) {
		if (req.session) {
			next()
			return
		}
		req.session = 
	}
}

class Session {

	constructor(req, opts) {
		// get the session cookie name
	  this.name = opts.name || 'connect.sid'
		this.cookie = _parseCookies(req, opts)
	}

	_parseCookies(req, opts) {
	}

	save(id) {

	}

	clear() {

	}
}