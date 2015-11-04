define(['kb.utils', 'json!config.json'],
function(Utils, config) {
  var Config = Object.create({}, {
    config: {
      value: null,
      writable: true
    },
    init: {
      value: function (cfg) {
        this.config = config[config.setup];
        return this;
      }
    },
    // CONFIG
    getConfig: {
      value: function(key, defaultValue) {
        return Utils.getProp(this.config, key, defaultValue);
      }
    },
  
    setConfig: {
      value: function (key, value) {
        Utils.setProp(this.config, key,  value);
      }
    },

    hasConfig: {
      value: function(key) {
        if (Utils.getProp(this.config, key) !== undefined) {
          return true;
        } else {
          return false;
        }
      }
    }
  });
  return Config.init(); 
  
});
