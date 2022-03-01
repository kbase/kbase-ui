# check that the deploy config file is ok.
DEPLOY_CFG=/kb/deployment/app/deploy/config.json
NGINX_CFG=/etc/nginx/nginx.conf

echo "Checking config file..."

if [ ! -f "${DEPLOY_CFG}" ]
then
    echo "The deployment config was not found"
    echo "Target file is ${DEPLOY_CFG}"
    exit 1
else
    echo "...found!"
fi

if grep -q "<no value>" ${DEPLOY_CFG}
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


echo "Checking nginx config file..."
if [ ! -f "${NGINX_CFG}" ]
then
    echo "The nginx config was not found"
    echo "Target file is ${NGINX_CFG}"
    exit 1
else 
    echo "...found!"
fi

echo "OK. Execing nginx... Press Control-C to exit."

# start nginx
exec nginx -c ${NGINX_CFG}
