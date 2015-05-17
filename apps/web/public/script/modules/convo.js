define([

  "underscore",
  "jquery",
  "handlebars",
  "backbone",
  "hash",
  "util",
  "text!tmpl/convo/list.html"

], function(

  _,
  $,
  Handlebars,
  Backbone,
  Hash,
  util,
  list_template

) {

  var Convos = function( selector ) {
    
    new this.Router( selector );
    return this;
  };

  var Convo = Convos.prototype.Convo = Backbone.Model.extend({

    urlRoot: '/api/convos'

  });

  var ConvoList = Convos.prototype.ConvoList = Backbone.Collection.extend({
    
    url: '/api/convos',

    model: Convo
  
  });

  var ConvoListView = Convos.prototype.ConvoListView = Backbone.View.extend({

    template: Handlebars.compile( list_template ),

    events: {
      "click button.new": "create",
      "change input": "update"
    },

    initialize: function() {

      this.collection = new ConvoList();
      this.collection.fetch({reset: true});
      _.bindAll(this, "render", "update", "create");
      this.collection.bind("reset", this.render);
      this.collection.bind("add", this.render);
    },

    render: function() {
      this.$el.html( this.template( { convos: this.collection.toJSON() } ) );
      return this;
    },

    update: function(e) {
      this.convo = $(e.currentTarget).val();
    },

    create: function() {
      console.log("hit", this.convo);
      if (!this.convo) {
        // display modal
      }
      else {
        this.collection.add(new Convo({name: this.convo}));
      }
    }

  });

  var Router = Convos.prototype.Router = Backbone.Router.extend({
  
    initialize: function( selector ) {
    
      this.selector = selector;
    },

    routes: {
      "convos": "index"
    },

    index: function() {

      app.setView(new ConvoListView());
    }

  });

  return Convos;
});