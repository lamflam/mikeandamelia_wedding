
module.exports = [
	{ method: "post",   path: "/api/users/authenticate",                  controller: "users",     handler: "authenticate"     },
	{ method: "all",    path: "*",                                        controller: "users",     handler: "isAuthenticated"  },
	{ method: "get",    path: "/api/users/me",                            controller: "users",     handler: "me"               },
	{ method: "put",    path: "/api/users/me",                            controller: "users",     handler: "updateMe"         },
  { method: "get",    path: "/api/users",                               controller: "users",     handler: "list"             },
  { method: "post",   path: "/api/users",                               controller: "users",     handler: "create"           },
  { method: "get",    path: "/api/users/:id([0-9A-Fa-f]+)",             controller: "users",     handler: "get"              },
  { method: "put",    path: "/api/users/:id([0-9A-Fa-f]+)",             controller: "users",     handler: "update"           },
  { method: "delete", path: "/api/users/:id([0-9A-Fa-f]+)",             controller: "users",     handler: "delete"           },
	{ method: "post",   path: "/api/users/:email/reset_token",            controller: "users",     handler: "resetToken"       },
	{ method: "post",   path: "/api/users/:email/password",               controller: "users",     handler: "resetPassword"    },
  { method: "get",    path: "/api/guests/me",                           controller: "users",     handler: "me"               },
	{ method: "put",    path: "/api/guests/me",                           controller: "users",     handler: "updateMe"         },
	{ method: "post",   path: "/api/guests/reset_token",                  controller: "users",     handler: "resetToken"       },
	{ method: "post",   path: "/api/guests/reset_password",               controller: "users",     handler: "resetPassword"    },
  { method: "get",    path: "/api/guests",                              controller: "users",     handler: "list"             },
  { method: "post",   path: "/api/guests",                              controller: "users",     handler: "create"           },
  { method: "get",    path: "/api/guests/:id([0-9A-Fa-f]+)",            controller: "users",     handler: "get"              },
  { method: "put",    path: "/api/guests/:id([0-9A-Fa-f]+)",            controller: "users",     handler: "update"           },
  { method: "delete", path: "/api/guests/:id([0-9A-Fa-f]+)",            controller: "users",     handler: "delete"           },
  { method: "post",   path: "/api/guests/:email/reset_token",           controller: "users",     handler: "resetToken"       },
	{ method: "post",   path: "/api/guests/:email/password",              controller: "users",     handler: "resetPassword"    }
  // { method: "post",   path: "/api/convos",                              controller: "convos",    handler: "create"           },
  // { method: "get",    path: "/api/convos",                              controller: "convos",    handler: "list"             },
  // { method: "get",    path: "/api/convos/:id([0-9A-Fa-f]+)",            controller: "convos",    handler: "get"              },
  // { method: "post",   path: "/api/convos/:id([0-9A-Fa-f]+)/messages",   controller: "convos",    handler: "post"             }
];
