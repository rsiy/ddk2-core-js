'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Metadata.
	  banner: '/* DDK 2.0.0\n' +
		' * Client JavaScript Library\n' +
		' * <%= grunt.template.today("yyyy-mm-dd HH:MM:ss") %>\n' +
		' * Copyright (c) <%= grunt.template.today("yyyy") %> PureShare, Inc.\n' +
		' */\n\n',
//    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
//      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
//      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
//      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
//      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    concat: {
      options: {
        banner: '<%= banner %>',
        stripBanners: true
      },
      dist: {
        src: ['js/*.js'],
        dest: 'dist/ddk-2.0.0.js'
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'dist/ddk-2.0.0.js',
        dest: 'dist/ddk-2.0.0.min.js'
      },
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  //grunt.loadNpmTasks('grunt-contrib-qunit');
  //grunt.loadNpmTasks('grunt-contrib-jshint');

  // Default task.
  grunt.registerTask('default', [/*'jshint',*/ /*'qunit',*/ 'clean', 'concat', 'uglify']);

};
