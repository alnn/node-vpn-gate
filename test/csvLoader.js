'use strict';

var assert      = require('chai').assert,
    should      = require('should'),
    appConfig   = require('./../configs/config'),
    csvLoader   = require('./../lib/csvLoader');

describe('csvLoader', function() {

    this.timeout(30000);

    describe('csvLoader.load', function() {

        it('should be string after loading', function(done) {

            csvLoader.load().then(function(csv) {
                assert('string' === typeof csv);
                done();
            });

        });


        it('should pull data from external source', function(done) {

            csvLoader.load(null, true).then(function(csv) {
                var result = csvLoader.isPulled();

                result.should.equal(true);

                done();
            });

        });


        it('should have no errors', function(done) {

            csvLoader.load().then(function(csv) {

                assert.equal(csvLoader.getErrors().length, 0);

                done();
            });

        });

        it('should have csv lines', function(done) {

            csvLoader.load(function(csv) {
                return csvLoader.getSearch([], {commentChar: '*'})();
            }).then(function(lines) {

                lines.should.be.instanceof(Array);
                lines.length.should.not.equal(0);

                done();
            });

        });

    });

    describe('csvLoader.getSearch', function() {

        var csvString = 'id,name\n1,John\n2,Sarah\n3,Lana';

        it('should return array of csv lines', function() {

            var search = csvLoader.getSearch([], {commentChar: '*'}, csvString);

            search().should.be.instanceof(Array);
        });

        it('should return array of csv lines with name "Lana"', function() {

            var search = csvLoader.getSearch('name', {commentChar: '*'}, csvString),
                result = search('lana');

            result.should.be.instanceof(Array);
            assert.equal(result[0].name, 'Lana');

        });
    });

});
