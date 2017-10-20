#!/bin/bash -x

export BRANCH=${TRAVIS_BRANCH:-`git symbolic-ref --short HEAD`}
export DATE=`date -u +"%Y-%m-%dT%H:%M:%SZ"`
export COMMIT=${TRAVIS_COMMIT:-`git rev-parse --short HEAD`}
docker build --build-arg BUILD_DATE=$DATE \
     		 --build-arg VCS_REF=$COMMIT \
			 --build-arg BRANCH=$BRANCH \
             -t kbase/kbase_ui:$COMMIT .
