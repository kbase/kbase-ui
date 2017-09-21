# Development Setup

## Prerequisites

- VirtualBox
- Vagrant
- git

## Without local Auth2 

## Get Repos

In a dedicated directory clone the following repos

- https://github.com/kbase/kbase-ui
- https://github.com/kbase/kbase-ui-plugin-auth2-client

```
mkdir auth2dev
cd auth2dev
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/your-github-account/kbase-ui-plugin-auth2-client
```

or as I prefer, using ssh

```text
git clone ssh://git@github.com/eapearson/kbase-ui-plugin-auth2-client
```

## Set up Vagrant

## Create and set up an VM for Ubuntu 14.04 via Vagrant

### Initialize Vagrant:

```
vagrant init ubuntu/trusty64
```

### Set it Vagrant

Edit the ```Vagrantfile``` to set it up for better local development:

```text
config.vm.network "private_network", type: "dhcp"
config.vm.synced_folder ".", "/vagrant", type: "nfs"
config.vm.provider "virtualbox" do |vb|
  vb.memory = 2048
  vb.cpus = 2
  vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
end
```

You can place this anywhere in the file. I usually disperse these where they occur in the Vagrantfile, but they can also be inserted as a lump.

This:

- creates a network interface to your VM, so that you can connect to services running in side it
- uses the ```nfs``` file system for mounting the shared folder inside the vm (which is located inside it at /vagrant)
- sets the memory to a reasonable minimum
- enables the usage of symlinking in shared folders

> You may wish to use a static ip rather than dhcp, in which case the following would apply, where you must obtain the ip from your host configuration.

```text
config.vm.network "private_network", ip: "1.2.3.4"
```

The funny business with NFS is required to allow symbolic linking within the vm using shared folders. The linking is a necessary part of quickly working on kbase-ui plugins.

### Set up the VM

```text
vagrant up
vagrant ssh
sudo su
add-apt-repository ppa:nginx/stable
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y
apt-get autoremove -y
apt-get install git nginx-extras nodejs -y
```

> Note that for all subsequent commands in the vagrant window, we'll assume that "sudo su" is still active.

> Note that as you start up the vagrant-managed vm you will be asked for your password. This is your Mac password, assuming you are an Admin user. This is required for vagrant to update your local Mac nfs configuration.

> NB I've found that sometimes on the first vagrant up, there is an NFS failure. Doing a vagrant reload should work.

### Determine the IP of the VM and set up a local host mapping

Within the VM, obtain the IP address assigned via DHCP and then back on the host add it to the /etc/hosts file.

```text
ifconfig | grep "inet addr:"
```

You'll need to hunt in the output for a line which is not using a private ip. E.g. in the following output 10.0.2.15 and 127.0.0.1 are both private IPs, so 172.28.128.3 is the one we want.

```text
          inet addr:10.0.2.15  Bcast:10.0.2.255  Mask:255.255.255.0
          inet addr:172.28.128.3  Bcast:172.28.128.255  Mask:255.255.255.0
          inet addr:127.0.0.1  Mask:255.0.0.0
```          

Open a new terminal window, edit the /etc/hosts file on your Mac host:

```text
exit
sudo vi /etc/hosts
```

add a line somewhere, e.g. the bottom, like:

```text
1.2.3.4 ci.kbase.us
```

We will be mapping ci.kbase.us into the VM, and inside the VM using an nginx config to map service requests to the real ci.

## Set up Nginx 

Back in the vagrant window we'll be setting 

### Install self signed cert

We must always run auth2 over https. For local development in a browser the self-signed certificate is adequate.

```
cd /vagrant
openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout test.key -out test.crt
```

Openssl will prompt for certificate information. It doesn't really matter what you enter here:

```text
Country Name (2 letter code) [AU]:US
State or Province Name (full name) [Some-State]:California
Locality Name (eg, city) []:Berkeley
Organization Name (eg, company) [Internet Widgits Pty Ltd]:KBase
Organizational Unit Name (eg, section) []:web dev
Common Name (e.g. server FQDN or YOUR name) []:ci.kbase.us
Email Address []:
```

### Install the Nginx config

Edit the main nginx config file. Nginx installs with a single example, functional config file in /etc/nginx/sites-available/default. config files in /etc/nginx/sites-available are symlinked into /etc/nginx/sites-enabled. Thus to disable a config temporarily, remove the symlinked version in /etc/nginx/sites-enabled, and symlink it back later. In any case, we always edit the one in sites-available.

We are going to edit that file, erase the contents, and insert our config. E.g.

```text
vi /etc/nginx/sites-available/default
:1,$d
i
```

copy this 

```text
# redirect accidental insecure requests to https
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name ci.kbase.us;
  return 301 https://ci.kbase.us$request_uri;
}
server {
  listen 443 ssl;
  server_name ci.kbase.us;
  ssl_certificate /vagrant/test.crt;
  ssl_certificate_key /vagrant/test.key;
  # Proxy all service calls, including auth2, to the real CI
  location /services {
    proxy_cookie_path /login /services/auth/login;
    proxy_cookie_path /link /services/auth/link;
    proxy_pass https://ci.kbase.us/services;
  }
  # Needed for dynamic service calls
  location /dynserv {
    proxy_pass https://ci.kbase.us/dynserv;
  }
  # Needed for running narratives
  location /narrative {
    proxy_pass https://ci.kbase.us/narrative;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  # Proxy all non-services to the local kbase-ui running in the vm
  location / {
    # next line for node testing server.
    # proxy_pass http://127.0.0.1:8080;
    root /vagrant/kbase-ui/build/build/client;
    index index.html;
  }
}
```

paste into the terminal running vi

```text
<esc>
ZZ
```

### Test it

The server should be set up enough to verify that it will build. Note that we do not yet have an instance of kbase-ui running, but the configuration is complete enough to test:

```text
nginx -t
```

if all goes well

```text
service nginx restart
```

## Set up kbase-ui

This is a host-based development workflow, so we'll set up kbase-ui on the host side. (We'll need to dip back over to the server to perform one more task later.)

Exit out of vagrant

```text
exit
```

### Build and set up kbase-ui in host

Typically you will be building kbase-ui in your host (e.g. Mac) environment and not in the VM. This is simply because it is a faster workflow.

In the kbase-ui repo, build it:

```text
cd kbase-ui
make init
make build
```

Bring it up in the browser: https://ci.kbase.us

### Now try in the vagrant vm

First clean it in the host

### Set up linking

Linking source assets into the build directory tree is the primary tool for rapid kbase-ui development.

In this example below, we are linkin the auth2 plugin

> TODO: this needs to be generalized to any plugin...

Now we'll need to set up the linking script, by copying it from config/link.sh to dev/test/link.sh

```text
cp config/link.sh dev/test/link.sh
```

Edit the link.sh script to link in the auth2 client. Open the link.sh script in your editor, and in the EXTERNAL PLUGINS section add this line

```text
linkPlugin "auth2-client"
```

### Link the auth2 client

The linking for the auth2 client must be done on the vagrant side.

So, back in the terminal window logged into vagrant, do this:

```text
cd /vagrant/kbase-ui/dev/test
sudo bash link.sh
```
