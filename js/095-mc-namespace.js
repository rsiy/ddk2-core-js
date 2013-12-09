// Don't forget to setup application (app) reference for optionGroup and option models!

/////////////////////////////////////////////////////////////////////////////		
//Models
//------
///////////////////////////////////////////////////////////////////////////////			

PS.extend("MC.Models.Record");

	//A standard model
PS.MC.Models.Record.Base = Backbone.Model.extend({				
	//defaults:{},
	defaults:{
		created_by:"",
		created_date:"",
		modified_by:"",
		modified_date:"",		
		lastMessage:"Default",
		status:0,
		type:0
	},
	localStorage:false,
	prefix:"sci_",
	sync: function(method, model, options) {	
		//DDK.log(model);
		if (this.localStorage)
			 return Backbone.localSync.apply(this, arguments);
		else{
			//DDK.log("MC.StandardModel.sync: ", method, model, options);
			return PS.AM.sync(model.widget + '_' + method, model.toFlatJSON(), model.prefix, function(response){																				
				//DDK.log(response);
				model.set(response);					
				if(options.success) options.success(model);
			}, function() {			
				if (options.error) options.error(model);
			});	
		}
	},
	//This will flatten out sub-objects so they can be persisted properly in the database
	toFlatJSON:function(){
		var self=this;
		var newObj={};
		_.each(self.attributes,function(value,key){				
			if (typeof value == "object")		
				newObj[key]= DDK.escape.brackets(JSON.stringify(value));				
			else {
				newObj[key]= value;
			}
		});
		//DDK.log("toFlatJSON: self.attributes -- " + JSON.stringify(self.attributes));
		//DDK.log("toFlatJSON: newObj -- " + JSON.stringify(newObj));
		return newObj;
		//return JSON.stringify(newObj);
		//return JSON.stringify(this.attributes);
	},
	//Reset the model back to defaults
	reset:function(){
		this.clear().set(this.commonDefaults).set(this.defaults);
		return this;
	},		
	commonFields:[
		"created_by", "created_date", "modified_by", "modified_date", "id", "lastMessage"
	],		
	//Get a list of attributes
	attributeList:function(){
		var out="(";
		var count=0;
		for (var att in this.attributes){
			if (count>0) out+=",";
			out+=att;
			count++;
		}
		out+=")";
		return out;			
	},
	//Count of attributes
	attributeCount:function(){
		var count=0;
		for (var att in this.attributes){
			//DDK.log("------" + att);
			count++;
		}	
		return count;
	}
});
	
	

PS.extend("MC.Models.Record");

///////////////////////////////////////////////////////////////////////////////	
//SCI FAVORITES	
///////////////////////////////////////////////////////////////////////////////	

//A favorite category
PS.MC.Models.Record.FavoriteCategory = PS.MC.Models.Record.Base.extend({				
	defaults: _.extend({}, PS.MC.Models.Record.Base.prototype.defaults,{
		parent_id:0,			
		funct:0,
		name:"",
		label:"",
		description:"",
		url:"",
		sort_order:0,
		owner_org_id:0,
		owner_id:0,
		userid:"",
		ext_id1:"",
		ext_id2:"",
		ext_id3:"",
		notes:""   			
	}),
	widget:"API_Fav_Category",
	prefix:"sci_fcat_"
});
	
	//A favorite record
PS.MC.Models.Record.Favorite = PS.MC.Models.Record.Base.extend({			
	defaults: _.extend({}, PS.MC.Models.Record.Base.prototype.defaults,{
		name:"",				
		label:"",
		description:"",			
		funct:0,
		url:"",
		value:"",
		ext_id1:"",
		ext_id2:"",
		ext_id3:"",
		owner_org_id:0,
		owner_id:0,
		userid:"",
		sort_order:0,
		color:"",
		img1:"",
		img2:"",
		img3:"",
		notes:""			
	}),	
	widget:"API_Favorites",
	prefix:"sci_fav_"
});

//A favorite relational model
PS.MC.Models.Record.FavoriteRel = PS.MC.Models.Record.Base.extend({	
	defaults: _.extend({}, PS.MC.Models.Record.Base.prototype.defaults,{
		fav1_id:0,
		fav2_id:0		
	}),
	widget:"API_Favorite_Rel",
	prefix:"sci_fr_"
});		
		
//A favorite relational model
PS.MC.Models.Record.FavoriteCatRel = PS.MC.Models.Record.Base.extend({		
	defaults: _.extend({}, PS.MC.Models.Record.Base.prototype.defaults,{
		fcat_id:0,
		fav_id:0		
	}),
	widget:"API_Fav_Category_Rel",
	prefix:"sci_fcr_"
});
	
