'use strict';

var _        = require('lodash');
var urlParse = require('url').parse;
var path     = require('path');


module.exports = function (opts) {
	var options = {
		dir: '',
		map: {
			module : 'path[0]',
			method : 'path[1]'
		},
		defaults: {
			module : '_default',
			method : 'default'
		},
		errors: {
			noModule : errorHandler,
			noMethod : errorHandler
		}
	};
	options = _.defaultsDeep({}, opts, options);

	function controller (req, res, next) {
		req.routeB = {};
		req.routeB.queryObj = getQueryObject(req);
		req.routeB.callObj  = getCallObj(req.routeB.queryObj);

		if (!req.routeB.callObj.module) {
			return options.errors.noModule(req, res, next);
		}

		if (!req.routeB.callObj.method) {
			return options.errors.noMethod(req, res, next);
		}

		return req.routeB.callObj.method.apply(null, arguments);
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
			moduleName: _.get(queryObj, options.map.module),
			methodName: _.get(queryObj, options.map.method),
			module: null,
			method: null
		};

		var modulePath;

		try {
			modulePath = path.resolve(options.dir, callObj.moduleName);
			callObj.module = require(modulePath);
		} catch (e) {
			try {
				modulePath = path.resolve(options.dir, options.defaults.module);
				callObj.module = require(modulePath);
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

	function errorHandler (req, res) {
		res.status(404).send({
			error: 'Not found',
			module: req.routeB.callObj.moduleName,
			method: req.routeB.callObj.methodName
		});
	}

	return controller;
};
