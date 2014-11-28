(function() {
    'use strict';

    require('./images');
    require('./javascripts');
    require('./stylesheets');
    require('./templates');
    require('./test');

    var gulp = require('gulp'),
        gutil = require('gulp-util'),
        del = require('del'),
        fs = require('fs'),
        bower = require('gulp-bower'),
        livereload = require('gulp-livereload');

    gulp.task('dependencies', ['bowerInstall']);

    gulp.task('bowerInstall', function() {
        if (!fs.existsSync('app/dependencies')) {
            return bower();
        }
    });

    gulp.task('clean', function(cb) {
        return del(['dist'], cb);
    });

    gulp.task('static', function(next) {
        var file = new(require('node-static')).Server('dist', {
            headers: {
                'Access-Control-Allow-Origin': '*' // CORS
            },
        });

        require('http').createServer(function(request, response) {
            request.addListener('end', function() {
                file.serve(request, response);
            }).resume();
        }).listen(7000, '127.0.0.1', function() {
            gutil.log(gutil.colors.green('Static server is up on 127.0.0.1:' + 7000));
            next();
        });
    });

    gulp.task('build', [
        'images',
        'javascripts',
        'stylesheets',
        'templates'
    ]);

    gulp.task('watch', [
        'build',
        'watchImages',
        'watchJavascripts',
        'watchStylesheets',
        'watchTemplates',
        'static'
    ], function() {
        var server = livereload();
        server.changed('/');

        gulp.watch(['dist/static/**/*'])
            .on('change', function(file) {
                server.changed(file.path);
            });
    });

    gulp.task('dist', ['pack']);

    gulp.task('default', ['build', 'watch']);

}());
