#ln -s  ../../../../../kbase-ui-plugin-datawidgets/src/plugin ./datawidgets

PLUGIN=datawidgets
REPO=kbase-ui-plugin-$PLUGIN
BASE=/Users/erik/work/kbase/sprints/kbase-ui/repos

rm -r $BASE/kbase-ui/build/client/modules/plugins/$PLUGIN
ln -s $BASE/$REPO/src/plugin $BASE/kbase-ui/build/client/modules/plugins/$PLUGIN 
# ln -s /Users/erik/work/kbase/sprints/kbase-ui/repos/kbase-ui-plugin-datawidgets/src/plugin `pwd`/build/client/modules/plugins/datawidgets
