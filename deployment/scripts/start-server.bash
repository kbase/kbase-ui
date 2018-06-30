# check that the deploy config file is ok.
DEPLOY_CFG=/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json

echo "Checking config file..."

if [ ! -f "${DEPLOY_CFG}" ]
then
    echo "The deployment config was not found"
    echo "Target file is ${DEPLOY_CFG}"
    exit 1
fi

if grep -q "<no value>" ${DEPLOY_CFG}
then
    echo "Deployment config contains <no value>, indicating that the docker run"
    echo "environment is missing a key used in the config template."
    echo "Target file is ${DEPLOY_CFG}"
    exit 1
fi

echo "OK. Execing nginx... Press Control-C to exit."

# start nginx
exec nginx