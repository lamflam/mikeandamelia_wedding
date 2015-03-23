
module.exports = [
	{ method: "post",  path: "/api/users/authenticate",  controller: "users",  handler: "authenticate"     },
	{ method: "all",   path: "*",                        controller: "users",  handler: "isAuthenticated"  },
	{ method: "get",   path: "/api/users/me",            controller: "users",  handler: "me"               },
  { method: "get",   path: "/api/users",               controller: "users",  handler: "list"             },
  { method: "post",  path: "/api/users",               controller: "users",  handler: "create"           },
  { method: "get",   path: "/api/guests",              controller: "users", handler: "list"             },
  { method: "post",  path: "/api/guests",              controller: "users", handler: "create"           },
  { method: "get",  path: "/api/guests/delete",              controller: "users", handler: "delete"           }
];
