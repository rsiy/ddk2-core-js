"use strict";

module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		// Metadata.
		pkg: grunt.file.readJSON("package.json"),
		
		banner: function (filename) {
			return "/* <%= pkg.title %>\n" +
			" * Filename: " + filename + "\n" +
			" * Version: <%= pkg.version %>\n" +
			" * Date: <%= grunt.template.today('yyyy-mm-dd HH:MM:ss') %>\n" +
			" * Copyright (c) <%= grunt.template.today('yyyy') %> PureShare, Inc.\n" +
			" */\n\n";
		},
		
		filename: function (settings) {
			settings = grunt.util._.defaults(settings || {}, { minify: false, flag: "standard" }); 
			return "<%= pkg.name %>" + (settings.flag ? "-" + settings.flag : "") + (settings.minify ? ".min" : "") + ".<%= pkg.extension %>";
		},

		// Task configuration.
		clean: {
			files: ["dist"]
		},
		
		concat: {
			options: {
				stripBanners: false,
				separator: ";" + grunt.util.linefeed
			},
			standard: {
				banner: "<%= banner(filename()) %>",
				src: ["js/*.js", "!js/*-LEGACY.js"], //
				dest: "dist/<%= filename() %>"
			},
			legacy: {
				banner: "<%= banner(filename({ flag: 'legacy' })) %>",
				src: ["js/*.js", "!js/*-STANDARD.js"], // 
				dest: "dist/<%= filename({ flag: 'legacy' }) %>"
			}
		},

		jshint: {
			all: ["js/101-ddk-global-object.js"]
		},
		
		uglify: {
			standard: {
				banner: "<%= banner(filename({ minify: true })) %>",
				src: "<%= concat.standard.dest %>",
				dest: "dist/<%= filename({ minify: true }) %>"
			},
			legacy: {
				banner: "<%= banner(filename({ minify: true, flag: 'legacy' })) %>",
				src: "<%= concat.legacy.dest %>",
				dest: "dist/<%= filename({ minify: true, flag: 'legacy' }) %>"
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
