# Development Proxy

Docker manual:

build:

docker build . -t kbase/kbase-ui-proxy:dev


run:

docker run kbase/proxy:dev

docker run --network kbase-dev -p 80:80 -p 443:443 --dns 8.8.8.8 --rm -e "deploy_hostname=ci.kbase.us" -e "kbase_ui_host=kbase-ui" kbase/kbase-ui-proxy:dev

env vars:

required:
deploy_hostname
kbase_ui_host

optional:
local_navigator
local_narrative
service_proxies
dynamic_service_proxies