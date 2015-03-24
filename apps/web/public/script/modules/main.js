
define([ 
  
  "backbone",
  "jquery",
  "handlebars",
  "user",
  "text!tmpl/main/body.html",
  "text!tmpl/main/home.html",
  "text!tmpl/main/lodging.html"

], function( 

  Backbone,
  $,
  Handlebars,
  Users,
  body_template,
  home_template,
  lodging_template

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

    // Unlike other modules, the main modules always loads
    // a view and the sub modules will attach their views
    // to it.
    var view = new MainView();
    view.setElement($("body")).render();

    // This router is basically just for 404s
    var router = new this.Router( "#content" );

    // Load submodules
    var users = new Users( "#content" );

    Users.me.on("change", function(me) {

      var user;
      var admin;
      if (me.get('email')) 
        user = me.attributes;
      admin = user && user.roles.indexOf("admin") !== -1;

      view.render("#header", { user: user, admin: admin } );
    });

    Backbone.history.start( { pushState: true } );

    return this;
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
      '*404': 'error'
    },

    error: function() { 
      
      if (Backbone.history.fragment)
        Backbone.$(this.selector).html("404");
    },

    home: function() {

      var view = new HomeView();
      view.setElement($(this.selector)).render();
    },

    lodging: function() {

      var view = new LodgingView();
      view.setElement($(this.selector)).render();
    }

  });

  return Main;
});
