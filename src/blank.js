(function(){

	// Proto.extend function
	var _extendProto = function (proto) {
		if ( ! proto.hasOwnProperty('super'))
			proto.super = []

		proto.super.unshift(this)
		return _proto(proto)
	}

	var _proto = function (proto) {
		var constructor
		if (proto.hasOwnProperty('constructor')) {
			constructor = proto.constructor
		} else {
			constructor = function() {}
		}

		if (proto.hasOwnProperty('super')) {
			var superProto = {}
				, parents = proto.super
				, parent

			if (parents instanceof Array == false) {
				parents = [parents]
			}

			for (var i = parents.length; i--; ) {
				parent = parents[i]

				if (typeof parent !== "function") {
					throw new Error("Super item should be a function")
				} else {
					// Import prototype properties
					var isCommon
					for (var prop in parent.prototype) {
						isCommon = parent.hasOwnProperty(prop) && parent[prop] == parent.prototype[prop]
						if (! isCommon) {
							superProto[prop] = parent.prototype[prop]
						}
					}

					// Import static properties
					var propName
					for (var prop in parent) {
						if (parent.prototype.hasOwnProperty(prop) && parent[prop] === parent.prototype[prop]) {
							propName = "common " + prop
						} else {
							propName = "static " + prop
						}

						superProto[propName] = parent[prop]
					}
				}
			}

			for (var prop in proto)
				superProto[prop] = proto[prop]

			proto = superProto
		}

		// Build function from proto declaration
		var value
		for (var prop in proto) {
			value = proto[prop]

			if (prop == 'super' || prop == 'constructor') continue
			
			if (prop.indexOf("common ") === 0) {
				prop = prop.substr(7)
				constructor.prototype[prop] = constructor[prop] = value
			} else if (prop.indexOf("static ") === 0) {
				prop = prop.substr(7)
				constructor[prop] = value
			} else {
				constructor.prototype[prop] = value
			}
		}

		if (! constructor.hasOwnProperty("extend")) {
			constructor.extend = _extendProto
		}

		return constructor
	}

	// Extend one object with another
	var extend = function (target, source) {
		if (arguments.length < 1) return {}
		if (arguments.length == 1) return arguments[0]

		var target = arguments[0]
			, source
		for (var i = 1, l = arguments.length; l > i; i++) {
			source = arguments[i]
			for (var prop in source) {
				target[prop] = source[prop]
			}
		}

		return target
	}

	// Deep extend
	var fuse = function (target, source) {
		var targetValue, sourceValue

		for (var i = 1, l = arguments.length; l > i; i++) {
			source = arguments[i]
			for (var prop in source) {
				sourceValue = source[prop]
				targetValue = target.hasOwnProperty(prop) ? target[prop] : undefined
				if (typeof targetValue == "object" && (targetValue instanceof Array || sourceValue instanceof Array) == false) {
					fuse(targetValue, sourceValue)
				} else {
					target[prop] = sourceValue
				}
			}
		}

		return target
	}

	// Copy object
	var copy = function (o) {
    // "string", number, boolean
    if(typeof(o) != "object") {
        return o;
    }
    
    // null
    if( ! o) {
        return o; // null
    }
    
    var r = (o instanceof Array) ? [] : {};
    for(var i in o) {
        if(o.hasOwnProperty(i)) {
            r[i] = copy(o[i]);
        }
    }
    return r;
	}


	var destroy = function (object) {
		var target
		for (var i = 0, l = arguments.length; l > i; i++){
			target = arguments[i]
			for (var prop in target) {
				target[prop] = undefined
				delete target[prop]
			}
		}
	}

	var selfDestroy = function() {
		destroy(this)
	}

	var blast = _proto({
		constructor : function (selector, context) {
			if (this instanceof blast == false) {
				return new this(selector, context)
			}

			this.nodes   = []
			this.context = []

			this.find(selector)
		},

		find : function (selector) {
			this.nodes = selector
		},
		
		"common options" : {},

		/*
			EXTENSIONS
		*/
		"static ext" : function(name, extension) {
			var ext = this.prototype[name] = extension
			this.options[name] = ext.prototype.options || {}
		},
		
		"static extension" : _proto({
			destroy : selfDestroy,
			"static extend" : function(proto) {
				// check extension
				if ("options" in proto == false) {
					proto.options = {}
				}
			}
		}),
		
		/*
				MODULES
		*/
		"common modules" : {},
		"static module" : function (name, module) {
			if (typeof module !== "function") {
				module = _proto(module)
			}

			this.modules[name] = module
			this.options[name] = module.prototype.options || {}
			this.prototype.__defineGetter__(name, function(){
				return new module(this.nodes, this.options[name], this)
			})
		}
	})

	var blank = _proto({
		constructor : function(selector, context) {
			if (selector instanceof blast) {
				return selector
			}

			return new blast(selector, context)
		}
	})

	extend(blank, {
		version : '0.1',
		proto   : _proto,
		extend  : extend,
		fuse    : fuse,
		copy    : copy,
		destroy : destroy
	})

	// J$(module).destroy()
	// Module is getter
	// $$('div').ui.scrollbar()

	if (typeof window !== "undefined") {
		window.proto = blank.proto
		window.blank = blank
		window.$$    = blank
		window.blast = blast
	}

	if (typeof module !== "undefined" && module.exports) {
		module.exports = blank
	}

})()
