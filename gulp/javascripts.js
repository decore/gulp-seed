(function() {
    'use strict';

    var gulp = require('gulp'),
        gutil = require('gulp-util'),
        jshint = require('gulp-jshint'),
        stylish = require('jshint-stylish'),
        webpack = require('webpack');

    gulp.task('jshint', function() {
        return gulp.src([
                'gulp/**/*.js',
                'app/javascripts/**/*.js'
            ])
            .pipe(jshint())
            .pipe(jshint.reporter(stylish));
    });

    gulp.task('javascripts', ['dependencies'], function(callback) {
        webpack({
            entry: {
                app: './app/javascripts/app.js',
                tests: './app/tests/browser.js',
                vendor: []
            },
            output: {
                path: 'dist',
                filename: '[name].js'
            },
            plugins: [
                new webpack.ResolverPlugin([
                    new webpack.ResolverPlugin.DirectoryDescriptionFilePlugin('bower.json', ['main'])
                ], ['normal', 'loader']),
                new webpack.optimize.UglifyJsPlugin(),
                new webpack.optimize.AggressiveMergingPlugin()
            ],
            resolve: {
                modulesDirectories: ['./node_modules', './app/dependencies'],
            },
        }, function(err, stats) {
            if (err) {
                throw new gutil.PluginError('webpack', err);
            }

            gutil.log('[webpack]', stats.toString({

            }));

            callback();
        });
    });

    gulp.task('watchJavascripts', ['javascripts'], function() {
        gulp.watch(['app/javascripts/**/*.js'], ['javascripts']);
    });

}());
