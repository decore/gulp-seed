(function() {
    'use strict';

    var gulp = require('gulp'),
        plumber = require('gulp-plumber'),
        newer = require('gulp-newer'),
        jade = require('gulp-jade'),
        gutil = require('gulp-util');

    function onError(err) {
        gutil.log(gutil.colors.red(err));
    }

    gulp.task('templates', function() {
        return gulp.src([
                'app/templates/**/*.jade',
            ])
            .pipe(newer({
                dest: 'dist',
                ext: '.html'
            }))
            .pipe(plumber({
                errorHandler: onError
            }))
            .pipe(jade())
            .pipe(gulp.dest('dist'));
    });

    gulp.task('watchTemplates', function() {
        gulp.watch([
            'app/templates/**/*.jade',
        ], ['templates']);
    });

}());
