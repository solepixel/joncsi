/**
 * Gulp task config file.
 */

'use strict';

var pkg     = require( './package.json' ),
    gulp    = require( 'gulp' ),
	globs   = require( 'gulp-src-ordered-globs' ),
	toolkit = require( 'gulp-wp-toolkit' ),
	zip     = require( 'gulp-zip' );

toolkit.extendConfig(
	{
		theme: {
			name: pkg.theme.name,
			themeuri: pkg.theme.uri,
			description: pkg.description,
			author: pkg.author,
			authoruri: pkg.theme.authoruri,
			version: pkg.version,
			license: pkg.license,
			licenseuri: pkg.theme.licenseuri,
			tags: pkg.theme.tags,
			textdomain: pkg.theme.textdomain,
			domainpath: pkg.theme.domainpath,
			template: pkg.theme.template,
			notes: pkg.theme.notes
		},
		src: {
			php: ['**/*.php', '!vendor/**'],
			images: 'resources/img/**/*',
			scss: 'resources/scss/**/*.scss',
			css: ['**/*.css', '!node_modules/**', '!develop/vendor/**'],
			js: ['resources/js/**/*.js', '!node_modules/**', '!resources/js/*.js'],
			json: ['**/*.json', '!node_modules/**'],
			i18n: './resources/lang/',
			sassdoc: './resources/scss/**/*.scss',
			zip: [
				'./**/*',
				'!./*.zip',
				'!./git',
				'!./git/**/*',
				'!./node_modules',
				'!./node_modules/**/*',
				'!./vendor',
				'!./vendor/**/*',
				'./vendor/autoload.php',
				'./vendor/composer/*.php',
				'./vendor/composer/installed.json',
				'./vendor/seothemes/core/src/*.php',
				'./vendor/tgmpa/tgm-plugin-activation/languages/*',
				'./vendor/tgmpa/tgm-plugin-activation/class-tgm-plugin-activation.php'
			]
		},
		css: {
			basefontsize: 10, // Used by postcss-pxtorem.
            remmediaquery: false,
			scss: {
				'style': {
					src: 'resources/scss/style.scss',
					dest: './',
					outputStyle: 'expanded'
				},
				'admin': {
					src: 'resources/scss/admin.scss',
					dest: './',
					outputStyle: 'expanded'
				},
				'woocommerce': {
					src: 'resources/scss/vendor/woocommerce/__index.scss',
					dest: './',
					outputStyle: 'expanded'
				}
			},
			sassdoc: {
                dest: './sassdoc'
            }
		},
		js: {
			'theme' : [
				'resources/js/vendor/**/*.js',
				'resources/js/custom/**/*.js'
			]
		},
		dest: {
            i18npo: './resources/lang/',
            i18nmo: './resources/lang/',
			images: './resources/img/',
			js: './resources/js/'
		},
		server: {
            proxy: 'http://joncsi.test',
			host: 'joncsi.test',
			open: 'external',
            port: '8000',
            /*https: {
            	   'key': '/Users/seothemes/.valet/Certificates/joncsi.test.key',
            	   'cert': '/Users/seothemes/.valet/Certificates/joncsi.test.crt'
            }*/
		}
	}
);

toolkit.extendTasks( gulp, {
	'zip': function() {
		return globs(toolkit.config.src.zip, {base: './'}).
		pipe(zip(pkg.name + '-' + pkg.version + '.zip')).
		pipe(gulp.dest('../'));
	},
    'sassdoc': function () {
    	return gulp.src(toolkit.config.src.sassdoc)
        .pipe(sassdoc(toolkit.config.css.sassdoc))
        .resume();
	}
} );
