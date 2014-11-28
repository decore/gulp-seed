(function() {
    'use strict';

    var filter = require('gulp-filter'),
        fs = require('fs'),
        gulp = require('gulp'),
        gulpif = require('gulp-if'),
        gutil = require('gulp-util'),
        iconfont = require('gulp-iconfont'),
        imagemin = require('gulp-imagemin'),
        jade = require('gulp-jade'),
        newer = require('gulp-newer'),
        merge = require('merge-stream'),
        rename = require('gulp-rename'),
        spawn = require('gulp-spawn'),
        spritesmith = require('gulp.spritesmith'),
        plumber = require('gulp-plumber'),
        svg2png = require('gulp-svg2png'),
        sh = require('execSync');

    var densityCoefficients = {
        'LDPI': 0.75,
        'MDPI': 1,
        'HDPI': 1.5,
        'XHDPI': 2,
        'XXHDPI': 3,
        'XXXHDPI': 4,
    };

    // Let's make stylus happy
    if (!fs.existsSync('.cache/stylesheets')) {
        fs.mkdirSync('.cache');
        fs.mkdirSync('.cache/stylesheets');
        Object.keys(densityCoefficients).forEach(function(density) {
            fs.writeFileSync('.cache/stylesheets/sprites-' + density + '.styl', '');
        });
        fs.writeFileSync('.cache/stylesheets/iconfont.styl', '');
    }

    var onError = function(err) {
        gutil.beep();
        gutil.log(gutil.colors.red(err));
    };

    gulp.task('images', ['rasterize', 'sprites', 'imageMin']);

    function copyRaster(baseDir, src, dest) {
        var merged = merge();
        Object.keys(densityCoefficients).map(function(density) {
            merged.add(gulp.src(src + '/' + baseDir + '/raster/' + density + '/**/*.png')
                .pipe(newer(dest + '/' + density + '/' + baseDir))
                .pipe(gulp.dest(dest + '/' + density + '/' + baseDir)));
        });

        return merged;
    }

    gulp.task('rasterize', function() {
        var rasterize = function(src, dest, subdir) {
            var merged = merge();

            Object.keys(densityCoefficients).map(function(density) {

                merged.add(gulp.src(src)
                    .pipe(newer({
                        dest: dest,
                        ext: 'png'
                    }))
                    .pipe(plumber({
                        errorHandler: onError
                    }))
                    .pipe(svg2png(densityCoefficients[density]))
                    .pipe(gulp.dest(dest + '/' + density + '/' + subdir)));
            });

            return merged;
        };

        return merge(
            rasterize('app/images/*.svg', '.cache/images', ''),
            rasterize('app/images/icons/*.svg', '.cache/images', 'icons'),
            rasterize('app/images/sprites/*.svg', '.cache/images', 'sprites')
        );
    });

    gulp.task('copyRasterSprites', function() {
        return copyRaster('sprites', 'app/images', '.cache/images');
    });

    gulp.task('sprites', ['rasterize', 'copyRasterSprites'], function() {
        var merged = merge();

        Object.keys(densityCoefficients).forEach(function(density) {
            var spriteData = gulp.src('.cache/images/' + density + '/sprites/**/*.png')
                .pipe(newer('dist/images/' + density + '/sprites.png'))
                .pipe(plumber({
                    errorHandler: onError
                }))
                .pipe(spritesmith({
                    imgName: 'sprites.png',
                    cssName: 'sprites-' + density + '.styl',
                    cssFormat: 'stylus',
                    algorithm: 'binary-tree',
                    cssTemplate: 'gulp/templates/stylus.sprites.mustache',
                    cssVarMap: function(sprite) {
                        sprite.name = sprite.name + '-' + density;
                    }
                }));

            merged.add(
                spriteData.img
                .pipe(imagemin())
                .pipe(gulp.dest('.cache/images/' + density))
            );

            merged.add(spriteData.css
                .pipe(gulp.dest('.cache/stylesheets'))
            );
        });

        return merged;
    });

    gulp.task('copyRasterIcons', function() {
        return copyRaster('icons', 'app/images', '.cache/images');
    });

    gulp.task('copyRasterImages', function() {
        return copyRaster('.', 'app/images', '.cache/images');
    });

    gulp.task('imageMin', [
        'rasterize',
        'sprites',
        'copyRasterIcons',
        'copyRasterImages'
    ], function() {
        return merge(gulp.src(['.cache/images/**/*.png'])
            .pipe(newer('dist/images'))
            .pipe(plumber({
                errorHandler: onError
            }))
            .pipe(imagemin())
            .pipe(gulp.dest('dist/images'))
        );
    });

    var hasTtfAutohint = parseInt(sh.run('hash ttfautohint'), 10);
    if (hasTtfAutohint > 0) {
        gutil.log(gutil.colors.red('Please install ttfautohint'));
    }

    gulp.task('iconFont', function() {

        var fontName = 'AppIcons',
            ttfFilter = filter(['*.ttf']);

        return gulp.src('app/images/icons/font/*.svg')
            .pipe(newer('.cache/stylesheets/iconfont.styl'))
            .pipe(plumber({
                errorHandler: onError
            }))
            .pipe(iconfont({
                fontName: fontName,
                appendCodepoints: true
            }))
            .on('codepoints', function(codepoints) {
                gulp.src('gulp/templates/iconfont.jade')
                    .pipe(plumber({
                        errorHandler: onError
                    }))
                    .pipe(jade({
                        locals: {
                            glyphs: codepoints,
                            fontName: fontName,
                            fontPath: 'fonts/',
                            className: 'icon'
                        },
                    }))
                    .pipe(rename('iconfont.styl'))
                    .pipe(gulp.dest('.cache/stylesheets'));
            })
            .pipe(gulpif(hasTtfAutohint, ttfFilter))
            .pipe(gulpif(hasTtfAutohint, spawn({
                cmd: '/bin/sh',
                args: ['-c', 'cat | ttfautohint --symbol /dev/stdin /dev/stdout | cat']
            })))
            .pipe(gulpif(hasTtfAutohint, ttfFilter.restore()))
            .pipe(gulp.dest('dist/fonts'));
    });

    gulp.task('watchImages', function() {
        gulp.watch(['app/images/**/*.svg', 'app/images/**/*.png'], ['images']);
        gulp.watch(['app/images/icons/font/*.svg'], ['iconFont', 'sprites', 'stylesheets']);
    });

})();
