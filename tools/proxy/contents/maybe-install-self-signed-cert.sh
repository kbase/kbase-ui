#!/bin/bash

if [ ! -f /kb/deployment/ssl/test.cert ]; then
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /kb/deployment/ssl/test.key -out /kb/deployment/ssl/test.crt -subj "/C=US/ST=California/L=Berkeley/O=LBNL/OU=KBase/CN=ci.kbase.us"
fi