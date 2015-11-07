# Managing dependencies for KBase UI
For managing JavaScript package dependencies, we use [Bower](http://bower.io/). This (along with [NPM](https://www.npmjs.com/)) is a common JavaScript package manager that cuts down on repo size and code maintenance. It also lets you specify Github repos for a dependency location. We use that feature pretty extensively in KBase.

Currently, we include a few types of dependencies. Module dependencies that are necessary for the UI site to be built and to run are included via Bower. More programmatic dependencies needed for compiling code and running tests are mostly NodeJS modules. These are included via NPM. It's good practice to stick with one or the other as much as possible.

## Installing dependencies
Once dependencies are included, you can install them all with the simple command
```
bower install
```
or
```
npm install
```

## Adding dependencies
There are two similar commands

If it's needed for running
```
bower install your_dependency --save
```

If it's needed for development and testing, but not at runtime
```
bower install your_dependency --save-dev
```

Both of these go against the Bower registry for common packages.

For installing KBase plugins (**also for third party KBase methods, possibly later**), you can just specify the Github repo by its organization (or user), repo name, and branch, with the following pattern:
```
user/repo#branch
```
For example, kbase-common-js is included as
```
bower install kbase/kbase-common-js#master --save
```

You can also directly edit the `bower.json` file, but that isn't recommended.

# Available dependencies

The 'Package name' column has a link to the official page or repository for each dependency.

The 'Require use' column gives the string used to invoke the package in the module header (either define() or require() statement). For example, to require jQuery and Bootstrap as dependencies, use the following:

```javascript
define(['jquery', 'bootstrap'],
function($, Bootstrap) {
  var $bodyElem = $.find('body');
});
```

These statements are all available in the [Require config](https://github.com/kbase/kbase-ui/blob/master/src/client/js/require-config.js) module as well, if you're more comfortable reading the code.

| Package name | Version | Require use | Description |
| :--- | :--- | :--- | :--- | 
| [RequireJS](http://requirejs.org) | 2.1.20 | 'require' | One of the canonical asynchronous web loaders. Using Require ensures module load order, and helps you make sure that only the needed code and files are loaded when required. |
| [Require css]() | 0.1.8 | 'css!path/to/stylesheet.css' | Asynchronously loads CSS stylesheets |
| [Require text]() | 2.0.14 | 'text!path/to/file.txt' | Asynchronously loads text files, including HTML |
| [Require JSON]() | 0.0.3 | 'json!path/to/file.json' | Asyncronously loads JSON files and returns them as an object. |
| [Require YAML]() | 0.1.2 | 'yaml!path/to/file.yml' | Asynchronously loads YAML files, and returns them as a JavaScript object |
| [Require CSV](https://github.com/kbase/kbase-common-js) | 3.6.3 | 'csv!path/to/file.csv' | Asynchronously loads CSV files, and returns them as an object. Available as part of the [kbase-common-js](https://github.com/kbase/kbase-common-js) utilities. |
| [Underscore] | 1.8.3 | 'underscore' | A utility package with a number of help little functions. |
| [jQuery](http://www.jquery.com) | 2.1.4 | 'jquery' | Makes writing JavaScript easier in many ways, helps with traversing and editing the DOM, managing event propagation, etc. |
| [knockout]() | 3.3.0 | 'knockout' | |
| [Bootstrap](http://getbootstrap.com/) | 3.3.5 | 'bootstrap' | Twitter Bootstrap is a page styling framework that has a ton of options and built-in tools for creating dialogs, tooltips, headers, etc. |
| [Bluebird]() | 3.0.0 | 'bluebird' | A ES6/Promises/A+ compliant promises library. Fills in holes and compatibility missing in jQuery.deferred objects. It's [pretty fast](https://jsperf.com/bluebird-vs-jquery-promises), too. |
| [D3](www.d3js.org) | 3.5.6 | 'd3' | D3 is one of the most used graphical libraries. It provides interactivity, SVG management and rendering, and data management |
| [jQuery Datatables] | 1.10.9 | 'datatables' | Datatables is a popular framework for building interactive, data-driven tables. This is accompanied by the Bootstrap plugin that adds styling compatibility. **If using datatables, be sure to include datatables_bootstrap as well.** |
| [Bootstrap Datatables] | 0.4.0 | 'bootstrap_datatables' | This is an extension to jQuery Datatables that fixes some styling and interaction issues under Bootstrap. **If you want to use Datatables in your module, make sure to include this too.** |
| [SparkMD5](https://github.com/satazor/SparkMD5) | 1.0.0 | 'md5' | Creates and manipulates MD5 hashes |
| [Handlebars]() | 4.0.3 | 'handlebars' | A lightweight templating library, largely for supporting legacy widgets. |
| [Nunjucks]() | 1.3.4 | 'nunjucks' | A more flexible templating library that accepts many different formats of HTML template. |
| [Node-uuid]() | 1.4.3 | 'uuid' | A small package that creates a UUID for you. |
