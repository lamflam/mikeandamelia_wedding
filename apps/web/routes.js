
module.exports = [
  { method: "get", path: /^(?!\/(api)).*/, controller: "main", handler: "index" }
];
