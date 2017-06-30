
# Installing auth2 on Ubuntu 14.04 via Vagrant

Installation recipe for installing:
- auth2
- kbase-ui
- kbase-ui plugins and libraries

Locally, editing locally (mac)
Running the auth2 service and nginx in a vm.

## Prerequisites
- VirtualBox
- Vagrant
- git
- for Mac oriented mongo work MongoHub

## Create and set up an VM for Ubuntu 14.04 via Vagrant

- Initialize Vagrant:

```
vagrant init ubuntu/trusty64
```

- Set it up

edit Vagrantfile to set up local ip

```text
config.vm.network "private_network", type: "dhcp"
config.vm.synced_folder ".", "/vagrant", type: "nfs"
config.vm.provider "virtualbox" do |vb|
  vb.memory = "1024"
  vb.customize ["setextradata", :id, "VBoxInternal2/SharedFoldersEnableSymlinksCreate/vagrant", "1"]
end
```

The funny business with NFS is required to allow symbolic linking within the vm using shared folders!

- Set up the VM

```text
vagrant up
vagrant ssh
sudo su
add-apt-repository ppa:webupd8team/java
add-apt-repository ppa:nginx/stable
apt-get update
apt-get upgrade -y
apt-get dist-upgrade -y
apt-get autoremove -y
apt-get install oracle-java8-installer ant git nginx nginx-extras -y
cd /vagrant
#mkdir auth2
#cd auth2
#git clone https://github.com/kbase/auth2
#git clone https://github.com/kbase/jars
```

don't install the ubuntu (or ppa) jetty - i could not find an up to date one.
go to jetty, find the url, and download it directly.
e.g.

```
wget http://central.maven.org/maven2/org/eclipse/jetty/jetty-distribution/9.4.1.v20170120/jetty-distribution-9.4.1.v20170120.tar.gz
```

then it is easier just to stick that in /usr/local/share/jetty to parallel the official distro

```
tar zxvf jetty-distribution-9.4.1.v20170120.tar.gz
mv jetty-distribution-9.4.1.v20170120 /usr/local/share/jetty
```

- Determine the IP of the VM and set up a local host mapping

```
ifconfig
exit
sudo vi /etc/hosts
```

add a line like:

```
1.2.3.4 authdev.kbase.us
1.2.3.4 dev.kbase.us
```

use the authdev host for the redirect urls when getting oauth2 client id and secret, the dev host for the ui.

### Install Mongo

The ubuntu default mongo package is far out of date, so use the official instructions to install the official package:

https://docs.mongodb.com/manual/tutorial/install-mongodb-on-ubuntu/

## Build auth2

Back in the vm at the auth2 repo build it

```
vagrant ssh
cd /vagrant/auth2/auth2
ant build
```


## Test it

### Set up test config

edit /vagrant/auth2/auth2/test.cfg, make it look somethingn like this:

```
## To run tests, copy this file to test.cfg and set the values below appropriately.

[auth2test]

# path to the mongodb executable to use for the tests.
test.mongo.exe=/usr/bin/mongod

# true to use wired tiger, anything else for false.
test.mongo.wired_tiger=false

# path to a temporary directory to use for tests.
test.temp.dir=/home/vagrant/temptestdir

# true to keep the temporary directory contents after running tests.
test.temp.dir.keep=true
```

> Note that the ```test.temp.dir``` must not be in a shared directory (e.g. not in ```/vagrant```)

### run tests

```
ant test
```



## Local Deploy

### Create Mongo DB

```
mongo
use auth2
```

### Determine Hostname

The auth2 service will need to run at a host name which you configure both in your development host, the auth2 configuration, and in each identity provider api key (Google, Globus).

This hostname was set in the /etc/hosts configuration above. If you want something different, go back and change that.

### set up deploy.cfg

Here is mine, with keys taken out:

