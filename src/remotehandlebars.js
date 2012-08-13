/*
 * remotehandlebars
 * https://github.com/jameslafferty/remotehandlebars
 *
 * Copyright (c) 2012 jameslafferty
 * Licensed under the MIT, GPL licenses.
 */

(function (win, $, hb, undefined) {
	'use strict';
	
	var _cache, _defaults, _handlers, _initRemoting, _loadTemplate,
		_localStorage, _options, _prefix, _renderTemplate, _templates,
		_templateContent, _tplCache;
	
	_prefix = 'remotehandlebar';
	
	_options = _defaults = {
		bustCache : false,
		cacheBustah : 'abcd1234',
		localCache : true,
		templatePath : 'templates',
		templateSuffix : '.tpl.htm'
	};
	
	_tplCache = {};
	_templates = {};
	
	_localStorage = win.localStorage;
	
	_cache = {
		clear : function () {},
		get : function () {
			var _cached;
			_cached = JSON.parse(_localStorage.getItem(_prefix));
			$.each(_cached, function (i, e) {
				_tplCache[i] = e;
				_templates[i] = hb.compile(e);
			});
		},
		save : function () {
			_localStorage.setItem(_prefix, JSON.stringify(_tplCache));
		}
	}
	
	// Event handlers
	
	_handlers = {};
	
	_handlers[_prefix + 'loaded'] = function (e, result) {
		var $this = $(this);
		_renderTemplate.call($this, result.template, result.data);
		if (_options.localCache) {
			_cacheTemplates();
		}
	};
	
	_handlers[_prefix + 'rendered'] = function (e, result) {
		$(this).html(result);
	};
	
	_loadTemplate = function (template, data, templateUrl) {
		var that;
		that = this;
		
		$.ajax({
			success : function (result) {
				_templates[template] = hb.compile(result);
				_tplCache[template] = result.replace(/\s{2, }/g, ' ');
				that.trigger(_prefix + 'loaded', {
					template : template,
					data : data
				});
			},
			url : templateUrl
		});
		
	};
	
	_renderTemplate = function (template, data) {
		var _rendered;
		_rendered = _templates[template](data);
		this.trigger(_prefix + 'rendered', _rendered);
	};
	
	_templateContent = function (template, data, templateUrl) {
		if (_templates[template]) {
			_renderTemplate.call(this, template, data);
		} else {
			_loadTemplate.call(this, template, data, templateUrl)
		}
	};
	
	$.fn.remotehandlebars = function (options, template, data, templateUrl) {
		
		var _data, _template, _templateUrl;
		
		this.on(_handlers);
		
		if ('object' === typeof options) {	
			_options = $.extend(true, _options, _defaults, options);
			_template = template;
			_data = data;
			_templateUrl = templateUrl;
		} else if ('string' === typeof options) {
			_template = options;
			_data = template;
			_templateUrl = data;
		}
		_templateContent.call(this, _template, _data, _templateUrl);
		return this;
	};
	
} (window, jQuery, Handlebars));
