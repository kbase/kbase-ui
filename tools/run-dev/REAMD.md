# Development Runner

Runs the kbase-ui web app behind nginx in a container.

## Docker container method

export SRC_DIR=`pwd`/react-app/src
export DEPLOY_ENV=narrative-dev
export INI_DIR=`pwd`/dev/gitlab-config
docker-compose -f docker-compose-dev.yml up

TODO:
start-dev-server.bash -

should be .sh not .bash, doesn't use bash features, and bash not in default nginx image

should take env from env variable


## Manual method - please improve!

Build image:

```bash
docker build -f tools/run-dev/Dockerfile -t kbase-ui-dev:dev .    
```


```bash
docker run -it --hostname=kbase-ui --entrypoint=sh --network=kbase-dev -p 3000:3000 -e CHOKIDAR_USEPOLLING=true  -v `pwd`/react-app/src:/kb/deployment/app/src -v `pwd`/build/dist/modules/plugins:/kb/deployment/app/modules/plugins  kbase-ui-dev:dev
```

set DEPLOY_ENV for one other than CI.

```bash
docker run -it --hostname=kbase-ui --entrypoint=sh --network=kbase-dev -p 3000:3000 -e CHOKIDAR_USEPOLLING=true -e DEPLOY_ENV=narrative-dev -v `pwd`/react-app/src:/kb/deployment/app/src -v `pwd`/build/dist/modules/plugins:/kb/deployment/app/modules/plugins  kbase-ui-dev:dev
```

Then sh into container:

currently cheese out and use Docker Desktop

then, in container shell:

cd deployment/app
npm install
npm run start

