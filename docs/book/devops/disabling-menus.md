# Disabling Menus in a Deployment

The UI menus consist of the hamburger and the sidebar.

The menus are defined by individual plugins. The definition includes an id, label, icon, a flag indicating whether it appears only when the session is logged in, and a flag indicating if the menu item is disabled.

A menu item does not appear just because it is defined. The ui itself possesses a set of configuration files defining the items appearing on a menu. These files are located at

- config/app/dev/services
- config/app/ci/services
- config/app/prod/services

The menu settings are set on the ui/services/menu config branch, as they menu is managed by the "menu" ui service.

The menu settings are determined at build time during the config merge phase, at which time the various config files are merged and written to ROOT/modules/config/config.json

The deployment config resides in ROOT/modules/deploy/config.json.

It contains a property ```ui.services.menu``` which contains a structure like this:

```json
            "menu": {
                "menus": {
                    "hamburger": {
                        "disabled": []
                    },
                    "sidebar": {
                        "disabled": ["search"]
                    }
                }
            }
```

The menus.sidebar.disabled and menus.hamburger.disabled properties each contain an array of menu ids to disable. The menu ids are applied as a filter to each menu section of the respective menus.

## Setting the disabled menu items

### Environment File

If a menu item is to be disabled in a semi-permanent or permanent mode, it should be set in the deploy config environment file. 

In the kbase-ui repo, the development config files live in deployment/conf/DEPLOY.env, where DEPLOY is one of dev, ci, next, appdev or prod.

Two environment variables may be used to pass to the deploy config template:

```
ui_services_menu_sidebar_disabled=["search"]
ui_services_menu_hamburger_disabled=[]
```

By replacing the underscores (_) with dots, you can see that the variable name forms a path into the kbase-ui config structure.

The value for each one is a json array containing menu ids to be disabled.

Note that the variable values have the form of JSON arrays, but are in actuality transported into the template purely as strings. So be careful.

### Template File

The deploy template