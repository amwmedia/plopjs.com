const markdown = require('metalsmith-markdown');
const registerHelpers = require('metalsmith-register-helpers');
const permalinks = require('metalsmith-permalinks');
const layouts = require('metalsmith-layouts');
const browserify = require('metalsmith-browserify-alt');
const stylus = require('metalsmith-stylus');
const browserSync = require('metalsmith-browser-sync');
const collections = require('metalsmith-collections');
const nib = require('nib');
const mdLeftNav = require('./plugins/md-left-nav');

const metalsmith = require('metalsmith');
console.log(process.env.NODE_ENV);
var ms = metalsmith(__dirname)
	.source('./content')
	.destination('./build')
	.clean(true)
	.use((files, metalsmith, done) => {
		setImmediate(done);
		metalsmith.metadata({
			name: 'PLOP',
			title: 'Consistency made simple.'
		});
	})
	.use(markdown())
	.use(mdLeftNav())
	.use(permalinks({ relative: false }))
	.use(registerHelpers())
	.use(layouts({
		engine: 'handlebars',
		partials: 'partials'
	}))
	.use(stylus({
		compress: true,
		sourcemap: process.env.NODE_ENV !== 'production',
		paths: ['./styles'],
		use: [nib()]
	}))
	.use(browserify({
		defaults: {
			cache: {},
			packageCache: {},
			transform: ['uglifyify'],
			plugin: process.env.NODE_ENV !== 'production' ? ['watchify'] : [],
			debug: process.env.NODE_ENV !== 'production'
		}
	}));

if (process.env.NODE_ENV !== 'production') {
	ms = ms.use(browserSync({
		ui: false,
		files: [
			'content/**',
			'styles/**',
			'scripts/**',
			'layouts/**',
			'partials/**',
			'helpers/**'
		],
		server: 'build',
		port: 5000,
		ghostMode: false,
		open: false
	}));
}

ms.build(function(err) {
	if (err) throw err;
});
