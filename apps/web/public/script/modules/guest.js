
define([

  "underscore",
  "jquery",
  "handlebars",
  "backbone",
  "text!tmpl/guest/guest.html",
  "text!tmpl/guest/guestlist.html",
  "backbone-relational" 
  
], function(

  _,
  $,
  Handlebars,
  Backbone,
  guest_template,
  guestlist_template

) {

  var Guests = function( selector ) {
    
    new this.Router( selector );
    return this;
  };
  
  var Guest = Guests.prototype.Guest = Backbone.RelationalModel.extend({
  
    initialize: function() {
    
    },

    toJSON: function() {
      var json = Backbone.Model.prototype.toJSON.apply(this, arguments);
      json.cid = this.cid;
      return json;
    }
  
  });

  var GuestList = Guests.prototype.GuestList = Backbone.Collection.extend({
  
    model: Guest
  
  });

  var GuestView = Guests.prototype.GuestView = Backbone.View.extend({

    template: Handlebars.compile( guest_template ),

    events: {
    
      "click button.remove": "removeClick",
      "change input.guest-input": "nameChanged"
    },

    render: function() {
      this.$el.html( this.template( this.model.toJSON() ) );

      return this;
    },

    removeClick: function() {
    
      // Remove the model from the collection
      // and the view should automatically be 
      // updated
      var $this = this;
      this.$el.animate({height: 0}, function() { 
        $this.model.collection.remove( $this.model );
      });
    },

    nameChanged: function(e) {
      this.model.set("name", $(e.target).val());
    }
    
  });

  var GuestListView = Guests.prototype.GuestListView = Backbone.View.extend({

    template: Handlebars.compile( guestlist_template ),

    events: {
      "click button.add": "addGuest",
    },

    initialize: function() {

      var $this = this;
      $this.guestViews = {};
      $this.collection = new GuestList();

      _.bindAll( $this, 'addGuest', 'removeGuestView', 'addGuestView' );
      $this.collection.bind( 'remove', $this.removeGuestView );
      $this.collection.bind( 'add', $this.addGuestView );

      $this.collection.each( function( model ) {

        var view = new GuestView( { model: model } );
        $this.guestViews[ model.cid ] = view;

      });
    },

    addGuest: function() {
      this.collection.add(new Guest());
    },

    removeGuestView: function( model ) {
    
      this.guestViews[ model.cid ].remove();
      delete this.guestViews[ model.cid ];
    },

    addGuestView: function( model ) {
      this.guestViews[ model.cid ] = new GuestView( { model: model } );
      this.render(model.cid);
    },

    render: function(id) {
    
      var id, count=0, guest;

      if (!id) {
        this.$el.html( this.template( { guests: this.collection.toJSON() } ) );
        
        for( id in this.guestViews ) {
          
          count += 1;
          guest = this.$el.find( '#guest-' + id );
          
          this.guestViews[ id ].setElement( guest ).render();
        }

      } else {

        var el = $(this.guestViews[ id ].render().el)
          .attr({id: "guest-" + id})
          .addClass("guest")
          .hide();
        this.$el.find('#guestlist').append(el);
        el.slideDown();
      }
      
      return this;
    }

  });

  var Router = Guests.prototype.Router = Backbone.Router.extend({
  
    initialize: function( selector ) {
    
      this.selector = selector;
    },

    routes: {
      "guests": "index"
    },

    index: function() {
    
      var view = new GuestListView();
      view.setElement($(this.selector)).render();
    
    }
  });

  return Guests;

});