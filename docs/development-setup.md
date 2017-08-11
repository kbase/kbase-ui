# Development Setup

## Prerequisites

see [Development Prerequisites](development-prerequisites.md)

## Assumptions

You want to create a base kbase-ui development environment

## Get Repos

In a dedicated directory clone the kbase-ui repo

- https://github.com/kbase/kbase-ui

```
mkdir dev
cd dev
git clone -b develop https://github.com/kbase/kbase-ui
```

> A git-based workflow is a bit easier if you use an ssh public key in your github account; this is enabled via the ssh: url format.

If you plan on making changes to the ui, you should base the repo off of your own fork, and you may wish to use ssh in order to simplify interactions with github.

For example:

```
git clone -b develop ssh://git@github.com/youraccount/kbase-ui
```

## First build of kbase-ui

We might as well get this over with, because the nginx configuration below presumes that the root directory exists, and the root directory is provided by the kbase-ui build.

In the kbase-ui repo, build it:

```text
cd kbase-ui
make init
make build
```

That is all we will do here for now.

## Set up Vagrant

## Create and set up a virtual machine for Ubuntu 14.04 via Vagrant

> Installation of vagrant and virtualbox is covered in the [development prerequisites](development-prerequisites.md) document.

### Initialize Vagrant:

```
vagrant init ubuntu/trusty64
```

### Set up Vagrant

Edit the ```Vagrantfile``` to set it up for better local development:

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  # Current standard Linux deployment is Ubuntu 14.04
  config.vm.box = "ubuntu/trusty64"

  # DHCP works fine
  config.vm.network "private_network", type: "dhcp"
  
  # For static.
  # config.vm.network "private_network", ip: "1.2.3.4"

  # comment after fixing /etc/exports
  config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: true

  # uncomment after fixing /etc/exports
  # config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: false

  # This will start nginx after the vm is started, and shared folders mounted.
  config.vm.provision :shell, :inline => "sudo service nginx start", run: "always"

  # The resource allocation is suitable for most development needs, including running a Narrative instance
  # inside the VM, but does not impact the host machine much.
  config.vm.provider "virtualbox" do |v|
    v.memory = 2048
    v.cpus = 2
    v.customize ["modifyvm", :id, "--natdnshostresolver1", "off"]
    # This option, in concert with the usage of nfs, allows for the creation of symlinks
    # inside the vm
    v.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
  end
end
```

> Tip: You can find this Vagrant file as well as nginx configuration files in docs/examples

You can place this anywhere in the file. It is easiets to just inserted it as a lump, for example, at the end of the file just before the final "end".

This:

- creates a network interface to your VM, so that you can connect to services running in side it
- uses the ```nfs``` file system for mounting the shared folder inside the vm (which is located inside it at /vagrant)
- sets the memory to a reasonable minimum
- enables the usage of symlinking in shared folders

You may wish to use a static ip rather than dhcp. To enable a static ip for your VM, comment out the line

```
  config.vm.network "private_network", type: "dhcp"
```

and uncomment this line

```
# config.vm.network "private_network", ip: "1.2.3.4"
```

replacing the ip address "1.2.3.4" with one that you have selected from your local host configuration.

#### Virtualbox example

For example, since you are using VirtualBox for virtualization, you can set up VirtualBox to reserve some ip addresses for static ips. This is located under the menu:

Settings > network > vboxnet0 > DHCP Server

The DHCP range should default to 172.28.128.3 - 254. To play well with DHCP with static ips you could change this to 172.28.128.3 - 100, and use 101 through 254 for static. (You may already have DHCP assigned addresses, so using the high part of the range is more pleasant.)

Your configuration line would look like this:

```
  config.vm.network "private_network", ip: "172.28.128.101"
