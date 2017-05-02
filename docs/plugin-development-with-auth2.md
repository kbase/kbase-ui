# Development Setup

## Prerequisites

- VirtualBox
  - https://www.virtualbox.org/wiki/Downloads
- Vagrant
  - https://www.vagrantup.com/downloads.html
- Vagrant virtualbox guest update plugin (optional)
  - https://github.com/dotless-de/vagrant-vbguest
- git
  - git is included with Apple's Xcode command line tools, directly from git folks https://git-scm.com/download/mac, or with mac package managers like macports or brew.

## Assumptions

- working on a plugin that is already configured into the kbase-ui, either the dev or prod build (or both.)

## Get Repos

In a dedicated directory clone the following repos

- https://github.com/kbase/kbase-ui
- https://github.com/kbase/kbase-ui-plugin-YOUR-PLUGIN

```
mkdir dev
cd dev
git clone -b develop https://github.com/kbase/kbase-ui
git clone https://github.com/your-github-account/kbase-ui-plugin-YOUR-PLUGIN
```

or as I prefer, using ssh

```text
git clone ssh://git@github.com/eapearson/kbase-ui-plugin-YOUR-PLUGIN
```

## Set up Vagrant

## Create and set up an VM for Ubuntu 14.04 via Vagrant

### Initialize Vagrant:

```
vagrant init ubuntu/trusty64
```

### Set up Vagrant

Edit the ```Vagrantfile``` to set it up for better local development:

```text
config.vm.network "private_network", type: "dhcp"
config.vm.synced_folder ".", "/vagrant", type: "nfs"
config.vm.provider "virtualbox" do |vb|
  vb.memory = "1024"
  vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
end
```

You can place this anywhere in the file. I usually disperse these where they occur in the Vagrantfile, but they can also be inserted as a lump, for example, at the end of the file just before the final "end".vagr

This:

- creates a network interface to your VM, so that you can connect to services running in side it
- uses the ```nfs``` file system for mounting the shared folder inside the vm (which is located inside it at /vagrant)
- sets the memory to a reasonable minimum
- enables the usage of symlinking in shared folders

> You may wish to use a static ip rather than dhcp, in which case the following would apply, where you must obtain the ip from your host configuration.

```text
config.vm.network "private_network", ip: "1.2.3.4"
```

The funny business with NFS is required to allow symbolic linking within the vm using shared folders. The linking is a necessary part of the workflow for kbase-ui plugins.

### Set up the VM

```text
vagrant up
vagrant ssh
sudo su
add-apt-repository ppa:nginx/stable
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y
apt-get autoremove -y
apt-get install nginx-extras -y
```

> Note that for all subsequent commands in the vagrant window, we'll assume that "sudo su" is still active.

> Note that as you start up the vagrant-managed vm you will be asked for your password. This is your Mac password, assuming you are an Admin user. This is required for vagrant to update your local Mac nfs configuration.

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
Organization Name (eg, company) [Internet Widgits Pty Ltd]:LBNL
Organizational Unit Name (eg, section) []:KBase
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
#  redirect accidental insecure requests to https
server {
  listen 80 default_server;
  listen [::]:80 default_server;
  server_name dev.kbase.us;
  return 301 https://ci.kbase.us$request_uri;
}
server {
  listen 443 ssl;
  server_name ci.kbase.us;
  ssl_certificate /vagrant/test.crt;
  ssl_certificate_key /vagrant/test.key;
  # Proxy all service call to the real CI
  # nb the proxie_cookie_path is for the auth service
  # could be a separate location at /services/auth
  location /services {
    proxy_cookie_path /login /services/auth/login;
    proxy_cookie_path /link /services/auth/link;
    proxy_pass https://ci.kbase.us/services;
  }
  # Proxy the narrative including websockets
  location /narrative {
    proxy_pass https://ci.kbase.us/narrative;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
  # Proxy all non-services to the local kbase-ui running in the vm
  location / {
    # next line for node testing server.
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

##

Now we need to restart the virtual machine in order to map the directories and enable the other changes we made to Vagrantfile.

```
exit
exit
vagrant reload
```

The first time reloading the virtual machine may take a while, as the system update may force a rebuild of the virtual box guest additions.

At the end of the reload (and every time you reload or start the virtual machine), vagrant will prompt you for your password. Assuming you have admin rights, this is necessary to temporarily configure NFS on the host mac for interacting with the virtual machine.

If this error occurs

> No guest IP was given to the Vagrant core NFS helper. This is an
internal error that should be reported as a bug.

Just try again. I've found that initial vagrant setup can be buggy, perhaps due to the upgrading of the internal client and the length of time it may take leading to timeouts, but that after this it is stable.

### Test it

The server should be set up enough to verify that it will build. Note that we do not yet have an instance of kbase-ui running, but the configuration is complete enough to test.

First enter the virtual machine:

```
vagrant ssh
```

Then test the ngninx configuration:

```text
sudo nginx -t
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

### Build and set up kbase-ui

In the kbase-ui repo, build it:

```text
cd kbase-ui
make init
make build
```

Confirm quickly that the base build is working by visiting https://ci.kbase.us.

> Note - your browser will give you a security warning, due to the usage of the self-signed certificate. Each browser is different, but it should provide you with a way to bypass the error or add a security exception.

Assuming all has gone well...


Now we'll need to set up the linking script, by copying it from config/link.sh to dev/test/link.sh

```text
cp config/link.sh dev/test/link.sh
```

The dev/test directory is ignored by git, so is a safe place to stash develop-time assets. The link script is merely a convenience to provide symbolic linking for various bits of the ui source into the built ui client, which is what is served by nginx.


Edit the link.sh script to link to the plugin. Open the link.sh script in your editor, and in the EXTERNAL PLUGINS section add this line:

```text
linkPlugin "my-plugin"
```

### Link the plugin 

The linking for the plugin  must be done on the vagrant side.

So, back in the terminal window **logged into vagrant**, do this:

```text
cd /vagrant/kbase-ui/dev/test
sudo bash link.sh
```

> Note that you must issue the linking from within the VM. In these instructions the javascript building and testing occurs in the Mac host environment, and the linking in the Ubuntu vm. This is purely a nod to the convenience of local development with the requirement that linking be within the vm to satisfy nginx with nfs hosted directories. 

You should just need to do this once per development effort. If for some reason you need to rebuild kbase-ui, the linking will need to be repeated.

### Verify

Pull up the kbase-ui web app again in the browser to ensure that the plugin works. You may want to make a quick minor change to the plugin and verify that the change appears in the ui.


## Fin

Now you should be ready to hack on the plugin.