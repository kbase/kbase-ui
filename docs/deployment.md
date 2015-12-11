# Deploying the KBase UI

## Background - architecture  
The KBase UI is constructed from multiple Git repos. The core repo is this one: [kbase-ui](https://github.com/kbase/kbase-ui). Going through the following build steps will use Bower to automatically download and install elements of the other repos (see [below](#repo-list) for details).

We use a combination of `make` and `grunt` for building the KBase UI. Actually, we mainly use `grunt` for the task running, but each `make` target just wraps it up, if you're more comfortable with that. This also lets the KBase UI stack more easily fit into the rest of the KBase operations efforts.

## Requirements  
Before deploying, your machine will need to have a few JavaScript tools installed.

1. nodejs - https://nodejs.org
  * Mac OSX (10.7+) - Most of the usual installers has it. I recommend Homebrew, with the command `brew install node --update`
  * Debian-flavored Linux - there's already a Debian package named 'node' - you don't want that. use `apt-get` to get the following packages instead: `apt-get install nodejs-dev npm nodejs-legacy`
  * windows - ...?
2. NPM - the Node Package Manager (comes with node). This gets updated fairly often, so it's worth updating it with the following command, once node is installed (might need sudo): `npm install npm -g`
3. Bower - `npm install -g bower`
4. Grunt command line - `npm install -g grunt-cli`

The rest of the dependencies are managed by the install process.

## Local deployment for development and testing

### With make
This is pretty simple, just run `make`, and it will generate a directory called 'build' with everything you need.

To run the test suite, run `make test`.

### Using grunt and other command line tools:
```
npm install
bower install
grunt build
node tools/process_config.js deploy-ci.cfg
```
This is an expansion of what goes on in the make command. The final step builds up the configuration for the UI, including service URLs. For local hacking, it's best to go against the CI server.

To run the test suite, run `grunt test`.


## Server deployment on KBase servers
Easy enough:
```
make && make test && make deploy
```

This does not overwrite anything in the target deployment directory. [**But we can add that if you want! -Bill**]
There might need to be some tweaking needed for some of the variables in the Makefile, such as deployment directories and configurations.

### process_config.js
This configurator script has a few options for where it gets its configuration, in order of overriding.
1. Default = deploy.cfg in the root of kbase-ui [**might be deprecated**]
2. A file passed in as a parameter to the script
3. The `KB_DEPLOYMENT_CONFIG` environment variable (overrides everything if present).

Regardless of how it finds the config file, it expects the same thing - an INI formatted file with a [ui-common] stanza [**change to kbase-ui?**], and a number of key-value pairs for each URL. See [deploy-ci.cfg](https://github.com/kbase/kbase-ui/blob/master/deploy-ci.cfg) for an example.


## <a name="repo-list"></a>List of KBase-UI repos  
| repo | description |
| :--- | :--- |
| kbase-ui | the core kbase repo. This one! |
| kbase-common-js | utilities, etc., that augment the modules in kbase-ui |
| kbase-ui-plugin-dataview | landing pages and their widgets |
| kbase-ui-plugin-dashboard | the dashboard page and its widgets |