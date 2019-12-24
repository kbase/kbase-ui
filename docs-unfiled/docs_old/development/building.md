# About Building



Here is the usage output:

```bash
Usage: run-image.sh env [-p external-plugin] [-i internal-plugin] [-l lib-module-dir:lib-name:source-path]'
```

You should see a successful startup of the docker container, with log lines printed into the console.



#### env argument

The first argument to run-image is the ```env``. This value corresponds to the corresponding deployment config file located in deployment/conf. Since we are supplying "dev", we will be using the deploy file "deployment/conf/dev.ini".

#### -p argument

We are using the -p argument to specify an external plugin to link into the kbase-ui image. Note that we use the plugin name, not the repo name. The tool knows how to find the plugin directory based on the directory structure (it should be a sister directory to kbase-ui) and uniform naming structure for repos (kbase-ui-plugin-PLUGINNAME).

### Example

```bash
bash /Users/erikpearson/work/kbase/sprints/2018Q1S1/kbase-ui/deployment/dev/tools/run-image.sh dev
CONFIG MOUNT: /Users/erikpearson/work/kbase/sprints/2018Q1S1/kbase-ui/deployment/conf
ENVIRONMENT : dev
READING OPTIONS
MOUNTS:
BusyBox v1.26.2 (2017-11-23 08:40:54 GMT) multi-call binary.

Usage: dirname FILENAME

Strip non-directory suffix from FILENAME
NGINX CONFIG TEMPLATE /kb/deployment/bin/../conf/deployment_templates/nginx.conf.j2
DATA SRC /conf/dev.ini
CONFIG TEMPLATE /kb/deployment/bin/../conf/deployment_templates/config.json.j2
2018/01/03 23:45:01 [notice] 13#13: using the "epoll" event method
2018/01/03 23:45:01 [notice] 13#13: nginx/1.12.2
2018/01/03 23:45:01 [notice] 13#13: OS: Linux 4.9.60-linuxkit-aufs
2018/01/03 23:45:01 [notice] 13#13: getrlimit(RLIMIT_NOFILE): 1048576:1048576
2018/01/03 23:45:01 [notice] 13#13: start worker processes
2018/01/03 23:45:01 [notice] 13#13: start worker process 14
2018/01/03 23:45:01 [notice] 13#13: start worker process 15
2018/01/03 23:45:01 [notice] 13#13: start worker process 16
2018/01/03 23:45:01 [notice] 13#13: start worker process 17
```

> TODO: provide a make task for this