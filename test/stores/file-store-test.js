/*
 * file-store-test.js: Tests for the nconf File store.
 *
 * (C) 2011, Charlie Robbins and the Contributors.
 *
 */

var fs = require('fs'),
    path = require('path'),
    vows = require('vows'),
    assert = require('assert'),
    nconf = require('../../lib/nconf'),
    yamlFormat = require('nconf-yaml'),
    data = require('../fixtures/data').data,
    store;

vows.describe('nconf/stores/file').addBatch({
  "When using the nconf file store": {
    "with a valid JSON file": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'store.json');
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        this.store = store = new nconf.File({ file: filePath });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
          assert.deepEqual(data, this.store.store);
        }
      }
    },
    "with a malformed JSON file": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'malformed.json');
        this.store = new nconf.File({ file: filePath });
        return null;
      },
      "the load() method with a malformed JSON config file": {
        topic: function () {
          this.store.load(this.callback.bind(null, null));
        },
        "should respond with an error and indicate file name": function (_, err) {
          assert.isTrue(!!err);
          assert.match(err, /malformed\.json/);
        }
      }
    },
    "with a valid UTF8 JSON file that contains a BOM": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'bom.json');
        this.store = store = new nconf.File({ file: filePath });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
		      assert.deepEqual(data, this.store.store);
        }
      },
      "the loadSync() method": {
        topic: function () {
          var data = this.store.loadSync();
          return data;
        },
        "should load the data correctly": function (result) {
          assert.deepEqual(result, this.store.store);
        }
      }
    },
    "with a valid UTF8 JSON file that contains no BOM": {
      topic: function () {
        var filePath = path.join(__dirname, '..', 'fixtures', 'no-bom.json');
        this.store = store = new nconf.File({ file: filePath });
        return null;
      },
      "the load() method": {
        topic: function () {
          this.store.load(this.callback);
        },
        "should load the data correctly": function (err, data) {
          assert.isNull(err);
          assert.deepEqual(data, this.store.store);
        }
      },
      "the loadSync() method": {
        topic: function () {
          var data = this.store.loadSync();
          return data;
        },
        "should load the data correctly": function (result) {
          assert.deepEqual(result, this.store.store);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json'),
          tmpStore = new nconf.File({ file: tmpPath });
      return tmpStore;
    },
    "the save() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        tmpStore.save(function () {
          fs.readFile(tmpStore.file, function (err, d) {
            fs.unlinkSync(tmpStore.file);

            return err
              ? that.callback(err)
              : that.callback(err, JSON.parse(d.toString()));
          });
        });
      },
      "should save the data correctly": function (err, read) {
        assert.isNull(err);
        assert.deepEqual(read, data);
      }
    },
    "the saveToFile() method": {
      topic: function (tmpStore) {
        var that = this,
            pathFile = '/tmp/nconf-save-toFile.json';

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        tmpStore.saveToFile(pathFile, function () {
          fs.readFile(pathFile, function (err, d) {
            fs.unlinkSync(pathFile);

            return err
              ? that.callback(err)
              : that.callback(err, JSON.parse(d.toString()));
          });
        });
      },
      "should save the data correctly": function (err, read) {
        assert.isNull(err);
        assert.deepEqual(read, data);
      }
    },
    "the saveToFile() method with custom format": {
      topic: function (tmpStore) {
        var that = this,
            pathFile = '/tmp/nconf-save-toFile.yaml';

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        tmpStore.saveToFile(pathFile, yamlFormat, function () {
          fs.readFile(pathFile, function (err, d) {
            fs.unlinkSync(pathFile);
            return err
              ? that.callback(err)
              : that.callback(err, yamlFormat.parse(d.toString()));
          });
        });
      },
      "should save the data correctly": function (err, read) {
        assert.isNull(err);
        assert.deepEqual(read, data);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var tmpPath = path.join(__dirname, '..', 'fixtures', 'tmp.json'),
          tmpStore = new nconf.File({ file: tmpPath });
      return tmpStore;
    },
    "the saveSync() method": {
      topic: function (tmpStore) {
        var that = this;

        Object.keys(data).forEach(function (key) {
          tmpStore.set(key, data[key]);
        });

        var saved = tmpStore.saveSync();

        fs.readFile(tmpStore.file, function (err, d) {
          fs.unlinkSync(tmpStore.file);

          return err
            ? that.callback(err)
            : that.callback(err, JSON.parse(d.toString()), saved);
        });
      },
      "should save the data correctly": function (err, read, saved) {
        assert.isNull(err);
        assert.deepEqual(read, data);
        assert.deepEqual(read, saved);
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    "the set() method": {
      "should respond with true": function () {
        assert.isTrue(store.set('foo:bar:bazz', 'buzz'));
        assert.isTrue(store.set('falsy:number', 0));
        assert.isTrue(store.set('falsy:string', ''));
        assert.isTrue(store.set('falsy:boolean', false));
        assert.isTrue(store.set('falsy:object', null));
      }
    },
    "the get() method": {
      "should respond with the correct value": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.equal(store.get('falsy:number'), 0);
        assert.equal(store.get('falsy:string'), '');
        assert.equal(store.get('falsy:boolean'), false);
        assert.equal(store.get('falsy:object'), null);
      }
    },
    "the clear() method": {
      "should respond with the true": function () {
        assert.equal(store.get('foo:bar:bazz'), 'buzz');
        assert.isTrue(store.clear('foo:bar:bazz'));
        assert.isTrue(typeof store.get('foo:bar:bazz') === 'undefined');
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    "the search() method": {
      "when the target file exists higher in the directory tree": {
        topic: function () {
          var searchBase = this.searchBase = process.env.HOME;
          var filePath = this.filePath = path.join(searchBase, '.nconf');
          fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
          return new (nconf.File)({
            file: '.nconf'
          })
        },
        "should update the file appropriately": function (store) {
          store.search(this.searchBase);
          assert.equal(store.file, this.filePath);
          fs.unlinkSync(this.filePath);
        }
      },
      "when the target file doesn't exist higher in the directory tree": {
        topic: function () {
          var filePath = this.filePath = path.join(__dirname, '..', 'fixtures', 'search-store.json');
          return new (nconf.File)({
            dir: path.dirname(filePath),
            file: 'search-store.json'
          })
        },
        "should update the file appropriately": function (store) {
          store.search();
          assert.equal(store.file, this.filePath);
        }
      }
    }
  }
}).addBatch({
  "When using the nconf file store": {
    topic: function () {
      var secureStore = new nconf.File({
        file: path.join(__dirname, '..', 'fixtures', 'secure.json'),
        secure: 'super-secretzzz'
      });

      secureStore.store = data;
      return secureStore;
    },
    "the stringify() method should encrypt properly": function (store) {
      var contents = JSON.parse(store.stringify());
      Object.keys(data).forEach(function (key) {
        assert.isObject(contents[key]);
        assert.isString(contents[key].value);
        assert.equal(contents[key].alg, 'aes-256-cbc');
      });
    },
    "the parse() method should decrypt properly": function (store) {
      var contents = store.stringify();
      var parsed = store.parse(contents);
      assert.deepEqual(parsed, data);
    },
    "the load() method should decrypt properly": function (store) {
      store.load(function (err, loaded) {
        assert.isNull(err);
        assert.deepEqual(loaded, data);
      });
    },
    "the loadSync() method should decrypt properly": function (store) {
      var loaded = store.loadSync()
      assert.deepEqual(loaded, data);
    }
  }
}).addBatch({
  "When using a legacy nconf file store": {
    topic: function () {
      var secureStore = new nconf.File({
        file: path.join(__dirname, '..', 'fixtures', 'insecure.json'),
        secure: 'super-secretzzz'
      });

      secureStore.store = data;
      return secureStore;
    },
    "the stringify() method should encrypt properly": function (store) {
      var contents = JSON.parse(store.stringify());
      Object.keys(data).forEach(function (key) {
        assert.isObject(contents[key]);
        assert.isString(contents[key].value);
        // Note: accept insecure aes-256-ctr entries but don't write them.
        assert.equal(contents[key].alg, 'aes-256-cbc');
      });
    },
    "the parse() method should decrypt properly": function (store) {
      var contents = store.stringify();
      var parsed = store.parse(contents);
      assert.deepEqual(parsed, data);
    },
    "the load() method should decrypt properly": function (store) {
      store.load(function (err, loaded) {
        assert.isNull(err);
        assert.deepEqual(loaded, data);
      });
    },
    "the loadSync() method should decrypt properly": function (store) {
      var loaded = store.loadSync()
      assert.deepEqual(loaded, data);
    }
  }
}).export(module);

