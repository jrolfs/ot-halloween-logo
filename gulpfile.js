const gulp = require('gulp');
const util = require('gulp-util');
const rename = require('gulp-rename');
const stream = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const watchify = require('watchify');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourceMaps = require('gulp-sourcemaps');
const del = require('del');
const concat = require('gulp-concat');
const browserify = require('browserify');
const browserSync = require('browser-sync');
const normalize = require('normalize.css/package.json');


//
// Configuration

const source = 'src/';
const build = 'build/';

const src = {
  html: `${source}html/**/*.html`,
  img: `${source}img/**/*.png`,
  scss: [`${source}css/**/*.scss`, `!${source}css/**/normalize.scss`],
  js: `${source}js/main.js`
};

const out = {
  html: build,
  img: `${build}img/`,
  css: `${build}css/`,
  js: `${build}js/`
};


//
// Browserify

const bundler = watchify(browserify(src.js, Object.assign(watchify.args, { debug: true })));

bundler.transform('babelify', { presets: ['es2015'] });

function bundle() {
  const handleError = (error) => {
    util.log(error.message);
    browserSync.notify('Browserify Error!');
    this.emit('end');
  };

  return bundler.bundle()
    .on('error', handleError)
    .pipe(stream('app.js'))
    .pipe(buffer())
    .pipe(sourceMaps.init({ loadMaps: true }))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(out.js))
    .pipe(browserSync.reload({ stream: true, once: true }));
}

bundler.on('update', bundle);


//
// Tasks

gulp.task('html', () => gulp.src(src.html).pipe(gulp.dest(out.html)));

gulp.task('img', () => gulp.src(src.img).pipe(gulp.dest(out.img)));

gulp.task('normalize', () => {
  const main = normalize.main;

  return gulp.src(`node_modules/normalize.css/${main}`)
    .pipe(rename('css/normalize.scss'))
    .pipe(gulp.dest(source));
});

gulp.task('sass', gulp.series('normalize', () =>
  gulp.src(src.scss)
    .pipe(sourceMaps.init())
    .pipe(sass({ outputStyle: 'nested' }))
    .pipe(concat('app.css'))
    .pipe(sourceMaps.write({ includeContent: false }))
    .pipe(sourceMaps.init({ loadMaps: true }))
    .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
    .pipe(sourceMaps.write())
    .pipe(gulp.dest(out.css))
    .pipe(browserSync.reload({ stream: true }))
));

gulp.task('browserify', () => bundle());

gulp.task('clean', () => del(['build/**/*']));

gulp.task('serve', gulp.series('html', 'sass', 'img', 'browserify', () => {
  browserSync({
    server: build,
    browser: 'google chrome canary'
  });

  gulp.watch(src.scss, gulp.series('sass'));
  gulp.watch(src.html).on('change', gulp.series('html', browserSync.reload));
  gulp.watch(src.img).on('change', gulp.series('img', browserSync.reload));
}));
