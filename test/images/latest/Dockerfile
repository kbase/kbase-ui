FROM kbase/kbase-ui:latest

ENTRYPOINT [ "dockerize" ]

CMD [  "-template", "/kb/deployment/templates/nginx.conf.tmpl:/etc/nginx/nginx.conf", \
       "-template", "/kb/deployment/templates/config.json.tmpl:/kb/deployment/services/kbase-ui/dist/modules/deploy/config.json", \
       "bash", "/kb/deployment/scripts/start-server.bash" ]