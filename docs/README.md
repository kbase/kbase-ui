# kbase-ui Docs

> Documentation for kbase-ui

## Usage

HOW TO GET STARTED and USE IT

## Install

This documentation is designed to be accessed at its home on Github, located at (https://kbaseIncubator.github.io/kbase-ui-docs).

You can view it locally as well:

### macOS Native

macOS ships with Ruby. However, since it is at the system level it may require root access to install gems. It should prompt you for your password (assuming you have admin access), but that doesn't always work. A good solution is documented here: https://guides.cocoapods.org/using/getting-started.html#sudo-less-installation.

To cut to the chase:

```bash
export GEM_HOME=$HOME/.gem
export PATH=$GEM_HOME/bin:$PATH
```

## macOS with `rbenv`

`rbenv` is a simple tool which allows you to install multiple versions of Ruby, with associated dependencies installed separately. It offers some of advantages over the system Ruby:

- We can use a specific version of Ruby
- Ruby dependencies (Gems) are installed separate from the system
- Admin privileges not required to install dependencies

Using `macports`:

```zsh
sudo port install rbenv ruby-build
```

Using `home brew`:

```zsh
brew install rbenv ruby-build
```

Set up rbenv:

> See: [https://github.com/rbenv/rbenv](https://github.com/rbenv/rbenv)

```zsh
rbenv init
```

instructions will be printed for completing the rbenv integration. This is optional, and simply means that in future terminal sessions you don't need to enter a command to enable rbenv within the terminal session.

E.g., in macOS Catalina:

```zsh
# Load rbenv automatically by appending
# the following to ~/.zshrc:

eval "$(rbenv init -)"
```

If you don't want rbenv to be set up in your shell init script, you can simply enter at the terminal:

```zsh
eval "$(rbenv init -)"
```

Note that this will only be effective for this specific Terminal session.

Check your setup:

```zsh
curl -fsSL https://github.com/rbenv/rbenv-installer/raw/master/bin/rbenv-doctor | bash
```

Install a version of ruby:

```zsh
rbenv install 2.7.0
```

If you want to use this ruby version permanently,

```zsh
rbenv global 2.7.0
```

for this project

```zsh
rbenv local 2.7.0
```

for the shell session only

```zsh
rbenv local 2.7.0
```

Although `bundler` may be installed with Ruby using rbenv, it is best to just install it from scratch to get the most recent version (at present we need version 2).

```zsh
gem install bundler
```

#### Using rvm

Another tool for installing and managing multiple Rubys is `rvm`. Some consider it more complex than it needs to be, and it is more intrusive into your shell startup scripts, but it is simple to use.

Install rvm from https://rvm.io

##### Install rvm

This will install rvm into your own home directory.

```zsh
gpg2 --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3 7D2BAF1CF37B13E2069D6956105BD0E739499BDB
\curl -sSL https://get.rvm.io | bash -s stable
```

##### Install ruby

```zsh
rvm install 2.7.0
```

This will take a while. It is possible that you'll need to install macOS developer tools like XCode, macports, or homebrew. I use macports, and the install does conduct a macports update.

Open a terminal into this repo's top level directory

- install `bundler` version 2 if you don't already have it (it is a Ruby package.) 

  If you installed Ruby with rvm, bundler 1 will already been installed. It will be need to be updated:

    ```bash
    gem install bundler
    ```

    > Note that this and other Ruby related commands will probably ask you to authorize installation. This is because the packages (gems) are being installed at the system level. Just go ahead and authorize - do not try to run these commands with `sudo`, as they are designed to be run as a regular user and only prompt for authorization when they need to.

### Setup and Start Local Development Server

Now you are ready to start up a local copy of the documentation site. This is accomplish by running a built-in server provided by Jekyll.

- open a terminal in this repo

- you'll be working within the `docs` directory:

    ```zsh
    cd docs
    ```

- install dependencies required by github pages:

    ``` bash
    bundle install
    ```

- start the Jekyll server

    ```bash
    bundle exec jekyll serve --livereload
    ```

- take your browser to https://localhost:4000.

- You should see the documentation site in full glory.

- As you edit and save source files, the documentation site will be rebuilt, and the browser will reload automatically.

### Common Editing Tasks

#### Editing an Existing File

All documents which appear in the site are located in the `docs` directory. They are arranged in a directory structure which is the same as the table of contents in the documentation site. Each visible page is a markdown file.

To update a page, simply update the associated markdown file.

If you have the developer server running (as described above), you should see your changes appear on the associated page within a few seconds.

#### Changing a menu item

The menu is stored in the standard Jekyll yaml configuration file `_config.yml` located in the `docs` directory.

The `navigation` section contains a single item `menu`, which itself represents the entire navigation menu as a hierarchy as it appears on the site itself.

Each menu item requires the `label` property. The label serves as the menu label, a navigation element in the url, and also either a directory entry or the documentation file to display.

To change a menu's label, simply edit the associated label in this file.

Autoloading does not work for changes to the config file, nor does manual reloading of the page - so you'll need to stop and start the development server.

#### Adding a new file

[ to be written ]

#### Removing a file

[ to be written ]

#### Updating or adding an image

[ to be written ]

#### Adding a "quicklink"

[ to be written ]

### Current Issues

#### search broken

If you see messages like `ERROR '/search-data.json' not found.` in the terminal in which you started `jekyll serve`, the search index needs to be built. Unfortunately, our theme's support for search is broken in several respects, and generating the search index will not help. Since search is not exposed, it is currently a harmless error.

### Building

When you have finished a unit of work on the documentation, you will want to build it.

Building the docs creates a static web site in the `docs` directory of the repo.

```bash
JEKYLL_ENV=production bundle exec jekyll build --destination ../../docs
```

### The theme

[ to be written ]

## See Also

- [KBase Github Pages Theme](https://github.com/kbase/kbase-github-pages-theme)

## License

SEE LICENSE IN LICENSE.md
