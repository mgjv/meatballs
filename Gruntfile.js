/* globals module:true */

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
	    pkg: grunt.file.readJSON('package.json'),
	    mocha_istanbul: {
		    coverage: {
		        src: 'test', // a folder works nicely
		    }
		},
	    mochaTest: {
			test: {
				options: {
					reporter: 'spec',
					// captureFile: 'results.txt', // Optionally capture the reporter output to a file
					// quiet: false, // Optionally suppress output to standard out (defaults to false)
					// clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
				},
				src: ['test/**/*.js']
			}
		}
	})

	grunt.loadNpmTasks('grunt-mocha-test');
	grunt.loadNpmTasks('grunt-mocha-istanbul')

	grunt.registerTask('coverage', ['mocha_istanbul:coverage'])
	grunt.registerTask('test', ['mochaTest'])
	  
	// Default task(s).
	grunt.registerTask('default', ['test']);

};


