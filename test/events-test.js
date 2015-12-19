/**
 * events-test.js
 */

var beforeEach = require('mocha').beforeEach
var describe = require('mocha').describe
var it = require('mocha').it

var expect = require('chai').expect

var events = require('../events')

describe('events', function () {
  var i, test, event, other, control, callback

  event = Object.assign({}, events)
  other = Object.assign({}, events)

  beforeEach(function () {
    event.off()
    other.off()

    i = 0
    test = false
    control = false
  })

  describe('#on', function () {
    it('should add an event to the proper channel', function () {
      callback = function () {}
      event.on('test', callback)
      expect(callback).to.equal(event._events['test'][0].callback)
    })

    it('should not not add an event if the proper arguments are not given', function () {
      var max, args
      args = ['bob', 1, function () {}, 100, {}, {}, [], 'tom', {}, 'lois', [], 2]
      for (i = 0, max = args.length - 1; i < max; i++) {
        event.on(args[i], args[i + 1])
      }
      expect(event._events).to.be.empty
    })
  })

  describe('#off', function () {
    var foo, bar, baz
    beforeEach(function () {
      foo = function () { test = true }
      bar = function () {}
      baz = function () {}

      event.on('test', foo)
      event.on('test', bar)
      event.on('test', baz)
    })

    it('should remove the event from the proper channel', function () {
      event.off('test', foo)
      event.emit('test')
      expect(test).to.be.false
    })

    it('should only remove a specific event if both args are given', function () {
      event.off('test', foo)
      var channel = event._events['test']
      expect(test).to.be.false
      expect(channel.length).to.equal(2)
    })

    it('should remove the whole channel if only `name` is given', function () {
      events.off('test')
      var channel = event._events['test']
      expect(test).to.be.false
      expect(channel).to.equal.undefined
    })

    it('should remove all events if no argument is given', function () {
      event.off()
      var channels = event._events
      expect(test).to.be.false
      expect(channels).to.be.empty
    })
  })

  describe('#once', function () {
    it('should only be called once', function () {
      var foo, bar

      test = control = 0

      foo = function () { test++ }
      bar = function () { control++ }

      event.once('test', foo)
      event.on('test', bar)

      while (i++ < 10) { event.emit('test') }

      expect(test).to.equal(1)
      expect(control).to.equal(10)
    })

    it('should not modify the index while #emit loops through a channel', function () {
      var foo, bar, baz

      i = foo = bar = baz = 0
      test = 1
      control = 10

      event.on('test', function () { bar++ })
      event.once('test', function () { foo++ })
      event.on('test', function () { baz++ })

      while (i++ < 10) {
        event.emit('test')
      }

      expect(foo).to.equal(test)
      expect(bar).to.equal(control)
      expect(baz).to.equal(control)
    })
  })

  describe('#emit', function () {
    it('executes the callback function', function () {
      callback = function () { test = true }
      event.on('test', callback)
      event.emit('test')
      expect(test).to.be.true
    })

    it('passes its arguments to the callback function', function () {
      callback = function (arg) { test = arg }
      event.on('test', callback)
      event.emit('test', true)
      expect(test).to.be.true
    })
  })

  describe('#listen', function () {
    it('adds an event to the proper channel on the listened to object', function () {
      callback = function () {}
      event.listen(other, 'test', callback)
      test = other._events['test'][0]
      expect(callback).to.equal(test.callback)
      expect(event).to.equal(test.context)
    })
  })

  describe('#listenOnce', function () {
    it('should only be called once', function () {
      var i, foo, bar, test, control

      i = test = control = 0

      foo = function () { test++ }
      bar = function () { control++ }

      event.listenOnce(other, 'test', foo)
      event.listen(other, 'test', bar)
      while (i++ < 10) {
        other.emit('test')
      }

      expect(test).to.equal(1)
      expect(control).to.equal(10)
    })
  })

  describe('#stopListening', function () {
    it('should remove the proper event from listened to object', function () {
      callback = function () { test = true }

      event.listen(other, 'test', callback)
      event.stopListening(other, 'test', callback)
      other.emit('test')

      expect(test).to.be.false
    })
  })
})
