#!/bin/sh
set -e

IMAGE=kbase/kbase_ui:develop
TFILE=ui.tags

docker run -i --rm --entrypoint cat $IMAGE /tmp/tags > $TFILE

REBUILD=0
for module in $(cat $TFILE|awk -F\| '{print $1}') ; do
  repo=$(egrep "^$module\|" $TFILE|awk -F\| '{print $2}')
  branch=$(egrep "^$module\|" $TFILE|awk -F\| '{print $3}')
  tag=$(egrep "^$module\|" $TFILE|awk -F\| '{print $4}')

  rtag=$(git ls-remote $repo heads/$branch --tags|awk '{print $1}')
  echo "Checking $module"
  if [ $rtag != $tag ] ; then
    echo $module $tag $rtag
    REBUILD=1
  fi
done

if [ $REBUILD -eq 0 ] ; then
  echo "No changes.  Exiting."
  exit
else
  echo "Rebuilding Base Image"
  date > kbase_base/build-ui.trigger
  (cd kbase_base;docker build -t kbase/kbase_ui:develop -f Dockerfile.kbaseui .)
fi

docker run -i --rm -v `pwd`/ci:/config -v /data/docker/kbaseui:/data/kbase-ui kbase/kbase_ui:develop rsync || echo "Ignoring rsync failures"

docker run -i --rm -v `pwd`/ci:/config -v /data/docker/kbaseui:/data/kbase-ui --entrypoint sed kbase/kbase_ui:develop -i 's/next.kbase.us/ci.kbase.us/' /data/kbase-ui/modules/config/service.yml 

