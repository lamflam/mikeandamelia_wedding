
define([

  "underscore",
  "jquery",
  "handlebars",
  "backbone",
  "hash",
  "util",
  "text!tmpl/user/user.html",
  "text!tmpl/user/list.html",
  "text!tmpl/user/login.html" 

], function(

  _,
  $,
  Handlebars,
  Backbone,
  Hash,
  util,
  user_template,
  list_template,
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

  Users.rEmail = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;        //'  // This fublime's syntax coloring 

  var Me = Backbone.Model.extend({

    url: function() { return "/api/users/me"; },

    idAttribute: "_id",

    initialize: function() {
      this.fetch();
    },

    login: function(user) {
      this.set(user);
    },

    logout: function() {
      this.clear();
      util.cookie.remove("tkn", { path: '/' });
    }

  });
  Users.me = new Me();

  var User = Users.prototype.User = Backbone.Model.extend({

    urlRoot: '/api/users',

    idAttribute: "_id",

    blacklist: ['password', 'password2', 'error'],

    getData: function() {
      return _.omit(this.attributes, this.blacklist);
    },

    sync: function(method, model, options) {
      options = options || {};

      options.data = JSON.stringify(model.getData());
      options.contentType = "application/json";
      Backbone.Model.prototype.sync.call(this, method, model, options);
    },

    validate: function(attributes, options) {
      options = options || {};
      var error;
      var email = attributes.email;
      var name = attributes.name;
      var password = attributes.password || "";
      var password2 = attributes.password2 || "";

      if (!Users.rEmail.test(email)) {
        error = error || {};
        error.email = "Invalid email address";
      }

      if (!options.reset) {
        if (!name) {
          error = error || {};
          error.name = "Must enter your name";
        }
      }

      if (this.isNew()) {
        if (password.length < 6) {
          error = error || {};
          error.password = "Password must be at least 6 characters";
        }

        if (password !== password2) {
          error = error || {};
          error.password2 = "Passwords don't match";
        }
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
        success: success,
        error: error
      });
    },

    login: function(success, error) {

      var password = this.get('password');
      var email = this.get('email');
      var hash = new Hash(password + email, "TEXT").getHash("SHA-512","B64");
      this.set('hash', hash);
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this.getData()),
        url: '/api/users/authenticate',
        success: success,
        error: error
      });
    },

    resetToken: function(success, error) {
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this.getData()),
        url: '/api/users/' + encodeURIComponent(this.get('email')) + '/reset_token',
        success: success,
        error: error
      });
    },

    resetPassword: function(success, error) {

      if (this.validate(this.attributes, {reset: true})) {
        error();
        return;
      }

      var password = this.get('password');
      var email = this.get('email');
      var hash = new Hash(password + email, "TEXT").getHash("SHA-512","B64");
      this.set('hash', hash);
      $.ajax({
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this.getData()),
        url: '/api/users/' + encodeURIComponent(email) + '/password',
        success: success,
        error: error
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
      "change input,textarea,select": "update"
    },

    initialize: function() {

      _.bindAll(this, "render", "update");
      this.model.on("sync", this.render);
      this.model.on("invalid", this.render);
      this.model.fetch();
    },

    render: function() {
      var data = {
        responded: this.model.get("rsvp") !== undefined,
        going: this.model.get("rsvp") === 'yes',
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
      this.model.save();
    }
  });

  var UserListView = Users.prototype.UserListView = Backbone.View.extend({

    template: Handlebars.compile( list_template ),

    events: {
      "click .guest": "edit",
      "click button.delete": "delete"
    },

    initialize: function() {

      this.collection = new UserList();
      this.collection.fetch({reset: true});
      _.bindAll(this, "render");
      this.collection.bind("reset", this.render);
      this.collection.bind("remove", this.render);
    },

    render: function() {
      this.$el.html( this.template( { guests: this.collection.toJSON() } ) );
      return this;
    },

    edit: function(e) {
      var id = $(e.currentTarget).attr("id");
      if (id) {
        Backbone.history.navigate('/users/' + id, true);
      }
    },

    delete: function(e) {
      e.stopPropagation();
      var id = $(e.currentTarget).parents("tr.guest").attr("id");
      this.collection.get(id).destroy();
    }

  });

  var LoginView = Users.prototype.LoginView = Backbone.View.extend({

    template: Handlebars.compile( login_template ),

    events: {

      "click #login-button": "login",
      "click #reset-token-button": "resetToken",
      "click #reset-password-button": "resetPassword",
      "change input": "update"
    },

    initialize: function(options) {
      options = options || {};
      this.passwordReset = options.passwordReset;
      _.bindAll(this, "render", "update");
    },

    render: function() {

      this.$el.html( this.template({user: this.model.getData(), reset: this.passwordReset}) );
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
    },

    resetToken: function(e) {
      e.preventDefault();
      if (!Users.rEmail.test(this.model.get('email'))) {
        $("#reset-email-error-modal").modal();
      }
      else
        this.model.resetToken(function() {
          $("#reset-success-modal").modal();
        },function() {
        $("#reset-error-modal").modal();
      });
    },

    resetPassword: function(e) {
      e.preventDefault();
      this.model.resetPassword(function() {
        Backbone.history.navigate("/guests/login", true);
      },function() {
        $("#reset-error-modal").modal();
      });
    }
  });

  var RegisterView = Users.prototype.RegisterView = Backbone.View.extend({

    template: Handlebars.compile( user_template ),

    events: {

      "click #save-button": "register",
      "change input,textarea,select": "update"
    },

    initialize: function() {

      _.bindAll(this, "render", "update");
      this.model.on("invalid", this.render);
    },

    render: function() {
      var data = {
        responded: this.model.get("rsvp") !== undefined,
        going: this.model.get("rsvp") === 'yes',
        user: this.model.toJSON(),
        title: "New Guest",
        button_text: "RSVP",
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
      "users/([0-9A-Fa-f]+)": "edit",
      "guests/([0-9A-Fa-f]+)": "edit",
      "users/:email/reset_password?token=:token": "resetPassword",
      "guests/:email/reset_password?token=:token": "resetPassword"
    },

    index: function() {

      app.setView(new UserListView());
    },

    login: function() {
    
      app.setView(new LoginView({model: new User()}));
    },

    register: function() {
    
      app.setView(new RegisterView({model: new User()}));
    },

    logout: function() {

      Users.me.logout();
      Backbone.history.navigate("/guests/login", true);
    },

    editme: function() {

      app.setView(new UserView({model: Users.me}));
    },

    edit: function(id) {

      app.setView(new UserView({model: new User({_id: id})}));
    },

    resetPassword: function(email, token) {
      app.setView(new LoginView({model: new User({email: email, token: token}), passwordReset: true}));
    }
  });

  return Users;
});
