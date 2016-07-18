'use strict';

var _        = require('lodash');
var urlParse = require('url').parse;
var path     = require('path');


module.exports = function (opts) {
	var options = {
		dir: '',
		fileExtension: '.js',
		map: {
			filename : 'path[0]',
			method   : 'path[1]'
		},
		defaults: {
			filename : 'index',
			method   : 'action'
		},
		errors: {
			noFile   : errorNoFile,
			noMethod : errorNoMethod
		}
	};
	options = _.defaultsDeep({}, opts, options);
	options.fileExtension = options.fileExtension || '';

	function controller (req, res, next) {
		var queryObj = getQueryObject(req);
		var callObj  = getCallObj(queryObj);

		res.json(queryObj);
	}

	function getQueryObject(req) {
		var queryObj = {
			method : req.method.toLowerCase(),
			path   : [],
			query  : req.query
		};

		var url = req.url || '';
		var urlObj = urlParse(url);
		queryObj.path = urlObj.pathname && urlObj.pathname.split('/') || [];
		queryObj.path = _.without(queryObj.path, '');

		return queryObj;
	}

	function getCallObj (queryObj) {
		var callObj = {
			module: null,
			method: null
		};

		var filename;

		try {
			filename = path.resolve(options.dir, _.get(queryObj, options.map.filename) + options.fileExtension);
			callObj.module = require(filename);
		} catch (e) {
			try {
				filename = path.resolve(options.dir, options.defaults.filename + options.fileExtension);
				callObj.module = require(filename);
			} catch (e) {
			}
		}

		var methodName;

		if (callObj.module) {
			methodName = _.get(queryObj, options.map.method);

			if (typeof callObj.module[methodName] === 'function') {
				callObj.method = callObj.module[methodName];
			} else {
				methodName = options.defaults.method;
				if (typeof callObj.module[methodName] === 'function') {
					callObj.method = callObj.module[methodName];
				} else {
					// No method to call
				}
			}
		} else {
			// No module to call
		}

		return callObj;
	}

	function errorNoFile () {
		throw new Error('No file');
	}

	function errorNoMethod () {
		throw new Error('No method');
	}

	return controller;
};
