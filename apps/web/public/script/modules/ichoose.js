
define([

  "underscore",
  "jquery",
  "handlebars",
  "backbone",
  "text!tmpl/ichoose/choice.html",
  "text!tmpl/ichoose/optionlist.html",
  "text!tmpl/ichoose/option.html",
  "backbone-relational" 
  
], function(

  _,
  $,
  Handlebars,
  Backbone,
  choice_template,
  optionlist_template,
  option_template

) {

  var iChoose = function( selector ) {
    
    new this.Router( selector );
    return this;
  };
  
  var uid = 0;
  
  var Option = iChoose.prototype.Option = Backbone.RelationalModel.extend({
  
    initialize: function() {
    
      this.set('id', uid += 1);
    }
  
  });

  var Options = iChoose.prototype.Options = Backbone.Collection.extend({
  
    model: Option
  
  });

  var Choice = iChoose.prototype.Choice = Backbone.RelationalModel.extend({
  
    relations:[{
      type: 'HasMany',
      key: 'options',
      relatedModel: Option,
      collectionType: Options,
    }],

    initialize: function() {
    
      this.get( 'options' ).add( new Option() );
      this.get( 'options' ).add( new Option() );
      this.get( 'options' ).add( new Option() );
    }
    
  });

  var OptionView = iChoose.prototype.OptionView = Backbone.View.extend({

    template: Handlebars.compile( option_template ),

    events: {
    
      "click button.remove": "removeClick",
      "change input.option-input": "nameChanged"
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

  var OptionListView = iChoose.prototype.OptionListView = Backbone.View.extend({

    template: Handlebars.compile( optionlist_template ),

    initialize: function() {

      var $this = this;
      $this.optionViews = {};

      _.bindAll( $this, 'removeOptionView', 'addOptionView' );
      $this.collection.bind( 'remove', $this.removeOptionView );
      $this.collection.bind( 'add', $this.addOptionView );

      $this.collection.each( function( model ) {

        var view = new OptionView( { model: model } );
        $this.optionViews[ model.get( "id" ) ] = view;

      });
    },

    removeOptionView: function( model ) {
    
      this.optionViews[ model.get( "id" ) ].remove();
      delete this.optionViews[ model.get( "id" ) ];
    },

    addOptionView: function( model ) {
    
      this.optionViews[ model.get( "id" ) ] = new OptionView( { model: model } );
      this.render(model.get("id"));
    },

    render: function(id) {
    
      var id, count=0, option;

      if (!id) {
        this.$el.html( this.template( { options: this.collection.toJSON() } ) );
        
        for( id in this.optionViews ) {
          
          count += 1;
          option = this.$el.find( '#option-' + id );
          
          this.optionViews[ id ].setElement( option ).render();
        }

      } else {

        var el = $(this.optionViews[ id ].render().el)
          .attr({id: "option-" + id})
          .addClass("option")
          .hide();
        this.$el.append(el);
        el.slideDown();
      }
      
      return this;
    }

  });

  var ChoiceView = iChoose.prototype.ChoiceView = Backbone.View.extend({

    template: Handlebars.compile( choice_template ),

    initialize: function() {
    
      window.choiceView = this;
      _.bindAll( this, 'addOption' );
      this.optionListView = new OptionListView( { collection: this.model.get( 'options' ) } );
    },

    events: {
    
      "click button.add": "addOption",
      "click button.choose": "choose"
    },

    render: function() {
    
      this.$el.html( this.template() );
      this.optionListView.setElement( this.$el.find( '.optionlist' ) ).render();
      return this;
    },

    addOption: function() {
    
      this.model.get( 'options' ).add( new Option() );    
    },

    choose: function() {
    
      var choices = [];
      this.model.get( 'options' ).forEach(function(option) {
        if (option.get("name")) {
          choices.push(option.get("name"));
        }
      });

      var results = {};

      choices.forEach( function( choice ) { 
        results[ choice ] = 0; 
      });

      for ( i = 0; i < 10000; i ++ ) {
        
        results[ choices[ Math.floor( Math.random() * choices.length ) ] ] += 1;
      }

      var max = 0, winner;
      choices.forEach(function(choice) { 
        if (results[choice] > max) {
          winner = choice;
          max = results[choice];
        }
      });

      alert("The winner is " + winner);
    }

  });
  
  var Router = iChoose.prototype.Router = Backbone.Router.extend({
  
    initialize: function( selector ) {
    
      this.selector = selector;
    },

    routes: {
      "ichoose": "index"
    },

    index: function() {
    
      var view = new ChoiceView( { model: new Choice() } );
      view.setElement($(this.selector)).render();
    
    }
  });

  return iChoose;

});
