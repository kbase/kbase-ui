#!/bin/bash

# Builds the js docs into a location of your choosing...

PACKAGE=ui-common
TOPDIR=`pwd`
FAKEDEPLOY=$TOPDIR/../fake-deploy
JSDOCSDIR=$FAKEDEPLOY/jsdocs
SRCDIR=/$TOPDIR/src


# remove the doc dir?

jsdoc -d $JSDOCSDIR -p $SRCDIR/kbaseUtils.js $SRCDIR/kbaseAsyncQueue.js $SRCDIR/kbaseStateMachine.js $SRCDIR/kbaseTest.js