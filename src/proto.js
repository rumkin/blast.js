;(function(){

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
  
  _proto.extend = _extendProto
  
  if (typeof window !== "undefined") {
  	window.proto = _proto
  }

})()