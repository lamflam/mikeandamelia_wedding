
define(function(

  _,
  $

) {

  var util = {

    cookie: {

      set: function(name, value, options) {
        options = options || {};
        var expires = "";
        var path = "";
        var s;

        if (options.expires !== undefined) {
          if (options.expires instanceof Date) {
            expires = "; expires=" + options.expires.toGMTString();  
          }
          else {
            s = Date.now() + (options.expires * 1000); 
            expires = "; expires=" + (new Date(s)).toGMTString();
          }
        }

        if (options.path) {
          path = "; path=" + options.path;
        }
        
        document.cookie = name + "=" + value + expires + path;
      },

      remove: function(name, options) {
        options = options || {};
        options.expires = 0;
        this.set(name, "", options);
      },

      get: function(name) {
        var cookies = document.cookie.split(";");
        var i = 0;
        for(;i < cookies.length;i++) {
          cookie = cookies[i].trim();
          if (cookie.indexOf(name + "=") == 0) {
            return cookie.slice(name.length + 1);
          }
        }
      }

    } 
  };

  return util;  
});