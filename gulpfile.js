var gulp = require('gulp');
var imagemin = require('gulp-imagemin');
var newer = require('gulp-newer');
var postcss = require('gulp-postcss');
var plumber = require('gulp-plumber');
var include = require('gulp-include');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync');

function plumberHandler() {
    return plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    });
};

const config = {
    src: {
        views: `src/views/*.*`,
        styles: `src/styles/main.css`,
        scripts: `src/scripts/`,
        images: `src/images/**/*.*`,
        fonts: `src/fonts/`
    },
    dest: {
        root: `build/`,
        views: `build/`,
        styles: `build/assets/css/`,
        scripts: `build/assets/js/`,
        images: `build/assets/img/`,
        fonts: `build/assets/fonts`
    },
    watch: {
        views: `src/views/**/*.*`,
        styles: `src/styles/**/*.*`,
        scripts: `src/scripts/**/*.*`,
        images: `src/images/**/*.*`,
        fonts: `src/fonts/**/*.*`
    }
};


/**
 * Обработка views
 */
gulp.task('views', function() {
    return gulp.src(config.src.views)
        .pipe(plumberHandler())
        .pipe(gulp.dest(config.dest.views))
});


/**
 * Обработка шрифтов
 */
gulp.task('fonts', function() {
    return gulp.src(config.src.fonts)
        .pipe(plumberHandler())
        .pipe(newer(config.dest.fonts))
        .pipe(gulp.dest(config.dest.fonts));
});


/**
 * Обработка изображений
 */
gulp.task('images', function () {
    return gulp.src(config.src.images)
        .pipe(plumberHandler())
        .pipe(newer(config.dest.images))
        .pipe(imagemin())
        .pipe(gulp.dest(config.dest.images));
});


/**
 * Обработка скриптов
 */
gulp.task('scripts', function () {
    return gulp.src(config.src.scripts + 'scripts.js')
        .pipe(plumberHandler())
        .pipe(include({
            extensions: 'js',
            hardFail: false,
            includePaths: [
              __dirname + '/node_modules',
              __dirname + '/' + config.src.scripts
            ]
          }))
        .pipe(gulp.dest(config.dest.scripts));
});


/**
 * Обработка стилей
 */
var postcssplugins = [
    require('postcss-import')({
        path: ['node_modules']
    }),
    require('autoprefixer')({
        browsers: ['>1%', 'last 4 version']
    }),
    require('css-mqpacker')
];

gulp.task('styles', function () {
    return gulp.src(config.src.styles)
        .pipe(plumberHandler())
        .pipe(sourcemaps.init())
        .pipe(postcss(postcssplugins))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.dest.styles));
});


/**
 * Веб-сервер для разработки
 */
var bs = browserSync.create();
var root = config.dest.root;

var bsConfig = {
    server: {
        baseDir: root,
        directory: true
    },
    files: root + '**/*.*',
    host: 'localhost',
    port: 3000,
    notify: true,
    injectChanges: true,
    open: true,
    tunnel: false
};

gulp.task('server', function() {
    return bs.init(Object.assign(Object.create(null), bsConfig || {}));
});


/**
 * Watch-таски
 */
gulp.task('watch', function() {
    gulp.watch(config.watch.views, ['views']);
    gulp.watch(config.watch.styles, ['styles']);
    gulp.watch(config.watch.images, ['images']);
    gulp.watch(config.watch.fonts, ['fonts']);
    gulp.watch(config.watch.scripts, ['scripts']);
});


/**
 * Составные таски
 */
gulp.task('build', ['fonts', 'images', 'styles', 'scripts', 'views']);
gulp.task('default', ['build', 'watch', 'server']);