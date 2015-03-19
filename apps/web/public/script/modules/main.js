
define([ 
  
  "backbone",
  "jquery",
  "handlebars",
  "guest",
  "user",
  "text!tmpl/main/body.html"

], function( 

  Backbone,
  $,
  Handlebars,
  iChoose,
  Users,
  body_template

) {

  // Make sure all links are directed through the Backbone router
  $(document).on("click", "a", function(e) {
    var $el = $(e.target);
    var href = $el.attr("href");

    if (href.charAt(0) == "/") {
      e.preventDefault();
      Backbone.history.navigate(href, true);
    }
  });


  // The Main module that loads the index page and renders
  // the header and footer
  var Main = function( selector ) {

    // Unlike other modules, the main modules always loads
    // a view and the sub modules will attach their views
    // to it.
    var view = new MainView();
    view.setElement($("body")).render();

    // This router is basically just for 404s
    var router = new this.Router( selector );

    // Load submodules
    var ichoose = new iChoose( "#content" );
    var users = new Users( "#content" );

    Users.me.on("change", function(me) {

      var user = me.get('email') ?
        me.attributes :
        {};

      view.render("#header", { user: user }  );
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

  // A generic router that just redirects to the current main
  // page. Right now it's the chooser, eventually it'll
  // the blog page.
  var Router = Main.prototype.Router = Backbone.Router.extend( {
    
    initialize: function( selector ) {

      this.selector = selector;
    },

    routes: {
      '*404': 'all'
    },

    all: function() { 
      
      if (!Backbone.history.fragment) {
        Backbone.history.navigate("/guests", true);
      }
      else Backbone.$("#content").html("404");
    }

  });

  return Main;
});
