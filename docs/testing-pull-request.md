# Testing Pull Requests

How to test a pull request locally.

## Prerequisites

An environment capable of buildng and deploying kbase-ui. See the prerequisites and quick-deploy docs.


## Remove the old testing repo if present

```
rm -rf kbase-ui
```


## Install the UI

Clone kbase-ui. Note that we do not checkout the develop branch.

```
git clone https://github.com/kbase/kbase-ui
```

Then fetch and checkout the PR. 

```
cd kbase-ui
git fetch origin pull/<pr#>/head:prtest
git checkout prtest
```

- where ```<pr#>``` is the pull request number and
- ```prtest``` is some local branch name you make for the testing session. 


Zap the bower cache (maybe put this in the build for testing?)

```
rm -rf ~/.cache/bower
```

Build it

```
make init
make build config=ci
sudo ./deploy.sh
```

## Or just test from your repo!

If the repo and branch you are about to PR from is up to date with upstream, you can also just test from there.

