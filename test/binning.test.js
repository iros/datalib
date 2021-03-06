'use strict';

var assert = require('chai').assert;
var bin = require('../src/bin');
var histogram = require('../src/histogram');
var units = require('../src/date-units');
var util = require('../src/util');
var gen = require('../src/generate');

describe('binning', function() {

  describe('bin', function() {
    it('should bin integer values', function() {
      var b = bin({min:0, max:10, minstep:1});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);

      b = bin({min:-1, max:10, minstep:1});
      assert.equal(b.start, -1);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);
    });
  
    it('should bin numeric values', function() {
      var b = bin({min:1.354, max:98.432, maxbins: 11});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 10);

      b = bin({min:1.354, max:98.432, maxbins: 6});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 20);

      b = bin({min:1.354, max:98.432, maxbins: 21, div:[5,2]});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 100);
      assert.equal(b.step, 5);
    });

    it('should accept minimum step size', function() {
      var b = bin({min:0, max:10, minstep: 1, maxbins: 101});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 1);

      b = bin({min:0, max:10, maxbins: 110});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 10);
      assert.equal(b.step, 0.1);
    });
  
    it('should accept fixed step size', function() {
      var b = bin({min:0, max:9, step: 3});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 9);
      assert.equal(b.step, 3);
    });

    it('should use given step options', function() {
      var b = bin({min:0, max:20, steps: [4,10]});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 20);
      assert.equal(b.step, 4);
    
      b = bin({min:0, max:20, steps: [4,10], maxbins:3});
      assert.equal(b.start, 0);
      assert.equal(b.stop, 20);
      assert.equal(b.step, 10);
    });
  });

  describe('bin.date', function() {
    it('should bin across years', function() {
      var b = bin.date({
        min: Date.parse('1/1/2000'),
        max: Date.parse('1/1/2010')
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'year');
    });

    it('should accept explicit units', function() {
      var b = bin.date({
        min:  Date.parse('1/1/2000'),
        max:  Date.parse('1/1/2001'),
        unit: 'month'
      });
      assert.equal(b.step, 1);
      assert.equal(b.unit.type, 'month');

      b = bin.date({
        min:  Date.parse('1/1/2000'),
        max:  Date.parse('1/1/2010'),
        unit: 'month'
      });
      assert.equal(b.step, 6);
      assert.equal(b.unit.type, 'month');
    });
  });

  describe('histogram', function() {
    it('should bin numeric values', function() {
      var numbers = [1,2,3,4,5,6,7,1,2,3,4,5,1,2,3];
      var h = histogram(numbers, {maxbins: 10});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor("value")));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor("count")));
    });

    it('should ignore null values among numbers', function() {
      var numbers = [null,1,2,3,NaN,4,5,6,undefined,7,1,2,3,4,5,1,null,2,3];
      var h = histogram(numbers, {maxbins: 10});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor("value")));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor("count")));
    });

    it('should bin integer values', function() {
      var numbers = [1,2,3,4,5,6,7,1,2,3,4,5,1,2,3];
      var h = histogram(numbers, {type: 'integer', maxbins: 20});
      assert.deepEqual([1,2,3,4,5,6,7], h.map(util.accessor("value")));
      assert.deepEqual([3,3,3,2,2,1,1], h.map(util.accessor("count")));
    });

    it('should bin date values', function() {
      var dates = [
        new Date(1979, 5, 15),
        new Date(1982, 2, 19),
        new Date(1985, 4, 20)
      ];
      var h = histogram(dates);
      assert(h.bins.unit.type, 'year');
      assert.deepEqual(
        gen.range(1979, 1986).map(units.year.date),
        h.map(util.accessor("value"))
      );
      assert.deepEqual([1,0,0,1,0,0,1], h.map(util.accessor("count")));
    });

    it('should ignore null values among dates', function() {
      var dates = [
        null,
        new Date(1979, 5, 15),
        undefined,
        new Date(1982, 2, 19),
        NaN,
        new Date(1985, 4, 20)
      ];
      var h = histogram(dates);
      assert(h.bins.unit.type, 'year');
      assert.deepEqual(
        gen.range(1979, 1986).map(units.year.date),
        h.map(util.accessor("value"))
      );
      assert.deepEqual([1,0,0,1,0,0,1], h.map(util.accessor("count")));
    });

    it('should bin string values', function() {
      var strings = "aaaaaabbbbbccccccccdddddeeeeeeefffff".split('');
      var h = histogram(strings);
      assert.deepEqual(['a','b','c','d','e','f'], h.map(util.accessor("value")));
      assert.deepEqual([6,5,8,5,7,5], h.map(util.accessor("count")));
    });
  });

});
