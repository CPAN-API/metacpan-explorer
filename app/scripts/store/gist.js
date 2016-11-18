define(["jquery", "underscore", "backbone"], function($, _, Backbone) {

  var Storage = function() { return; };
  _.extend(Storage.prototype, Backbone.Events, {
    config: {
      user: 'metacpan-user',
      token: github_token()
    },
    request: function(options) {
        //options.url += "?access_token=" + this.config.token;
      return $.ajax(options);
    },
    find: function(model, options) {
      return this.request({
        url: "https://api.github.com/gists/" + model.id,
        context: this,
        dataType: "json"
      });
    },
    findAll: function() {
      return $.ajax({
        url: "https://api.github.com/users/" + this.config.user + "/gists",
        context: this,
        dataType: "json"
      });
    },
    create: function(model, options) {
      var gist = {
        public: false,
        files: {
          "endpoint.txt": {
            content: model.get("endpoint")
          },
          //"response.json": {
          //  content: model.get("response")
          //},
          "body.json": {
            content: model.get("body") || "null"
          }
        }
      };
      return this.request({
        url: "https://api.github.com/gists" + (model.id ? "/" + model.id : ""),
        type: model.id ? "PATCH" : "POST",
        context: this,
        dataType: "json",
        contentType: "application/json",
        data: JSON.stringify(gist)
      }).then(function(res) { return { id: res.id }; });
    },
    update: function() { return this.create.apply(this, arguments); },
    destroy: function() { throw "destroy not implemented in " + this; },
    sync: function(method, model, options) {
      model.trigger("load:start");
      options = options || {};
      var resp;
      switch (method) {
        case "read": resp = model.id ? this.find(model, options) : this.findAll(model, options); break;
        case "create": resp = this.create(model, options); break;
        case "update": resp = this.update(model, options); break;
        case "delete": resp = this.destroy(model, options); break;
      }
      resp.always(function() { model.trigger("load:end"); });
      return resp.fail(options.error || $.noop).done(options.success || $.noop);
    }
  });
  return Storage;
});
