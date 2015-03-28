
module.exports = [
	{ method: "post",  path: "/api/users/authenticate",  controller: "users",  handler: "authenticate"     },
	{ method: "all",   path: "*",                        controller: "users",  handler: "isAuthenticated"  },
	{ method: "get",   path: "/api/users/me",            controller: "users",  handler: "me"               },
	{ method: "put",   path: "/api/users/me",            controller: "users",  handler: "updateMe"         },
  { method: "get",   path: "/api/users",               controller: "users",  handler: "list"             },
  { method: "post",  path: "/api/users",               controller: "users",  handler: "create"           },
  { method: "get",   path: "/api/users/:id",           controller: "users",  handler: "get"              },
  { method: "put",   path: "/api/users/:id",           controller: "users",  handler: "update"           },
  { method: "get",   path: "/api/guests",              controller: "users",  handler: "list"             },
  { method: "post",  path: "/api/guests",              controller: "users",  handler: "create"           },
  { method: "get",   path: "/api/guests/:id",          controller: "users",  handler: "get"              },
  { method: "put",   path: "/api/guests/:id",          controller: "users",  handler: "update"           }
];
