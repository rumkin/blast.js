;(function() {

	"use strict"

	var _slice  = Array.prototype.slice
		, _concat = Array.prototype.concat

	var Blast = blank.realize({
		constructor : function (selector, context) {
			this.nodes = []

			if ( ! selector) return this

			if ( ! context) {
				context = [document]
			} else if (context instanceof NodeList) {
				context = Array.prototype.slice.call(context)
			} else if (context instanceof this.constructor) {
				context = context.nodes
			} else if (context instanceof Array === false) {
				context = [context]
			}

			if (typeof selector == "string") {
				this.nodes = this.select(selector, context)
			} else if (selector instanceof NodeList) {
				this.nodes = Array.prototype.slice.apply(selector)
			} else if (selector instanceof Node) {
				this.nodes = [selector]
			} else if (selector instanceof Array) {
				this.nodes = selector
			}
		},

		select : function(selector, context) {
			var list = [], node, nodes

			if (context.length == 1) {
				list = _slice.call(context[0].querySelectorAll(selector))
			} else {
				var i = -1, len = context.length, found = new Array(len)
				for (; len > ++i;) {
					nodes = context[i].querySelectorAll(selector)
					list = list.concat(_slice.call(nodes))
				}
			}


			list = this.unique(list)

			return list
		},
		"common unique" : function(list) {
			var filtered = []
			for (var i = -1, l = list.length; l > ++i;) {
				if (filtered.indexOf(list[i]) > -1) continue

				filtered.push(list[i])
			}
			return filtered
		},
		find : function(selector) {
			return new this.constructor(selector, this.nodes)
		},
		all : function () {
			return this.nodes
		}
	})


	// DOM Modifications --------------------------------------------------------
	
	Blast.method("html", function (html) {
		var fragment = document.createDocumentFragment()
			, div      = document.createElement("div")

		fragment.appendChild(div)

		div.innerHTML = html
		var nodes = Array.prototype.slice.apply(div.childNodes)

		while(div.firstChild) {
			div.removeChild(div.firstChild)
		}
		

		fragment.removeChild(div)
		fragment = null

		var blast = (new this(nodes))
		return blast
	})

	Blast.mixin("html", function(html) {
		var nodes = this.nodes
		
		if ( ! html) {
			if (this.nodes.length) return this.nodes[0].innerHTML

			return
		}

		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			nodes[i].innerHTML = html
		}

		return this
	})

	Blast.mixin("text", function(text) {
		var nodes = this.nodes
		if ( text === undefined) {
			return nodes.length && nodes[0].innerText || undefined
		}

		this.empty()

		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			nodes[i].innerText = text
		}

		return this
	})

	Blast.mixin("empty", function(){
		var nodes = this.nodes, node
		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			node = nodes[i]
			while(node.firstChild) Blast.remove(node.firstChild)
		}

		return this
	})

	Blast.method("remove", function(node) {
		if (node.nodeType == 1) {
			while (node.firstChild) this.remove(node.firstChild)
		}

		node.parentNode.removeChild(node)
	})

	Blast.mixin("appendTo", function (target) {
		if (typeof target == "string") {
			target = this.select(target)
			if ( ! target.length) {
				throw new Error("Target not found")
			}

			target = target[0]
		}

		if (target instanceof Node === false) {
			throw new Error("Target is not a node")
		}

		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			target.appendChild(this.nodes[i])
		}

		return this
	})


	// EVENTS -------------------------------------------------------------------
	
	Blast.mixin("on", function(name, selector, callback){


		if (callback === undefined) {
			callback = selector
			selector = false
		}

		var nodes = this.nodes
		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			if ( ! selector) {
				nodes[i].addEventListener(name, callback)
			}
		}

		return this
	})

	Blast.mixin("off", function(name, selector, callback) {

		if (callback === undefined) {
			callback = selector
			selector = false
		}


		var nodes = this.nodes
		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			if ( ! selector) {
				nodes[i].removeEventListener(name, callback)
			}
		}

		return this
	})

	Blast.mixin("trigger", function (event, params){
		// Generate event
		params = params || {}
		// @todo add real dom events
		var e = new CustomEvent(event, params.cancelable || true, params.bubbles || false, params.detail || {})

		// Trigger event
		var nodes = this.nodes
		for (var i = -1, l = nodes.length; l > (i += 1); ) {
			nodes[i].dispatchEvent(e)
		}

		return this
	})


	// EXPORT -------------------------------------------------------------------
	
	var _blast = function (selector, target) {
		return new Blast(selector, target)
	}

	if (typeof window !== "undefined") {
    window.blast = _blast
    window.$$    = _blast
  }

  if (typeof module !== "undefined" && module.exports) {
    module.exports = _blast
  }

})()