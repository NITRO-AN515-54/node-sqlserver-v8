var sql = require('../'),
    assert = require('assert'),
    async = require('async'),
    config = require('./test-config'),
    fs = require('fs');

var conn_str = config.conn_str;

suite('userbind', function () {

    var c;
    this.timeout(20 * 1000);

    setup(function (test_done) {
        test_done();
    });

    teardown(function (done) {
        done();
    });

    var open = function (done) {
        sql.open(conn_str, function (err, conn) {
            if (err) {
                console.error(err);
                process.exit();
            }
            done(conn);
        });
    };

    function testUserBind(params, cb) {

        open(function(conn) {

            var allres = [];

            var sequence = [

                function (async_done) {
                    conn.query(params.query, [params.setter(params.min)], function (err, res) {
                        if (err) {
                            cb(err, res);
                        }
                        allres.push(res[0]);
                        async_done();
                    });
                },

                function (async_done) {
                    conn.query(params.query, [params.setter(params.max)], function (err, res) {
                        if (err) {
                            cb(err, res);
                        }
                        allres.push(res[0]);
                        async_done();
                    });
                },

                function (async_done) {
                    conn.query(params.query, [params.setter(null)], function (err, res) {
                        if (err) {
                            cb(err, res);
                        }
                        allres.push(res[0]);
                        async_done();
                    });
                },

                function (async_done) {
                    async_done();
                }];

            async.series(sequence,
                function () {
                    cb(null, allres);
                });
        });
    }

    function compare(params, res) {
        assert.deepEqual(res,
            [
                {
                    v: params.min
                },
                {
                    v: params.max
                },
                {
                    v: null
                }
            ]);
    }

    test('user bind float', function(test_done) {
        var params = {
            query : 'declare @v float = ?; select @v as v',
            type : 'float',
            min : -1.7976931348623158E+308,
            max : 1.7976931348623158E+308,
            setter : function(v) {
                return sql.Float(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });

    test('user bind bit', function(test_done) {
        var params = {
            query : 'declare @v bit = ?; select @v as v',
            type : 'bit',
            min : false,
            max : true,
            setter : function(v) {
                return sql.Bit(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });

    test('user bind bigint', function(test_done) {

        var params = {
            query : 'declare @v bigint = ?; select @v as v',
            type : 'bigint',
            min : -9007199254740991,
            max : 9007199254740991,
            setter : function(v) {
                return sql.BigInt(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });

    test('user bind int', function(test_done) {

        var params = {
            query : 'declare @v int = ?; select @v as v',
            type : 'int',
            min : -2147483648,
            max : 2147483647,
            setter : function(v) {
                return sql.Int(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });

    test('user bind tinyint', function(test_done) {

        var params = {
            query : 'declare @v tinyint = ?; select @v as v',
            type : 'tinyint',
            min : 0,
            max : 255,
            setter : function(v) {
                return sql.TinyInt(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });

    test('user bind smallint', function(test_done) {

        var params = {
            query : 'declare @v smallint = ?; select @v as v',
            type : 'smallint',
            min : -32768,
            max : 32767,
            setter : function(v) {
                return sql.SmallInt(v);
            }
        };
        testUserBind(params, function(err, res) {
            assert.ifError(err);
            compare(params, res);
            test_done();
        });
    });
});


