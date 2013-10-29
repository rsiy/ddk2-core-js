Backbone.ViewCurrent = Backbone.View;
Backbone.View = Backbone.ViewCurrent.extend({
  constructor: function (options) {
    this.options = options;
    Backbone.ViewCurrent.apply(this, arguments);
  }
});