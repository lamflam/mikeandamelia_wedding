
define([ 
  
  "backbone",
  "jquery",
  "handlebars",
  "user",
  //"convo",
  "text!tmpl/main/body.html",
  "text!tmpl/main/home.html",
  "text!tmpl/main/lodging.html",
  "text!tmpl/main/photo.html",
  "text!tmpl/main/what_to_expect.html"

], function( 

  Backbone,
  $,
  Handlebars,
  Users,
  //Convos,
  body_template,
  home_template,
  lodging_template,
  photo_template,
  what_to_expect_template

) {

  // Make sure all links are directed through the Backbone router
  $(document).on("click", "a", function(e) {
    var $el = $(e.target);
    var href = $el.attr("href");

    if (href && href.charAt(0) == "/") {
      e.preventDefault();
      Backbone.history.navigate(href, true);
    }
  });


  // The Main module that loads the index page and renders
  // the header and footer
  var Main = function() {

    this.selector = "#content";

    // Unlike other modules, the main modules always loads
    // a view and the sub modules will attach their views
    // to it.
    var view = new MainView();
    view.setElement($("body")).render();

    // Load our routes
    new this.Router( this.selector );

    // Load submodules
    new Users( this.selector );
    //new Convos( this.selector );

    Users.me.on("change", function(me) {

      var user;
      var admin;
      if (me.get('email')) 
        user = me.attributes;
      admin = user && user.roles.indexOf("admin") !== -1;

      view.render("#header", { user: user, admin: admin } );
    });

    return this;
  };

  Main.prototype.start = function() {

    Backbone.history.start( { pushState: true } );
  },

  Main.prototype.setView = function(view) {

      if (this.view) {
        this.view.remove();
        delete this.view;
      }

      this.view = view;
      $(this.selector).append(this.view.render().el);
  };

  var MainView = Main.prototype.MainView = Backbone.View.extend({

    template: Handlebars.compile( body_template ),

    initialize: function() {
      
      _.bindAll(this, "render");
    },

    render: function( partial, data ) {

      if (partial) {
        $(partial).html( $(this.template( data )).filter(partial).html() );
      }
      else {
        this.$el.html( this.template( data ) );
      }
      return this;
    }
  });

  var HomeView = Main.prototype.HomeView = Backbone.View.extend({

    template: Handlebars.compile( home_template ),

    initialize: function(selector) {
      
      _.bindAll(this, "render");
    },

    render: function() {

      this.$el.html( this.template() );

      return this;
    }
  });

  var LodgingView = Main.prototype.LodgingView = Backbone.View.extend({

    template: Handlebars.compile( lodging_template ),

    initialize: function(selector) {
      
      _.bindAll(this, "render");
    },

    render: function() {

      this.$el.html( this.template() );

      return this;
    }
  });

  var PhotoView = Main.prototype.PhotoView = Backbone.View.extend({

    template: Handlebars.compile( photo_template ),

    initialize: function(selector) {
      
      _.bindAll(this, "render");
    },

    render: function() {

      this.$el.html( this.template() );

      return this;
    }
  });

  var WhatToExpectView = Main.prototype.PhotoView = Backbone.View.extend({

    template: Handlebars.compile( what_to_expect_template ),

    initialize: function(selector) {
      
      _.bindAll(this, "render");
    },

    render: function() {

      this.$el.html( this.template() );

      return this;
    }
  });

  var ErrorView = Main.prototype.LodgingView = Backbone.View.extend({

    initialize: function(selector) {
      _.bindAll(this, "render");
    },

    render: function() {
      this.$el.html( "404" );
      return this;
    }
  });

  // A generic router that just redirects to the current main
  // page. Right now it's the chooser, eventually it'll
  // the blog page.
  var Router = Main.prototype.Router = Backbone.Router.extend( {
    
    initialize: function( selector ) {

      this.selector = selector;
    },

    routes: {
      '': 'home',
      'home': 'home',
      'lodging': 'lodging',
      'photography': 'photography',
      'what_to_expect': 'whatToExpect',
      '*404': 'error'
    },

    error: function() { 
      
      if (Backbone.history.fragment)
        app.setView(new ErrorView());
    },

    home: function() {

      app.setView(new HomeView());
    },

    lodging: function() {

      app.setView(new LodgingView());
    },

    photography: function() {

      app.setView(new PhotoView());
    },

    whatToExpect: function() {

      app.setView(new WhatToExpectView());
    }

  });

  return Main;
});
