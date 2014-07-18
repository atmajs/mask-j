/**
 *	IncludeJSBuild
 *
 *	``` $ atma ```
 **/

module.exports = {
	'settings': {
		io: {
			extensions: {
				js: ['condcomments:read', 'importer:read']
			}
		}
	},
	'import': {
		files: 'builds/**',
		output: 'lib/'
	},
	'jshint': {
		files: ['lib/jmask.embed.js'],
		jshint: JSHint()
	},
	
	'watch': {
		files: 'src/**',
		config: '#[import]'
	},
	
	'copy': {
		files: {
			'../mask/lib/mask.js' : '.import/mask.js'
		}
	},

	'defaults': ['import', 'jshint']
};




function JSHint() {

	return {
		options: {
			curly: true,
			eqeqeq: true,
			forin: false,
			immed: true,
			latedef: true,
			newcap: false,
			noarg: true,
			noempty: true,
			nonew: true,
			regexp: true,
			undef: true,
			unused: true,
			strict: true,
			trailing: true,

			boss: true,
			eqnull: true,
			es5: true,
			lastsemic: true,
			browser: true,
			node: true,
			onevar: false,
			evil: true,
			sub: true,
			expr: true
		},
		globals: {
			define: true,
			require: true,
			mask: true
		}
	};
}
