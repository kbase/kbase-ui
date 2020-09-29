---
---
# Changing a menu item

The menu is stored in the standard Jekyll yaml configuration file `_config.yml` located in the `docs` directory.

The `navigation` section contains a single item `menu`, which itself represents the entire navigation menu as a hierarchy as it appears on the site itself.

Each menu item requires the `label` property. The label serves as the menu label, a navigation element in the url, and also either a directory entry or the documentation file to display.

To change a menu's label, simply edit the associated label in this file.

Autoloading does not work for changes to the config file, nor does manual reloading of the page - so you'll need to stop and start the development server.