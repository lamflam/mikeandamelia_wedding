
module.exports = [
	{ method: "post",  path: "/api/users/authenticate",  controller: "users",  handler: "authenticate"     },
	{ method: "all",   path: "*",                        controller: "users",  handler: "isAuthenticated"  },
	{ method: "get",   path: "/api/users/me",            controller: "users",  handler: "me"               },
  { method: "get",   path: "/api/users",               controller: "users",  handler: "list"             },
  { method: "post",  path: "/api/users",               controller: "users",  handler: "create"           }
];
