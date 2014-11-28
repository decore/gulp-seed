(function() {
    'use strict';

    var csso = require('gulp-csso'),
        gulp = require('gulp'),
        plumber = require('gulp-plumber'),
        stylus = require('gulp-stylus'),
        newer = require('gulp-newer'),
        nib = require('nib'),
        gutil = require('gulp-util');

    gulp.task('stylesheets', ['dependencies', 'iconFont', 'sprites'], function() {
        return gulp.src('app/stylesheets/app.styl')
            .pipe(newer('dist/app.css'))
            .pipe(plumber({
                errorHandler: function(err) {
                    gutil.log(gutil.colors.red(err));
                }
            }))
            .pipe(stylus({
                use: nib(),
                compress: true,
                sourcemap: {
                    inline: true,
                    sourceRoot: 'app/stylesheets',
                    basePath: '/'
                }
            }))
            .pipe(csso())
            .pipe(gulp.dest('dist'));
    });

    gulp.task('watchStylesheets', function() {
        gulp.watch(['app/stylesheets/**/*.styl'], ['stylesheets']);
    });

}());