//A favorite relational model
PS.MC.Models.Record.FavoriteOrgRel = PS.MC.Models.Record.Base.extend({		
	defaults: _.extend({}, PS.MC.Models.Record.Base.prototype.defaults,{
		org_id:0,
		groupid:"",
		fav_id:0		
	}),
	widget:"API_Fav_Org_Rel",
	prefix:"sci_for_"
});


PS.extend("MC.Models");

PS.MC.Models.OptionGroup = Backbone.Model.extend({
	initialize: function (attributes, options) {
		// setup collections and models container objects
		this.collections = {};
		this.models = {};

		// setup optionGroups and options collections
		this.collections.optionGroups = new Backbone.Collection();
		this.collections.options = new Backbone.Collection();
		
		// setup favorites records and attributes
		this.models.favorite = new PS.MC.Models.Record.Favorite({
			name: "",
			label: "",
			description: "",
			type: 0, // ~v_type_qo~, // sci_type_label: 'Query Options'
			value: "",
			sort_order: 0,
			status: 1
		});
		this.models.favorite.parent = this;
		
		// setup sync method
		this.sync = _.delegator(this.syncMethods, "update", this);
	},

	syncMethods: {
		"create": function (model, options) {
			//DDK.log("sync - create: ", this.favorite.get("id"), this.val());
			
			this.models.favorite.set("value", this.toObject());
			
			return $.when(this.models.favorite.save()).then(function () {
				//DDK.log("Favorite created with id: ", this.favorite.get("id"));
			}.bind(this));
		},
		
		"read": function (model, options) {
			//DDK.log("sync - read: ", this.favorite.get("id"));
			
			this.models.favorite.fetch({
				success: function () {
					var options = this.models.favorite.get("value");
					this.val(options);
					//this.change();
				}.bind(this)
			});
		},
		
		"update": function (model, options) {
			//DDK.log("sync - update: ", this.favorite.get("id"), this.val());
			this.models.favorite.set("value", this.toObject());
			
			//return $.when(this.favorite.save()).then(function () {
			//	DDK.log("Favorite updated with id: ", this.favorite.get("id"));
			//}.bind(this));
			
			return $.when(this.models.favorite.save()).then(function () {
				//DDK.log("Favorite updated with id: ", this.favorite.get("id"));
			}.bind(this));
		},
		
		"delete": function (model, options) {
			//DDK.log("sync - delete: ", this.favorite.get("id"), this.getValue());
			// this.options.reset();
			return this.models.favorite.destroy();
		}
	},

	// setup(config)
	// configuration for optionGroups
	//
	// configure optionGroup, sub optionGroups, and sub options
	// by passing an options configuration object
	// options configuration objects can be arbitrarily nested structures
	// all groups and options must have an `id` property
	// groups may contain options under an `options` property
	// groups may contain subgroups or attributes under all other named properties
	// group properties with string values are treated as attributes
	// group properties with object values are treated as subgroups	
	setup: function (config) {
		DDK.log("  PS.MC.Models.OptionGroup.setup()", config);
		
		_.each(config, function (configValue, configKey) {
			var model;
				
			if (configKey === "options") {
				// if there is an `options` key
				// then add each option to this group's options collection
				this.setupOptions(configValue);
				return;
			}
			
			if (_.isString(configValue)) {
				// any value of type string
				// is added as an optionGroup model attribute
				DDK.log("    set optionGroup attribute: ", this.get("id"), "(" + this.cid + ")", "-->", configKey, ":", configValue);
				this.set(configKey, configValue);
				return;
			}
			
			if (_.isPlainObject(configValue)) {
				// any values of type object should have an id property
				// that are not the `options` key
				// are added to this.collection.optionGroups

				// first check for an optionGroup model with this id
				if (configValue.id) {
					// optionGroup ids are always underscored
					configValue.id = _.string.underscored(configValue.id);
					
					model = this.collections.optionGroups.get(configValue.id);
				} else {
					// any values of type object should have an id property
					// but we're not going to force it to avoid breaking things
					DDK.warn("PS.MC.Models.OptionGroup.setup(): configuration object missing `id`.", configValue);			
				}
				
				// if it not found, create a new optionGroup model
				if (!model) {
					model = new PS.MC.Models.OptionGroup();
					model.parent = this;
					model.app = this.app;
					this.collections.optionGroups.add(model);
				}
			
				// apply the optionGroup configuration
				DDK.log("  set optionGroup:", this.get("id"), "(" + this.cid + ")", "-->", configValue.id);
				model.setup(configValue);
				return;
			}
			
			DDK.error("PS.MC.Models.OptionGroup.setup(): unrecognized configuration object.", configValue);
		}, this);	
	},

	// setupOptions(config)
	// configuration for optionGroup options
	//
	// configure options by passing an options configuration object
	// options configuration objects can be "flat" objects containing
	// option id/value pairs (values can be strings or arrays or objects)
	//
	// options configuration objects can be "deep" objects containing
	// option objects with `id` and any other option meta data
	// the `id` property is required for all option objects in "deep" config objects
	setupOptions: function (config) {
		DDK.log("  PS.MC.Models.OptionGroup.setupOptions()", config);
		
		// determine if this is a "flat" options configuration object
		// that contains only keys (ids) and values
		// { option1: "value1", option2: "value2", ... }
		//
		// or a "deep" options configuration object
		// that contains option id and possibly additional meta data
		// { option1: { id: "option1", value: "value1", text: "Value 1" }, ... }
		// `id` is the only required parameter for all "deep" options
		var isDeep = _.any(config, function (configValue) {
			return configValue.id;
		});

		_.each(config, function (configValue, configKey) {
			var model,
				// construct option configuration object from the key/value pair if not isDeep
				optionConfig = isDeep ? configValue : { id: configKey, value: configValue };

			// option ids are always underscored
			optionConfig.id = _.string.underscored(optionConfig.id)
				
			// first check for an option model with this id within this optionGroup
			model = this.collections.options.get(optionConfig.id);
			
			// if it not found, create a new option model and add it to the options collection
			if (!model) {
				model = new PS.MC.Models.Option()
				model.parent = this;
				model.app = this.app;
				this.collections.options.add(model);
			}
		
			// apply the option configuration
			DDK.log("    set option:", optionConfig.id);
			model.set(optionConfig);
		}, this);
	},

	// getOptionGroup(id)
	// getter for optionGroup model
	//
	// returns the optionGroup model with the given id
	// will find the model within any arbitrary nested structure of optionGroups
	getOptionGroup: function (id) {
		//DDK.log("  PS.MC.Models.OptionGroup.getOptionGroup()", id, this.id);
		
		var model;

		// optionGroup ids are always underscored
		id = _.string.underscored(id);
				
		// return this optionGroup model if it has the id
		if (id === this.id) {
			return this;
		}
		
		// check each nested sub optionGroup
		// stop searching when the optionGroup id is found
		this.collections.optionGroups.each(function (optionGroup) {
			model = optionGroup.getOptionGroup(id);
			if (model) { return false; }
		});
		
		return model;
	},

	// getOption(id)
	// getter for option model
	//
	// returns the option model with the given id
	// will find the model within any arbitrary nested structure of optionGroups
	getOption: function (id) {
		//DDK.log("  PS.MC.Models.OptionGroup.getOption()", id, this.id);

		var model;
		
		// option ids are always underscored
		id = _.string.underscored(id);
		
		// check this optionGroup's options collection for the id
		this.collections.options.each(function (option) {
			if (id === option.id) {
				model = option;
				return false;
			}
		});
		
		// return the model if a match is found
		if (model) { return model; }
		
		// check this optionGroup's sub optionGroups for options matching the id
		this.collections.optionGroups.each(function (optionGroup) {
			model = optionGroup.getOption(id);
			if (model) { return false; }
		});

		// return the model if a match is found
		if (model) { return model; }
		
		// return undefined if a match is not found
		return;	
	},

	// val(id [, value])
	// getter/setter for option values
	//
	// val(object [, prefix])
	// setter for option values with optional prefix
	// 
	// val(url [, prefix])
	// setter for option values with optional prefix
	// 
	// future version could add additional signatures
	// to follow the same id/value/prefix rules established with K: val(id [, value] [, prefix])
	val: function (id, value) {
		//DDK.log("  PS.MC.Models.OptionGroup.val()", id, value);
		
		var prefix = value || "",
			isQueryString = _.string.isQueryString(id);

		if (typeof id === "string") {
			if (!isQueryString) {
				option = this.getOption(id);
				
				// log when the option is not found
				if (!option) {
					DDK.log("    PS.MC.Models.OptionGroup.val() - option `" + id + "` not found.");
					return;
				}
				
				// basic getter
				if (typeof value === "undefined") {
					return option.get("value");	
				}
				
				// basic setter
				option.set("value", value);
				return;
			}
			
			// url setter
			// parse the queryString into an object, and pass along the prefix
			this.val(_.string.parseQueryString(id), value);
			return;
		}
		
		// object setter
		if (_.isPlainObject(id)) {
			_.each(id, function (optionValue, optionKey) {
				this.val(prefix + optionKey, optionValue)
			}, this);
			
			return;
		}
		
		// log an error if the arguments are unrecognized
		DDK.error("PS.MC.Models.OptionGroup.val() - cannot parse arguments:", id, value);
	},

	// The methods below use a standard PureShare FilterSettings object.

	// clear([settings])
	// Method for bulk-clearing option values
	//
	// clears data from options
	// the "value" attributes on all option models will be set to ""
	clear: function (settings) {
		this.reduce(function (optionModel) { optionModel.set("value", ""); }, settings);
	},

	// Methods for bulk-getting option values
	// toCamelizedObject([settings])		
	toCamelizedObject: function (settings) {
		return _.zipObject(_.map(this.reduce(settings), function (pair) {
			return [_.string.camelize(pair[0]), pair[1]];
		}));	
	},

	// toObject([settings])		
	toObject: function (settings) {
		return _.zipObject(this.reduce(settings));	
	},

	// toURL([settings])		
	toURL: function (settings) {
		var output = _.map(this.reduce(settings), function (pair) {
			return encodeURIComponent(pair[0]) + "=" + encodeURIComponent(pair[1]);
		});

		return output.length ? "&" + output.join("&") : "";
	},

	// toArrayPairs([settings])		
	toArrayPairs: function (settings) {
		return this.reduce(settings);	
	},


	// reduce([iterator] [, settings])
	// general-purpose options iterator
	//
	// To use a more general form, all arguments must be specified in place:
	// reduce(iterator, settings, accumulator, thisArg, isInitialized)
	//
	// use for iterating over all options contained in an optionGroup
	// and all options contained in all sub optionGroups
	//
	// default iterator builds an array of id/value pairs for all
	// options that match when tested against the settings object
	//
	// iterator is called on all matching options in the context of the option model
	// with an accumulator array as the single argument
	//
	// accumulator and isInitalized arguments are used internally for recursive reduce calls to nested optionGroups
	reduce: function (iterator, settings, accumulator, thisArg, isInitialized) {
		if (_.isPlainObject(iterator)) {
			settings = iterator;
			iterator = null;
		}

		// setup if isInitialized flag is not set
		if (!isInitialized) {
		
			// default accumulator is an array
			accumulator = accumulator || [];
			
			// setup settings object if it is not an instance of PS.Settings
			if (!(settings && settings instanceof PS.FilterSettings)) {
				settings = new PS.FilterSettings(settings);
			}
			
			// default iterator builds an array of id/value pairs
			iterator = _.wrap((typeof iterator === "function" ? iterator : function (optionModel, accumulator) {
				accumulator.push([optionModel.id, optionModel.get("value")]);
			}), (thisArg ? function (func, optionModel) {
				if (settings.test(optionModel)) {
					func.call(thisArg, optionModel, accumulator);
				}
			} : function (func, optionModel) {
				if (settings.test(optionModel)) {
					func(optionModel, accumulator);
				}
			}));
		}
		
		// iterate over options
		this.collections.options.each(iterator);
		
		// iterate over options in sub optionGroups
		this.collections.optionGroups.each(function (optionGroup) {
			optionGroup.reduce(iterator, settings, accumulator, thisArg, true);
		});
		
		return accumulator;
	},
	
	// each(iterator [, settings, thisArg])
	each: function (iterator, settings, thisArg) {
		this.reduce(iterator, settings, null, thisArg);
	},



	// Methods for handling an optionGroup Favorite record

	// favoriteId()
	// gets or sets the Favorite model id
	favoriteId: function (id) {
		if (id) {
			this.models.favorite.set("id", id);
			return;
		} 
		
		return this.models.favorite.get("id", id);
	},

	// clearFavoriteId()
	// gets or sets the Favorite model id
	clearFavoriteId: function (id) {
		this.models.favorite.set("id", "");
	}
});

PS.MC.Models.Option = Backbone.Epoxy.Model.extend({
	defaults: {
		value: ""
	},
	initialize: function () {
		this.on("change:value", function (model, value, options) {
			this.app && this.app.trigger("ps.option.change", { id: model.id, value: value });
		}.bind(this));
	}
});

PS.extend("MC.Views");

