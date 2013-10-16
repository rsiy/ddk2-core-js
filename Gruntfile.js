"use strict";

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: {
			title: "DDK 2 Client JavaScript Library",
			name: "ddk2",
			extension: "js"
		},
		
		banner: "/* <%= pkg.title %>\n" +
		" * <%= pkg.name %>.<%= pkg.extension %>\n" +
		" * <%= grunt.template.today('yyyy-mm-dd HH:MM:ss') %>\n" +
		" * Copyright (c) <%= grunt.template.today('yyyy') %> PureShare, Inc.\n" +
		" */\n\n",

		// Task configuration.
		clean: {
			files: ["dist"]
		},
		
		concat: {
			options: {
				banner: "<%= banner %>",
				stripBanners: true,
				separator: ";" + grunt.util.linefeed
			},
			dist: {
				src: ["js/*.js"],
				dest: "dist/<%= pkg.name %>.<%= pkg.extension %>"
			}
		},

		jshint: {
			all: ["js/101-ddk-global-object.js"]
		},
		
		uglify: {
			options: {
				banner: "<%= banner %>"
			},
			dist: {
				src: "<%= concat.dist.dest %>",
				dest: "dist/<%= pkg.name %>.min.<%= pkg.extension %>"
			}
		}
	});

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	//grunt.loadNpmTasks("grunt-contrib-qunit");
	grunt.loadNpmTasks("grunt-contrib-jshint");

	// Default task.
	grunt.registerTask("default", [/*"qunit",*/ /*"jshint,"*/ "clean", "concat", "uglify"]);

};
