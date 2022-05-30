export INSTALL_VERSION=${VERSION:-v0.15.1}
wget -O - https://github.com/powerman/dockerize/releases/download/${INSTALL_VERSION}/dockerize-`uname -s`-`uname -m` | install /dev/stdin /usr/local/bin/dockerize
