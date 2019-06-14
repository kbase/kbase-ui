


## Developer build for working on external plugins

The setup for working on external plugins is very similar to that of working on kbase-ui, except that you must clone the plugins and instruct the image runner to mount the plugins.

The short list:

- create top level working directory
- within this directory clone kbase-ui and any plugins you want to work on
    - kbase-ui needs to start out in develop branch of kbase/kbase-ui
    - plugins only have a master branch
- build kbase-ui
- build the kbase-ui dev image
- configure your /etc/hosts to use the dev server
- run the image with the plugins linked in:


### Create Top Level Working Directory

The kbase-ui tools assume that kbase-ui is cloned alonside any plugins or libraries which are linked into it. Therefore, you need to create a single working directory and clone the repos inside of it.

Let's assume this is ~/work/dev, or just dev for short.

### Clone kbase-ui and any plugins

```bash
cd ~/work/dev
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/kbase/kbase-ui-plugin-my-plugin
```

You'll need a PR friendly git clone setup. There are several ways to do this. Using the above as a starting point, for instance:

```bash
cd ~/work/dev/kbase-ui
git checkout -b <my-plugin-work>
git remote add <nickname> ssh://git@github.com/<account>/kbase-ui
cd ~/work/dev/kbase-ui-plugin-my-plugin
git checkout -b <my-plugin-work>
git remote add <nickname> ssh://git@github.com/<account>/kbase-ui-plugin-my-plugin
```

This will add your fork of kbase-ui under the remote name <nickname>. Note that it is using ssh transport, which will your ssh key registered at github. If you don't work with ssh keys, you would just use the normal https form:

```bash
git remote add <nickname> https://githiub.com/<account>/kbase-ui
```

Of course this assumes you have forked kbase-ui!

You would be working in the new local branch named <my-plugin-work>, which started at the tip of the develop branch. You would then push your changes up to your fork like

```bash
cd ~/work/dev
git push <my-plugin-work>
```

Working with the plugin is similar, except your branch starts at the tip of the master branch.

Of course, your workflow may be completely different, this is just an example.

