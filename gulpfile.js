/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gulp = require('gulp');
var del = require('del');
var uglify = require('gulp-uglify');
var uglifyCss = require('gulp-uglifycss');
var filter = require('gulp-filter');

/*
 * Tasks:
 * clean dist
 * copy build->dist
 *    all js linted
 *    all css linted, error if any failures
 *    all js minified, error if any failures
 *    all css minified
 *    
 * 
 */

gulp.task('clean', function () {
    return del(['dist']);
});

function onError(err) {
    console.log('ERROR');
    console.log(err);
    process.exit(1);
    // this.emit('end');
}

gulp.tasl('build')

gulp.task('dist', function () {
    var jsFilter = filter('**/*.js', {restore: true}),
        cssFilter = filter('**/*.css', {restore: true});
        
    // TODO: hard to believe that gulp doesn't have a way to place an 
    // error handler on the entire pipeline, or maybe it is that uglify() 
    // doesn't play well with it? In any case, can't catch erros on uglify
    // unless the error event handler is placed directly on it.
    return gulp.src('build/client/**')
        .pipe(jsFilter)
        .pipe(uglify().on('error', onError))
        .pipe(jsFilter.restore)
        .pipe(cssFilter)
        .pipe(uglifyCss())
        .pipe(cssFilter.restore)
        .pipe(gulp.dest('dist'));

});


