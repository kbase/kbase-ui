# Bowerizing JS Repos



bower register <bower id> <repo>

bower register kbase-ui git://github.com/kbase/kbase-ui

bower register kbase-ui git://github.com/eapearson/kbase-ui


## Testing with local private bower registry

- set up local registry
- point .bowerrc to it:

```
{
    "analytics": false,
    "directory": "bower_components",
    "registry": "http://localhost:5678/",
    "timeout": 300000
}
```

## Adding to regsitry



## Removing from registry


##

bower register kbase-ui-demo-vis-widget git://github.com/eapearson/kbase-ui-plugin-demo-vis-widget
bower register kbase-ui-plugin-typeview git://github.com/eapearson/kbase-ui-plugin-typeview
bower register kbase-ui-plugin-dataview git://github.com/eapearson/kbase-ui-plugin-dataview
bower register kbase-ui-plugin-dashboard git://github.com/eapearson/kbase-ui-plugin-dashboard
bower register kbase-ui-plugin-databrowser git://github.com/eapearson/kbase-ui-plugin-databrowser
bower register kbase-ui-plugin-typebrowser git://github.com/eapearson/kbase-ui-plugin-typebrowser
bower register kbase-ui-plugin-datawidgets git://github.com/eapearson/kbase-ui-plugin-datawidgets
bower register kbase-ui-widget git://github.com/eapearson/kbase-ui-widget
bower register kbase-common-js git://github.com/eapearson/kbase-common-js
bower register kbase-service-clients-js git://github.com/eapearson/kbase-service-clients-js

bower register kbase-ui git://github.com/eapearson/kbase-ui

bower info <bower id>


 "kbase-ui-plugin-demo-vis-widget": "0.1.0",
        "kbase-ui-plugin-vis-widgets": "0.1.0",
        "kbase-ui-plugin-typeview": "0.1.0",
        "kbase-ui-plugin-dataview": "0.1.1",
        "kbase-ui-plugin-dashboard": "0.1.0",
        "kbase-ui-plugin-databrowser": "0.1.0",
        "kbase-ui-plugin-typebrowser": "0.1.1",
        "kbase-ui-plugin-datawidgets": "0.1.1",
        "kbase-ui-widget": "0.1.0",
        "kbase-common-js": "0.1.0",
        "kbase-service-clients-js": "0.1.0"

bower info kbase-ui-demo-vis-widget
bower info kbase-ui-plugin-typeview
bower info kbase-ui-plugin-dataview
bower info kbase-ui-plugin-dashboard
bower info kbase-ui-plugin-databrowser
bower info kbase-ui-plugin-typebrowser
bower info kbase-ui-plugin-datawidgets
bower info kbase-ui-widget
bower info kbase-common-js
bower info kbase-service-clients-js
bower info 


