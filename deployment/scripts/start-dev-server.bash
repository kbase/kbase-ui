#!/bin/bash

# check that the deploy config file is ok.
DEPLOY_CFG="/kb/deployment/app/public/deploy/config.json"
DEPLOY_CFG_TEMPLATE="/kb/deployment/templates/config.json.tmpl"

echo "About to dockerize..."

dockerize \
    -env "/kb/deployment/config/${DEPLOY_ENV}_config.ini" \
    -template "${DEPLOY_CFG_TEMPLATE}:${DEPLOY_CFG}"


echo "Checking config file..."

if [ ! -f "${DEPLOY_CFG}" ]
then
    echo "The deployment config was not found"
    echo "Target file is ${DEPLOY_CFG}"
    exit 1
else
    echo "...found!"
fi

if grep -q "<no value>" "${DEPLOY_CFG}"
then
    echo "Deployment config contains <no value>, indicating that the docker run"
    echo "environment is missing a key used in the config template."
    echo "Target file is ${DEPLOY_CFG}"
    echo "Contents are"
    cat ${DEPLOY_CFG}
    exit 1
else
    echo "...and valid!"
fi
echo "OK. Starting CRA dev server... Press Control-C to exit."

cd /kb/deployment/app
npm ci
ENV=ci npm run start
