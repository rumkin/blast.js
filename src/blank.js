(function(){

  var _proto = proto
  var blank = _proto({
    "common version" : "0.1",
    "common config" : {},
    /*
    TODO:
    0.2
    - strict extending: extensions, static calls, modules, packages, plugins (?)
      function name add, mixin, plugin, method, module (?)
      how-to plugins
    0.3
    - configuration agreement:
      use method .config('module.key.key2', 'value')
      
      0.3.1
      - namespaces
    
    */
    /*
      EXTENSIONS
    */
    "static ext" : function(name, extension) {
      if (typeof extension == "object") {
        var fn     = extension.method
          , config = extension.config
          , module = extension.module
      } else {
        var fn     = extension
          , config = extension.prototype.config || {}
          , module = extension.prototype.module || false
      }

      // if ( ! module && ! extension) {
      //   throw new Error("Invalid extension: no module or method defined")
      // }

      this.prototype[name] = fn
      this.config[name] = config

      if (module) {
        this[name] = module
      }
    },

    "static mixin" : function (name, extension) {
      if (typeof extension == "object") {
        var fn     = extension.method
          , config = extension.config
      } else {
        var fn     = extension
          , config = extension.prototype.config || {}
      }

      // if (this.config.hasOwnProperty(name)) {
      //   throw new Error("Mixin '" + name + "' already exists")
      // }

      this.prototype[name] = fn
      this.config[name]    = config
    },

    "static method" : function (name, extension) {
      if (typeof extension == "object") {
        var fn     = extension.method
          , config = extension.config
      } else {
        var fn     = extension
          , config = extension.prototype.config || {}
      }

      if (this.config.hasOwnProperty(name)) {
        throw new Error("Method '" + name + "' already exists")
      }

      this[name]        = fn
      this.config[name] = config
    },

    "static module" : function (module) {

      var config = module.config || {}

      var method, _name
      for (var name in module) {
        method = module[name]
        if (typeof method !== "function") continue

        if (name.charAt(0) == "_") {
          _name = name
          name  = name.substr(1)
          
          if (this.prototype.hasOwnProperty(name)) {
            throw new Error ("Static method '" + name + "' already defined")
          }

          this[name] = method
          this.config[_name] = config[_name] || {}

        } else {
          if (this.prototype.hasOwnProperty(name)) {
            throw new Error ("Method '" + name + "' already defined")
          }

          this.config[name] = config[name] || {}
          this.prototype[name] = method
        }
      }
    },

    "static realize" : function (proto) {
      if ("static config" in proto == false) {
        proto["static config"] = {}
      }

      return _proto.extend.call(this, proto)
    }

  })

  if (typeof window !== "undefined") {
    window.blank = blank
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = blank
  }

})()
