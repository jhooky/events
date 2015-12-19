/**
 * @jhooky/events
 * _channel.js
 *
 */

var tools = require('toolchest')

var each = tools.each
var find = tools.find

var hOP = Object.prototype.hasOwnProperty

var optimizeRemove = function (channel, callback) {
  var base, last, index

  index = find(channel, function (event) { return event.callback === callback })

  base = function () {
    if (index !== null) {
      last = channel.length - 1

      if (index === last) {
        channel.pop()
      } else {
        channel[index] = channel.pop()
      }
    }
  }

  if (channel.emitting) {
    channel.cache.push(base)
  } else {
    base()
  }
}

var emit = function (channel, args) {
  var event, i, len, arg1, arg2, arg3
  i = -1
  len = channel.length
  arg1 = args[0]
  arg2 = args[1]
  arg3 = args[2]
  switch (args.length) {
    case 0:
      while (++i < len) {
        (event = channel[i]).callback.call(event.context)
      }
      return
    case 1:
      while (++i < len) {
        (event = channel[i]).callback.call(event.context, arg1)
      }
      return
    case 2:
      while (++i < len) {
        (event = channel[i]).callback.call(event.context, arg1, arg2)
      }
      return
    case 3:
      while (++i < len) {
        (event = channel[i]).callback.call(event.context, arg1, arg2, arg3)
      }
      return
    default:
      while (++i < len) {
        (event = channel[i]).callback.apply(event.context, args)
      }
      return
  }
}

var Channel = function () {
  var channel
  channel = Object.create(Array.prototype)
  channel = Array.apply(channel, arguments) || channel
  Channel.injectClassMethods(channel)
  Channel.injectProperties(channel)
  return channel
}

Channel.injectClassMethods = function (channel) {
  var methods
  methods = Object.keys(Channel.prototype)
  each(methods, function (method) {
    if (hOP.call(Channel.prototype, method)) {
      channel[method] = Channel.prototype[method]
    }
  })
  return channel
}

Channel.injectProperties = function (channel) {
  Object.defineProperties(channel, {
    'emitting': {
      value: false,
      writable: true
    },
    'cache': {
      value: []
    }
  })
}

Channel.prototype.add = function (event) {
  Array.prototype.push.call(this, event)
  return this
}

Channel.prototype.remove = function (callback) {
  optimizeRemove(this, callback)
}

Channel.prototype.emit = function (args) {
  this.emitting = true
  emit(this, args)
  this.emitting = false
  this.cleanup()
}

Channel.prototype.cleanup = function () {
  var cache, callback
  cache = this.cache
  while ((callback = cache.pop())) {
    callback()
  }
}

module.exports = Channel