```
# Example deployment configuration file for the KBase authentication server
# MKII.
# Make a copy, fill in as required, and set KB_DEPLOYMENT_CFG to point to the
# new file before starting the server.

[authserv2]

# The host name (and port if required) of the mongo server to be used as auth storage.
mongo-host=127.0.0.1:27017
# The name of the mongo database to be used as auth storage.
mongo-db=auth2
# If the mongo database is authenticated, the user name of a read/write account.
mongo-user=
# If the mongo data base is authenticated, the password for the given username.
mongo-pwd=

# The name of the cookie in which tokens should be stored in the browser.
token-cookie-name = kbase_session

# the name of the service to report when logging to syslog.
log-name=KBaseAuthServ2

identity-providers=Globus, Google

identity-provider-Globus-factory = us.kbase.auth2.kbase.GlobusIdentityProviderFactory
identity-provider-Globus-login-url=https://auth.globus.org
identity-provider-Globus-api-url=https://auth.globus.org
identity-provider-Globus-client-id=xxx
identity-provider-Globus-client-secret=xxx
identity-provider-Globus-login-redirect-url=https://authdev.kbase.us/auth2services/auth/login/complete/globus
identity-provider-Globus-link-redirect-url=https://authdev.kbase.us/auth2services/auth/link/complete/globus

identity-provider-Google-factory = us.kbase.auth2.kbase.GoogleIdentityProviderFactory
identity-provider-Google-login-url=https://accounts.google.com/
identity-provider-Google-api-url=https://www.googleapis.com/
identity-provider-Google-client-id=xxx
identity-provider-Google-client-secret=xxx
identity-provider-Google-login-redirect-url=https://authdev.kbase.us/auth2services/auth/login/complete/google
identity-provider-Google-link-redirect-url=https://authdev.kbase.us/auth2services/auth/link/complete/google
```

#### Notes

- mongo-host can be localhost, 127.0.0.1, or include the port (27017 by default)
- don't know if you need to create the mongodb database first, but I did (auth2) and then set that in the config.
- for globus be sure to use the shorter "client id" and not the longer client identity username
- for google be sure to enable the Google+ api. The ui for that is at the top of the Google APIs cited in the auth2 documentation
- the xxx placeholders will be provided below.
- the *redirect-url* settings use the hostname that you've set in /etc/hosts; note that we've also stripped of the first two path components since they are not needed
- note that the redirect urls **must be https** because of Globus' requirements

## Get API Keys

The Globus and Google integrations require oauth2 api keys:

### Globus

- Go to https://developers.globus.org/
- Login
- Click "Register your app with Globus"
- Click "Add another project"
- Give it a name and create it
- Manage Project > Add New App
- Give it a name (arbitrary, e.g. auth2 local test)
- Give it scopes by selecting from the dropdown list
  -  urn:globus:auth:scope:auth.globus.org:view_identities
  -  email
-  Copy and paste the redirect urls from deploy.cfg (just for Globus)
-  Create App
-  Generate New Client Secret
-  copy the Client ID to the deploy.cfg identity-provider-Globus-client-id
-  copy the Client Secret to the deploy.cfg identity-provider-Globus-client-secret

### Google 

- Go to https://console.developers.google.com/apis
- Log in 
- Select Dashboard
- In the API section select Google+ API
- Enable it with the big button at the top
- Select Credentials
- Create credentials > OAuth client ID
- Web application
- Name: give an arbitrary name
- Authorized redirect URIs: copy and paste in the URIs from deploy.cfg
- Create
- In the OAuth client copy the client ID and secret to the respect slots in the deploy.cfg

## Start auth2

You should be ready to start it.

```
export KB_DEPLOYMENT_CONFIG=`pwd`/deploy.cfg
cd jettybase
java -jar -Djetty.port=9090 /usr/local/share/jetty/start.jar
```

You may want to can that up into a file like start.sh so that forever after you can just do

```
sh start.sh
```

If all goes well, you'll see log lines and the server is happy.

## Add ssl certs

```
cd /vagrant/auth2
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout test.key -out test.crt
```

## Set up nginx

In ```/etc/nginx/sites-available/default``` add the following stanzas:

### for mongodb hello world, add reverse proxy:

```
server {
        listen 8090;
        location / {
                proxy_pass http://127.0.0.1:28017;
        }
}
```

- add ssl proxy to the auth server

