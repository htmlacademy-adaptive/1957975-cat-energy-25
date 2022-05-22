import gulp from 'gulp';
import plumber from 'gulp-plumber';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import htmlmin from 'gulp-htmlmin';
import terser from 'gulp-terser';
import squoosh from 'gulp-libsquoosh';
import svgo from 'gulp-svgmin';
import svgstore from 'gulp-svgstore';
import del from 'del';
import browser from 'browser-sync';

// Styles
//  1. //НАЙТИ НУЖНЫЕ  НАМ ФАЙЛЫ
//  2. //СДЕЛАЙ СНИМИ ЧТО-НИБУДЬ
//  3. //ПОЛОЖИ В НУЖНУЮ ПАПКУ
export const styles = () => {
  return gulp.src('source/less/style.less', { sourcemaps: true })  //  1. // style.less
    .pipe(plumber()) //  2. //обработка ошибок
    .pipe(less())    // style.less -> style.css превращает less в css
    .pipe(postcss([  // приходит style.css
      autoprefixer(), // style.css -> style.css[prefix]  уже приходит css с префиксом . Тут мы скачали установмили пакет с  минификацией npm i -D postcss-csso
      csso()          // style.css[prefix] -> style.css[prefix, min]
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' })) //  3. // положи эти файлы в папку source/css и положи карты кодат в эту же папку { sourcemaps: '.' }
    .pipe(browser.stream());
}

//  HTML
// мы хотим минифицировать весь html. идем в гугл  и ищем gulp minify html переходим по ссылкам  до установкипакетов с гита (npm install html-minifier -g)
// что бы испольозвать библиотеку которую мы  установили, идем опять в гугл на гит откуда, скачивали библиотеку (https://github.com/jonschlinkert/gulp-htmlmin) смотрим вкладку (Usage)
// export const имя  файла (export нужен на статии создания зачади что бы проверить работает ли она )
const html = () => {
  return gulp.src('source/*.html')                              // gulp возьми все  вайлы *.html в папке source
  .pipe(htmlmin( { collapseWhitespace: true }))                // сделай минификацию //
  .pipe(gulp.dest('build'));                                  // положи их в папку source
}


// Scripts
const scripts = () => {
  return gulp.src('source/js/script.js')
    .pipe(terser())
    .pipe(gulp.dest('build/js'));
}

// Images
const optimizeImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh())
    .pipe(gulp.dest('build/img'))
}

const copyImages = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(gulp.dest('build/img'))
}

// WebP
const createWebp = () => {
  return gulp.src('source/img/**/*.{png,jpg}')
    .pipe(squoosh({webp: {}}))
    .pipe(gulp.dest('build/img'))
}

// SVG
const svg = () =>
gulp.src('source/img/**/*.{svg}')
  .pipe(svgo())
  .pipe(gulp.dest('build/img'));

const sprite = () => {
  return gulp.src('source/img/icons/*.svg')
    .pipe(svgo())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename('sprite.svg'))
    .pipe(gulp.dest('build/img'));
}

// Copy
const copy = (done) => {
  gulp.src(['source/fonts/*.{woff2,woff}','source/*.ico',], {
    base: 'source'
  })
    .pipe(gulp.dest('build'))
  done();
}

// Clean
const clean = () => {
  return del('build');
};

// Server
const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Reload
const reload = (done) => {
  browser.reload();
  done();
}

// Watcher
const watcher = () => {
  gulp.watch('source/less/**/*.less', gulp.series(styles));
  gulp.watch('source/js/script.js', gulp.series(scripts));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

// Build
export const build = gulp.series(
  clean,
  copy,
  optimizeImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
);

// Default
export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    html,
    scripts,
    svg,
    sprite,
    createWebp
  ),
  gulp.series(
    server,
    watcher
  )
);
