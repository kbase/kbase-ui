
# Installing and Using Narrative with in a kbase-ui development vm

## Prerequisites

standard kbase-ui development vm with nginx proxying.

## Installation

we need to build the narrative inside the proxy, since it needs to run there too...

### install nodejs

from: https://nodesource.com/blog/installing-node-js-tutorial-ubuntu/

```bash
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### nodejs dependencies

install global npm packages:

```bash
npm install -g grunt-cli bower
```

### Set up python

```bash
sudo add-apt-repository ppa:jonathonf/python-2.7
sudo apt-get update
sudo apt-get install python-dev libzmq-dev python-numpy python-scipy -y
virtualenv venvs/v
source venvs/b/bin/activate
 pip install -r src/requirements.txt
 ```

 ### Slip in ipywidgets

 The install_narrative.sh script will otherwise install the current master, which is incompatible with ipython 4.x which we use.

 ```bash
 pip install ipywidgets==5.0.0
 ```

### Build it

```bash
./scripts/install_narrathve.sh
```

### Update nginx config

There shold be a pair of proxy_pass lines in the  commented-out line in /narrative location stanza in the nginx config file ```/etc/nginx/sites-available/default```.

```conf
    proxy_pass https://ci.kbase.us/narrative;
    # Uncomment the following lines for a narrative deployed
    # within the proxy's vm.
    #proxy_pass http://localhost:8888/narrative;
```

Then restart nginx

```bash
sudo service nginx restart
```

### Run the local standalong narrative

```bash
kbase-narrative --no-browser
```


## Troubleshooting
