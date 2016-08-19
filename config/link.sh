#!/bin/sh

# Set the root of the project.
# This is the directory which contains kbase-ui and any plugin repo directories.
export DEVDIR=/your/dev/dir

function linkLib() {
   local package=$1
   local module=$2

    rm -rf ../../build/build/client/modules/kb/$package
    ln -s $DEVDIR/kbase-$module/dist/kb/$package ../../build/build/client/modules/kb/$package
}

function linkPlugin() {
    local plugin=$1

    rm -rf ../../build/build/client/modules/plugins/$plugin
    ln -s $DEVDIR/kbase-ui-plugin-$plugin/src/plugin ../../build/build/client/modules/plugins/$plugin
}


#
# MODULE LIBS
#

# These libraries must be structured using namespaces, and own the leaf namespace in which they reside
# In the example, the modules in the library will be available at kb/MODULE. kb is the common short namespace
# id for kbase, MODULE is the namespace for the modules in this package.
# Thus, a module would be referenced in an AMD requirements list as 'kb/LIBPACKAGE/MODULE'
# Note also that /DEVDIR/ is whereever you set up a working directory in which to work
# on kbase-ui and plugins or modules.
# Note also that some modules may make their modules available in dist rather than src

# rm -rf ../../build/build/client/modules/kb/LIBPACKAGE
# ln -s /DEVDIR/kbase-MODULE/src/kb/data ../../build/build/client/modules/kb/LIBPACKAGE

# linkLib "package" "module"
# where package is the directory within modules/kb owned by this library
# module is the repo directory following the kbase- namespacing prefix
# linkLib "common" "common-js"

# linkLib 'sdk-clients' 'sdk-clients-js'

#
# EXTERNAL PLUGINS
#

# An external plugin is one that is installed into kbase-ui from bower during the build process. None of the code, other than 
# configuration for the bower package name and version, resides in KBase.
# To link it into the build, you want to grag the src/plugin directory within it and point it to biuld/build/client/modules/plugins/PLUGIN
# The build process performs no special transformations on the plugin
# 
# 

# linkPlugin "dataview"
# linkPlugin "data-landing-pages"

#
# INTERNAL PLUGINS
#

# This is helpful if you are working on plugins built in to kbase-ui. What you are doing is 
# linking the source plugin directory to the corresponding build plugin directory.
#


# rm -rf ../../build/build/client/modules/plugins/PLUGIN
# ln -s /DEVDIR/kbase-ui/src/client/modules/plugins/PLUGIN ../../build/build/client/modules/plugins/PLUGIN