```
server {
	listen 80 default_server;
	listen [::]:80 default_server;
        server_name dev.kbase.us;
	return 301 https://dev.kbase.us$request_uri;
}

# Proxy for mongodb to aid in mongo-munging
server {
	listen 8090;
 	location / {
		proxy_pass http://127.0.0.1:28017;
	}
}

# Proxy for kbase-ui
server {
  listen 443 ssl;
  server_name dev.kbase.us;
  ssl_certificate /vagrant/auth2/test.crt;
  ssl_certificate_key /vagrant/auth2/test.key;
  location / {
      proxy_pass http://127.0.0.1:8080;
  }
}

# Proxy for auth2 server
server {
  listen 443 ssl;
  server_name authdev.kbase.us;
  ssl_certificate /vagrant/auth2/test.crt;
  ssl_certificate_key /vagrant/auth2/test.key;

  location /auth2services/auth/ {
      proxy_pass http://127.0.0.1:9090/;
      # the auth2 service sets the cookie path to absolute /login and /link,
      # but of course the browser will see some other path prefixed with the
      # location (same as in this location section) the service is installed
      # at.
      proxy_cookie_path /login /auth2services/auth/login;
      proxy_cookie_path /link /auth2services/auth/link;

              if ($request_method = 'OPTIONS') {
                       add_header 'Access-Control-Max-Age' 1728000;
                       add_header 'Content-Type' 'text/plain charset=UTF-8';
                       add_header 'Content-Length' 0;
                       return 204;
               }
               # NB need to use Headers More module here. Need nginx-extras for this.
               # it sets headers for all response codes.
               more_set_headers 'Access-Control-Allow-Origin: https://dev.kbase.us';
               more_set_headers 'Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS';
	       more_set_headers 'Access-Control-Allow-Credentials: true';
               more_set_headers 'Access-Control-Allow-Headers: DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,Cookie';
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
  }
  location /auth2services/ {
	proxy_pass https://ci.kbase.us/auth2services/;

              if ($request_method = 'OPTIONS') {
                       add_header 'Access-Control-Max-Age' 1728000;
                       add_header 'Content-Type' 'text/plain charset=UTF-8';
                       add_header 'Content-Length' 0;
                       return 204;
               }
               # NB need to use Headers More module here. Need nginx-extras for this.
               # it sets headers for all response codes.
               more_set_headers 'Access-Control-Allow-Origin: https://dev.kbase.us';
               more_set_headers 'Access-Control-Allow-Methods: GET, POST, OPTIONS';
		more_set_headers 'Access-Control-Allow-Credentials: true';
               more_set_headers 'Access-Control-Allow-Headers: DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization,Cookie';
               proxy_set_header Host $host;
               proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## Set up admin users and configure

Out of the box auth2 has a single root user ***ROOT***. You must run a command line tool to assign a password.

```
cd /vagrant/auth2/auth2
./manage_auth -d ./deploy.cfg -r
```

When prompted enter a passsword for the ***ROOT*** user. 

Now you can start the auth2 server again. 

Take your browser to https://authdev.kbase.us/services/auth/localaccount/login ... you should see a login page!

Log in as the ***ROOT*** user.

Add an admin user.

I created my admin user with the username "admin"

https://authdev.kbase.us/services/auth/localaccount/login

Copy the temp password.

In a separate window (or browser) login as this user

Create a new password

Log in again

At this point, on the /me page, you will not be able to do much.

Back in in the ***ROOT*** user window, navigate the browser to

https://authdev.kbase.us/admin/user/admin

where the last admin is the admin user name

Now give the admin user the Create admin role:

click on Create admin

click on Update

Now back at the admin user window refresh the /me page. You should now see the "Create administrator" role appear.

All the create admin role does is allow that user to create more admins.

Now this admin user can given themself the Admin role. This is required in order to configure the service.

https://authdev.kbase.us/admin/user/admin

Check the Admin role
Click Update

Now admin ... is an admin!


### Configure auth2

Now the admin user can configure the auth2 service. 

https://authdev.kbase.us/admin/config

Here is what to change

- Allow non-admin login: checked

If you are doing ui dev, you will point the following to the local dev instance you have stood up. If not, then just leave it and use the built-in pages.

- Allow post-login redirect url prefix: http://localhost:8080
  
- Redirect URL ... choice of accounts ...: https://authdev.kbase.us/admin/config

- Redirect URL after an account link...: http://localhost:8080/#auth2/link/success

- Redirect URL when a ...choice of accounts is required: http://localhost:8080/#auth2/link/choice


- Identity providers: Google: Enabled: check

- Identity providers: Globus: Enabled: check


Don't forget to click the Update button for each section.


## Fin

That should be it. You should be able to either use the auth2 service directly, or start hacking against it in the ui


