'use strict';

var config = {
  directory : './.cache-test'
};

var fs = require('fs-extra'),
pkg = require('../package.json'),
should = require('should'),
_ = require('underscore');


function removeCacheDir(done){
 fs.remove(config.directory, done);
}

before(removeCacheDir);


describe('versioning', function(){
  var cache = require('..')(config);

  it('should have a version', function(){
    cache.should.have.property('version');
  });

  it('should equal package version', function(){
    cache.version.should.be.exactly(pkg.version);
  });
});

describe('cachy storage interface exists', function(){
  var cache = require('..')(config);

  var fxns = ['write', 'has', 'read', 'remove', 'clear', 'keys', 'size'];
  describe('interface has', function(){
    _.each(fxns, function(fxn){
      it(fxn + '()', function(){
	cache[fxn].should.be.a.Function;
      });
    });
  });
});

describe('directory creation', function(){
  before(removeCacheDir);

  it('should not have the cache directory', function(done){
    fs.exists(config.directory, function(exists){
      exists.should.be.false;
      done();
    });
  });

  it('should create the cache directory on write', function(done){
    var cache = require('..')(config);

    cache.write('key', 'value', function(err){
      if(err) return done(err);

      fs.exists(config.directory, function(exists){
	exists.should.be.true;
	done();
      });
    });
  });

  after(removeCacheDir);
});

describe('operations', function(done){

  before(removeCacheDir);

  var cache = require('..')(config);
  var samples = [
    {key : 'some-string', data : 'This is a plain string'}, 
    {key : 'some-number', data : 12345678},
    {key : 'an-object', data : {first : 'first item', second : 12345}}];

  var keys = _.pluck(samples, 'key');

  describe('write()', function(){
    _.each(samples, function(item){
      it('should write ' + item.key, function(done){ 
	cache.write(item.key, item.data, done);
      });     
    });
  });

  describe('read()', function(){
    _.each(samples, function(item){
      it('should read ' + item.key, function(done){ 
	cache.read(item.key, function(err, data){
	  if(err) return done(err);
	  data.should.eql(item.data);
	  return done();
	});
      });
    });
  });

  describe('keys()', function(){
    it('should retrieve matching keys', function(done){
      cache.keys(function(err, results){
	
	if(err) return done(err);
	
	results.should.have.length(keys.length);	
	_.each(keys, function(key){
	  _.contains(keys, key).should.be.true;
	});	
      });
      return done();
    });
  }); 

  describe('size()', function(){
    it('should match', function(done){
      cache.size(function(size){
	size.should.be.a.Number;
	size.should.equal(samples.length);
	done();
      });
    });
  });

  describe('has()', function(){
    _.each(keys, function(key){
      it('should have key "' + key + '"', function(done){
	cache.has(key, function(has){
	  has.should.be.true;
	  done();
	});
      });
    });	

    _.each(['badkey', 'nonexistkey', '120394'], function(key){
      it('should not have key "' + key + '"', function(done){
	cache.has(key, function(has){
	  has.should.be.false;
	  done();
	});
      });
    });	    
  });

  describe('remove()', function(){
    
    it('should remove key "' + keys[0] + '"', function(done){
      cache.remove(keys[0], done);
    });
    
    it('should not have key "' + keys[0] + '"', function(done){
      cache.has(keys[0], function(has){
	has.should.be.false;
	done();
      });
    });

    it('should still have key "' + keys[1] + '"', function(done){
      cache.has(keys[1], function(has){
	has.should.be.true;
	done();
      });
    });
  });


  describe('clear()', function(){
    it('should clear cache', function(done){
      cache.clear(function(err){
	if(err) return done(err);
	cache.size(function(size){
	  size.should.equal(0);
	  done();
	});	
      });
    });
  });

  after(removeCacheDir);
});

/* add more tests */

after(removeCacheDir);
