# Dockerfile that builds the base KBase image
#
#Copyright (c) 2015 The KBase Project and its Contributors
# United States Department of Energy
# The DOE Systems Biology Knowledgebase (KBase)
# Made available under the KBase Open Source License
#
FROM ubuntu:16.04
MAINTAINER Erik Pearson eapearson@lbl.gov

ARG DEBIAN_FRONTEND=noninteractive

RUN \
   apt-get update && \
   apt-get upgrade -y && \
   apt-get dist-upgrade -y && \
   apt-get autoremove -y && \
   apt-get install -y \
        software-properties-common curl apt-utils build-essential && \
   apt-get install -y locales && \
   rm -rf /var/lib/apt/lists/* && \
   localedef -i en_US -c -f UTF-8 -A /usr/share/locale/locale.alias en_US.UTF-8
ENV LANG en_US.utf8


# Split here just to manage the layer sizes
RUN \
   # apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 7F0CEB10 && \
   curl -sL https://deb.nodesource.com/setup_6.x | bash && \
   apt-get install -y \
     nginx nginx-extras nodejs \
     apt-transport-https && \
   npm install -g grunt-cli && \
   apt-key adv --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys 58118E89F3A912897C070ADBF76221572C52609D && \
   echo "deb https://apt.dockerproject.org/repo ubuntu-trusty main" >> /etc/apt/sources.list.d/docker.list && \
   apt-get update && \
   apt-get dist-upgrade -y && \
   apt-get autoremove -y && \
   apt-get install -y docker-engine=1.7.1-0~trusty

ENV TARGET /kb/deployment
ENV PATH ${TARGET}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Bogus file to trigger a git clone and rebuild
ADD build-ui.trigger /tmp/
ADD ./scripts/githashes /tmp/githashes
RUN ( echo "Git clone";date) > /tmp/git.log

# Checkout kbase-ui and fixup kbase URL references
RUN \
        mkdir -p /kb/src && \
        cd /kb/src && \
        git clone --recursive https://github.com/kbase/kbase-ui -b develop && \
        grep -lr kbase.us/services /kb/| grep -v docs/ | \
          xargs sed -ri 's|https?://kbase.us/services|https://public.hostname.org:8443/services|g' 
        #sh /tmp/githashes /kb/src/kbase-ui > /tmp/tags && \
        #rm -rf /kb/src/kbase-ui/.git

RUN \
        cd /kb/src/kbase-ui && \
        make init && make config=ci build && ./deploy.sh

ADD ./scripts /kb/scripts
ADD ./config /kb/config
# Additions
# - link is for backwards compatibility
#	cp /kb/config/nginx-full.cfg /etc/nginx/nginx.cfg && \
# ??? # ADD  lets-encrypt-x3-cross-signed.der /tmp/lets.der

RUN \
        chmod a+rx /kb/scripts /kb/config /kb/scripts/* && \
        cp /kb/config/kbase-ui.conf /etc/nginx/sites-available/default

WORKDIR /kb/

ENV USER root
ENTRYPOINT [ "/kb/scripts/kbaseui.sh" ]
# CMD ["nginx", "-g", "daemon off;"]
CMD [ ]