```

> The funny business with NFS is required to allow symbolic linking within the vm using shared folders. The linking is a necessary part of the workflow for kbase-ui plugins, libraries, or other external components.

### Set up the VM

```
vagrant up
```

Vagrant will display a bunch of messages, ending with an error message you may ignore:

```
==> default: nginx: unrecognized service
The SSH command responded with a non-zero exit status. Vagrant
assumes that this means the command failed. The output for this command
should be in the log above. Please read the output to determine what
went wrong.
```

This is displayed because the nginx server is not installed in the vm yet.

> TODO: enmbed the following in a provisioning script...


```
vagrant ssh
sudo su
add-apt-repository ppa:nginx/stable -y
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y
apt-get autoremove -y
apt-get install nginx-extras -y
```

> Note: If you received an NFS error when first starting up VM with "vagrant up", you can ignore the error message for now and proceed with the setup. The step below, "Fix the NFS configuration" will take care of this.

> Note that as you start up the vagrant-managed vm you may be be asked for your password. This is your Mac password, assuming you are an Admin user. This is required for vagrant to update your local Mac nfs configuration.

### Set up a local host mapping

Still within the VM, obtain the IP address assigned via DHCP or simply use the IP address you assigned to Vagrant, and then back on the host add it to the /etc/hosts file.


#### Determine DHCP-assigned IP address (if necessary)

If you set up Vagrant to use DHCP, use the following commands to discover the ip address assigned to the VM:

```
ifconfig | grep "inet addr:"
```

You'll need to locate the IP address used by VirtualBox, which seems to use the 172.28.128 subnet. (You can also find this out directly from the VirtualBox settings.)

```
          inet addr:10.0.2.15  Bcast:10.0.2.255  Mask:255.255.255.0
          inet addr:172.28.128.3  Bcast:172.28.128.255  Mask:255.255.255.0
          inet addr:127.0.0.1  Mask:255.0.0.0
```

#### Add host mapping to /etc/hosts file

Back on the host, edit the /etc/hosts file on your Mac host:

```
exit
sudo vi /etc/hosts
```

add a line somewhere, e.g. at the bottom, like:

```
1.2.3.4 ci.kbase.us
```

Where ```1.2.3.4``` is the ip address you recorded above.

We will be mapping ci.kbase.us into the VM, and inside the VM using an nginx config to map service requests to the real ci.

> Note that when you need to access the "real" ci.kbase.us you will need to disable this line in your /etc/hosts file.

### Fix the NFS configuration

At present, a bug in Vagrant causes it to tend to grab the wrong ip address from inside the VM and insert it into the host nfs exports file, which provides the nfs directory sharing.

If Vagrant does this, the nfs integration will fail, although the VM itself will start and be available via ssh.

To fix this we need to:

1. ensure that the host's /etc/exports file contains the correct ip address
2. if it isn't correct, correct it
3. disable nfs exports file writing

#### 1. Inspect the host's /etc/exports file

When vagrant is configured for nfs file sharing, it will create the mappings between the VM and host system in the host's /etc/exports file.

First open /etc/exports back on your host (mac) system

```
sudo vi /etc/exports
```

You should see an entry for the virtual machine.

Each entry is wrapped in comments provided by Vagrant which contain the vm's id. You can identify your section by the mappings that are shown. You can also identify the section by the vm's id, but that is not covered here [yet].

An example exports entry for Vagrant:

```
# VAGRANT-BEGIN: 501 ac6c700e-5bfa-45b0-adb6-94d9f7a740c7
"/Users/erik/work/kbase/projects/test-docs/dev" 172.28.128.101 -alldirs -mapall=501:20
# VAGRANT-END: 501 ac6c700e-5bfa-45b0-adb6-94d9f7a740c7
```

We are interested in the second value in the export entry, the ip address. If the value is not the same you you noted above, edit the ip address to correct it. If it is the same, simply leave it alone. If there are multiple lines in the section, check and correct each one.

```
sudo vi /etc/exports
```

If you made changes to /etc/exports you will need to restart the nfs service:

```
sudo nfsd restart
```

When you have saved and exited the file, and possibly restarted nfsd, you'll need to adjust the Vagrantfile:

```
vi Vagrantfile
```

Comment out the line ending in ```nfs_export: true```, and uncomment the one ending in ```nfs_export: false```.

Before: 

```
# comment after fixing /etc/exports
config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: true
# uncomment after fixing /etc/exports
# config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: false
```

After: 

```
# comment after fixing /etc/exports
# config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: true
# uncomment after fixing /etc/exports
config.vm.synced_folder ".", "/vagrant", type: "nfs", nfs_udp: false, nfs_version: 3, nfs_export: false
```

Restart vagrant to ensure that it starts error-free:

``` 
vagrant reload 
```

## Set up Nginx 

Back in the VM we'll be setting up nginx.

``` 
vagrant ssh
```

### Install self signed cert

All services are typically operated over https, so we set up even the development environment for https. For local development a self-signed certificate is adequate, even if it does cause the browser to complain.

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

> Note: We'll be going back into superuser mode now

```text
sudo su
vi /etc/nginx/sites-available/default
:1,$d
i
```

copy this 

```text
#
# A minimal proxying configuration for running kbase-ui through a secure proxy
# against ci.
# 
# It is designed to operate inside a VM which naturally routes ci.kbase.us to its
# real location, while the host has ci mapped to the vm via /etc/hosts.
#

