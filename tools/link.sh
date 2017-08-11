# use within the vm in the directory /vagrant/kbase-ui/dev/tools
# see the docs

# Set the root of the project.
# This is the directory which contains kbase-ui and any plugin repo directories.
export DEVDIR=`pwd`/../../..
echo "Dev dir is $DEVDIR"

#
# linkLib links a kbase support library into the source tree.
#
# usage: linkLib package module sourcePath
#
# where 
#   module_root is the module root directory. 
#   module is the canonical name for the library, and is prefixed by kbase- in global 
#     naming contexts such as repo names. 
#   sourcePath is the path to the source distribution within the repo. This path will be 
#     spliced into the kbase-ui build tree in the modules/$package directory.
#
function linkLib() {
   local module_root=$1
   local libname=$2
   local source_path=$3

   echo "Linking library $libname"
   # echo $DEVDIR/kbase-$libname/$source_path
   # echo ../../build/build/client/modules/$module_root

    rm -rf ../../build/build/client/modules/$module_root
    ln -s $DEVDIR/kbase-$libname/$source_path ../../build/build/client/modules/$module_root
}

#
# linkPlugin links an external plugin into the build tree.
#
# It enables the basic workflow for working on external plugins.
#
#  usage: linkPlugin plugin
#
function linkPlugin() {
    local plugin=$1

    echo "Linking external plugin $plugin"

    rm -rf ../../build/build/client/modules/plugins/$plugin
    ln -s $DEVDIR/kbase-ui-plugin-$plugin/src/plugin ../../build/build/client/modules/plugins/$plugin
}

#
# linkInternalPlugin links a kbase-ui built-in plugin into the build.
#
# It is useful for making changes to internal plugins without rebuilding
# the source tree each time.
#
# usage: linkInternalPlugin plugin
#
function linkInternalPlugin() {
    local plugin=$1

    echo "Linking internal plugin $plugin"

    rm -rf ../../build/build/client/modules/plugins/$plugin
    ln -s $DEVDIR/kbase-ui/src/client/modules/plugins/$plugin ../../build/build/client/modules/plugins/$plugin
}

#
# linkRepoFile links an arbitrary directory or file from the 
# dev directory root into the build directory
#
# It is useful for linking an arbitrary repo or bit of a repo
# into the build directory for extreme hacking. For instance,
# debugging a third party dependency.
#
# usage: linkRepoFile from to
#
function linkRepoFile() {

    # from is relative to the dev dir, the container for all repos
   local from=$1
   # to is relative to this directory, but could be DEVDIR/kbase-ui
   local to=$2

   local source=$DEVDIR/$from
   local dest=../../build/build/client/$to

   echo "Linking repo file $from"

    rm -rf $dest
    ln -s $source $dest
}

#
# linkSrcFile links an arbitrary kbase-ui source directory or file
# into the build directory.
#
# It is useful for hacking on bits of the ui without going through the
# build process each time.
#
# usage: linkSrcFile from to
#
function linkSrcFile() {
    # from is relative to the dev dir, the container for all repos
   local from=$1
   # to is relative to this directory, but could be DEVDIR/kbase-ui
   local to=$2

   local source=$DEVDIR/kbase-ui/src/client/$from
   local dest=../../build/build/client/$to

   echo "Linking source file $from"

    rm -rf $dest
    ln -s $source $dest
}

#
# MODULE LIBS
#

# Support for linking kbase libraries into the a kbase-ui build.

# linkLib "package" "module"
# where package is the directory within modules/kb owned by this library
# module is the repo directory following the kbase- namespacing prefix

# usage:
# linkLib module_root libname source_path
# see the function definition above for details

# examples:
# linkLib2 'kb_service' 'service-clients-js' 'dist/kb_service'
# linkLib2 'kb_common' 'common-js' 'dist/kb_common'

#
# EXTERNAL PLUGINS
#

# Support for linking kbase-ui plugins into the kbase-ui build

# An external plugin is one that is installed into kbase-ui from bower 
# during the build process. None of the code, other than configuration 
# for the bower package name and version, resides in kbase-ui.
#
# To link it into the build, you want to grab the src/plugin directory 
# within it and point it to build/build/client/modules/plugins/PLUGIN
# The build process performs no special transformations on the plugin
#  

# usage:
# linkPlugin plugin_name

# examples:
# linkPlugin "dataview"
# linkPlugin "data-landing-pages"
# linkPlugin "datawidgets"

#
# INTERNAL PLUGINS
#

# This is helpful if you are working on plugins built in to kbase-ui. What you are doing is 
# linking the source plugin directory to the corresponding build plugin directory.
#

# usage: 
# linkInternalPlugin plugin_name

# examples:
# linkInternalPlugin about
# linkInternalPlugin catalog