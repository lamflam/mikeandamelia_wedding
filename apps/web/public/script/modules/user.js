
define([

  "underscore",
  "jquery",
  "handlebars",
  "backbone",
  "hash",
  "util",
  "text!tmpl/user/user.html",
  "text!tmpl/user/userlist.html",
  "text!tmpl/user/login.html",
  "backbone-relational" 

], function(

  _,
  $,
  Handlebars,
  Backbone,
  Hash,
  util,
  user_template,
  userlist_template,
  login_template

) {

  // Send the API token with every fetch, sync, save
  var _sync = Backbone.sync;
  Backbone.sync = function(method, model, options) {
    options = options || {};
    options.headers = options.headers || {};
    var token = util.cookie.get("tkn");

    if (token) {
      $.extend(options.headers, { Authorization: "Bearer " + token}); 
    }
    _sync.call(this, method, model, options);
  }

  var Users = function( selector ) {
    
    new this.Router( selector );
    return this;
  };

  var Me = Backbone.Model.extend({

    url: function() { return "/api/users/me"; },

    initialize: function() {
      this.fetch();
    },

    login: function(user) {
      this.set(user);
    },

    logout: function() {
      this.clear();
      util.cookie.remove("tkn");
    }

  });
  me = Users.me = new Me();

  var User = Users.prototype.User = Backbone.RelationalModel.extend({

    urlRoot: '/api/users',

    idAttribute: "_id",

    blacklist: ['password', 'password2', 'error'],

    sync: function(method, model, options) {
      options = options || {};

      var attrs = _.omit(model.attributes, this.blacklist);
      options.data = JSON.stringify(attrs);
      options.contentType = "application/json";
      Backbone.RelationalModel.prototype.sync.call(this, method, model, options);
    },

    validate: function(attributes, options) {

      var error;
      var email = attributes.email;
      var name = attributes.name;
      var password = attributes.password || "";
      var password2 = attributes.password2 || "";
      var rEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;        //'  // This fublime's syntax coloring 

      if (!rEmail.test(email)) {
        error = error || {};
        error.email = "Invalid email address";
      }

      if (!name) {
        error = error || {};
        error.name = "Must enter your name";
      }

      if (password.length < 6) {
        error = error || {};
        error.password = "Password must be at least 6 characters";
      }

      if (password !== password2) {
        error = error || {};
        error.password2 = "Passwords don't match";
      }

      this.set('error', error);
      return error;
    },

    register: function(success, error) {

      var password = this.get('password');
      var email = this.get('email');
      var hash = new Hash(password + email, "TEXT").getHash("SHA-512","B64");
      this.set('hash', hash);
      this.save(null, {
        success: success
      });
    },

    login: function(success, error) {

      var $this = this;
      var password = this.get('password');
      var email = this.get('email');
      var hash = new Hash(password + email, "TEXT").getHash("SHA-512","B64");
      this.set('hash', hash);
      this.save(null, {
        success: success,
        validate: false,
        url: this.url() + '/authenticate'
      });
    }

  });
  
  var UserList = Users.prototype.UserList = Backbone.Collection.extend({
    
    url: '/api/users',

    model: User
  
  });

  var UserView = Users.prototype.UserView = Backbone.View.extend({

    template: Handlebars.compile( user_template ),

    events: {

      "click #save-button": "save",
      "change input": "update"
    },

    initialize: function() {

      _.bindAll(this, "render", "update");
      this.model.on("change", this.render);
      this.model.on("invalid", this.render);
      this.model.fetch();
    },

    render: function() {
      var data = {
        responded: this.model.get("rsvp") != undefined,
        user: this.model.toJSON(),
        title: "Edit RSVP",
        button_text: "Save"
      };
      this.$el.html(this.template(data));
      return this;
    },

    update: function(e) {
      var field = $(e.currentTarget).attr("name");
      var value = $(e.currentTarget).val();
      var obj = {};

      obj[field] = value;
      this.model.set(obj);
    },

    save: function(e) {
      e.preventDefault();
    }
  });

  var UserListView = Users.prototype.UserListView = Backbone.View.extend({

    template: Handlebars.compile( userlist_template ),

    initialize: function() {

      this.collection = new UserList();
      this.collection.fetch({reset: true});
      _.bindAll(this, "render");
      this.collection.bind("reset", this.render);
    },

    render: function() {
      this.$el.html( this.template( { guests: this.collection.toJSON() } ) );
      return this;
    },

  });

  var LoginView = Users.prototype.LoginView = Backbone.View.extend({

    template: Handlebars.compile( login_template ),

    events: {

      "click button.login": "login",
      "change input": "update"
    },

    initialize: function() {

      _.bindAll(this, "render", "update");
    },

    render: function() {

      this.$el.html( this.template() );
      return this;
    },

    update: function(e) {
      var field = $(e.currentTarget).attr("name");
      var value = $(e.currentTarget).val();
      var obj = {};

      obj[field] = value;
      this.model.set(obj);
    },

    login: function(e) {
      e.preventDefault();
      this.model.login(function(model, user) {
        Users.me.fetch();
        Backbone.history.navigate("/", true);
      });
    }
  });

  var RegisterView = Users.prototype.RegisterView = Backbone.View.extend({

    template: Handlebars.compile( user_template ),

    events: {

      "click #save-button": "register",
      "change input": "update"
    },

    initialize: function() {

      _.bindAll(this, "render", "update");
      this.model.on("invalid", this.render);
    },

    render: function() {
      var data = {
        responded: this.model.get("rsvp") != undefined,
        user: this.model.toJSON(),
        title: "New Guest",
        button_text: "Register",
        new: true
      };
      this.$el.html(this.template(data));
      return this;
    },

    update: function(e) {
      var field = $(e.currentTarget).attr("name");
      var value = $(e.currentTarget).val();
      var obj = {};

      obj[field] = value;
      this.model.set(obj);
    },

    register: function(e) {
      e.preventDefault();
      this.model.register(function(model, user) {
        Users.me.login(user);
        Backbone.history.navigate("/", true);
      });
    }
  });

  var Router = Users.prototype.Router = Backbone.Router.extend({
  
    initialize: function( selector ) {
    
      this.selector = selector;
    },

    routes: {
      "users": "index",
      "guests": "index",
      "users/login": "login",
      "guests/login": "login",
      "users/register": "register",
      "guests/register": "register",
      "users/logout": "logout",
      "guests/logout": "logout",
      "users/me": "editme",
      "guests/me": "editme",
      "users/:id": "edit",
      "guests/:id": "edit"
    },

    index: function() {

      var view = new UserListView();
      view.setElement($(this.selector)).render();
    },

    login: function() {
    
      var view = new LoginView({model: new User()});
      view.setElement($(this.selector)).render();
    },

    register: function() {
    
      var view = new RegisterView({model: new User()});
      view.setElement($(this.selector)).render();
    },

    logout: function() {

      Users.me.logout();
      Backbone.history.navigate("/guests/login", true);
    },

    editme: function() {

      var view = new UserView({model: Users.me});
      view.setElement($(this.selector)).render();
    },

    edit: function(id) {

      var view = new UserView({model: new User({_id: id})});
      view.setElement($(this.selector)).render();
    }
  });

  return Users;
});