# Route insecure requests to secure.
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
    # The cookie path rewriting is just for auth2
    proxy_cookie_path /login /services/auth/login;
    proxy_cookie_path /link /services/auth/link;
    proxy_pass https://ci.kbase.us/services;
    client_max_body_size 300M;
  }

  # Needed for dynamic service calls
  location /dynserv {
    proxy_pass https://ci.kbase.us/dynserv;
  }

  # Needed for running narratives
  location /narrative {
    proxy_pass https://ci.kbase.us/narrative;
    # Uncomment the following lines for a narrative deployed
    # within the proxy's vm.
    #proxy_pass http://localhost:8888/narrative;

    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header Origin http://localhost;
    proxy_set_header Host localhost;
  }

  # Proxy all non-services to the local kbase-ui running in the vm
  location / {
    # next line for node testing server.
    gzip on;
    gzip_types text/css application/json application/javascript;
    
    root /vagrant/kbase-ui/build/build/client;

    # Uncomment to work against the minified dist build.
    # root /vagrant/kbase-ui/build/build/client;

    index index.html;
  }

  # We need to proxy RESKE search, since the dev service is insecure.
  location /services/reske {
	proxy_pass http://dev01.kbase.lbl.gov:29999;

    # Enable for RESKE deployed inside the proxy's vm.
    # proxy_pass http://localhost:5000;
  }
}
```

paste into the terminal running vi, then save and exit.

```text
<esc>
ZZ
```

#### Test it

Then test the ngninx configuration:

```
sudo nginx -t
```

if all goes well restart nginx

```
service nginx restart
```

#### Done with the VM

That should be it with the VM for the general kbase-ui development setup. There is more to do in there for plugin development, co-development with the Narrative, and testing.

### Confirm that it works

Let's confirm that the base build is working by visiting https://ci.kbase.us in your favorite browser. KBase supports all modern desktop browsers, so take your pick.

Your browser will give you a security warning, due to the usage of the self-signed certificate. Each browser is different, but it should provide you with a way to bypass the error or add a security exception.

#### Firefox

- click the "Advanced" button
- click the "Add Exception ..." button
- click the "Confirm Security Exception" button

#### Chrome

- click the "ADVANCED" button
- click the "Proceed to ci.kbase.us (unsafe)" link

#### Safari

- click the "Show Details" button
- click the "visit this website" link
- click the "Visit Website" button
- enter your host password
- click "Update Settings"

## Troubleshooting

### 502 when accessing ci.kbase.us in browser

If you find that you get a 502 from the auth service after initial installation, you may have accidentally created a ci.kbase.us entry in the /etc/hosts file *inside* the VM. This entry should be created on your host machine.

### Vagrant complains when going up (or reload)

If you see this message:

```
==> default: start: Job is already running: nginx
The SSH command responded with a non-zero exit status. Vagrant
assumes that this means the command failed. The output for this command
should be in the log above. Please read the output to determine what
went wrong.
```

Then chances are that the nginx provisioning line in the Vagrantfile is not required. You may comment out this line

```
  config.vm.provision :shell, :inline => "sudo service nginx start", run: "always"
```

### GuestAdditions warnings during vagrant up

Don't worry if you see messages like this:

```
Got different reports about installed GuestAdditions version:
Virtualbox on your host claims:   4.3.36
VBoxService inside the vm claims: 5.1.24
Going on, assuming VBoxService is correct...
Got different reports about installed GuestAdditions version:
Virtualbox on your host claims:   4.3.36
VBoxService inside the vm claims: 5.1.24
Going on, assuming VBoxService is correct...
```

It takes one or more times starting Vagrant when using the GuestAdditions plugin mentioned at the very top of this document to get GuestAdditions updated in the VM and for Vagrant to stop complaining.


## Fin

Now you should be ready to hack on kbase-ui, or move onto other workflows such as plugin or narrative development.

---

[Index](index.md) - [README](../README.md) - [KBase](http://kbase.us)

---