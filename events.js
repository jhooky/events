/**
 * events.js --- A simple events mixin object.
 */

var tools = require('toolchest')
var Channel = require('./lib/_channel')

var isFunction = tools.isFunction
var isString = tools.isString

var getChannel = function (emitter, name, create) {
  var channels = emitter._events || (emitter._events = {})
  var channel = channels[name]
  if (!channel && create) {
    channel = channels[name] = Channel()
  }
  return channel
}

var removeChannel = function (emitter, name) {
  var channels = emitter._events || (emitter._events = {})
  delete channels[name]
}

var Event = function (context, callback) {
  this.context = context
  this.callback = callback
}

exports.on = function (name, callback, context) {
  if (isString(name) && isFunction(callback)) {
    var channel = getChannel(this, name, true)
    context = context || this
    channel.add(new Event(context, callback))
  }
  return this
}

/* events#off
 * (name, callback) - If found, a specific event is removed.
 * (name) - A whole channel is removed.
 * () - If no arguments are given ***ALL EVENTS ARE REMOVED***
 */
exports.off = function (name, callback) {
  if (isString(name)) {
    if (isFunction(callback)) {
      var channel = getChannel(this, name)
      if (channel) {
        channel.remove(callback)
      }
    } else if (callback === undefined) {
      removeChannel(this, name)
    }
  } else if (name === undefined && callback === undefined) {
    this._events = {}
  }
  return this
}

/* events#once
 * A normal event is added to a specific channel, but also a removal event
 * is created and cached for execution post-emit.
 */
exports.once = function (name, callback, context) {
  if (isString(name) && isFunction(callback)) {
    this.on(name, callback, context)
    getChannel(this, name).cache.push(new Event(this, function () {
      this.off(name, callback)
    }))
  }
  return this
}

exports.emit = function (name) {
  if (isString(name)) {
    var args = Array.prototype.slice.call(arguments, 1)
    var channel = getChannel(this, name)
    if (channel) {
      channel.emit(args)
    }
  }
  return this
}

exports.listen = function (object, name, callback, context) {
  if (isString(name) && isFunction(callback) && isFunction(object.on)) {
    object.on(name, callback, context || this)
  }
  return this
}

exports.listenOnce = function (object, name, callback, context) {
  if (isString(name) && isFunction(callback) && isFunction(object.once)) {
    object.once(name, callback, context || this)
  }
  return this
}

exports.stopListening = function (object, name, callback) {
  if (isString(name) && isFunction(callback) && isFunction(object.off)) {
    object.off(name, callback)
  }
  return this
}
