DEPLOY_DEST=/kb/deployment/services/kbase-ui
rm -rf $DEPLOY_DEST
mkdir -p $DEPLOY_DEST
cp -pr build/build/client/* $DEPLOY_DEST
