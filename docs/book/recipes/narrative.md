# Super Quick Start for Narrative

## [1] make project directory anywhere

```
mkdir -p ~/work/project
cd ~/work/project
```

## [2] Clone repos:

```
git clone -b docker-multi-stage https://github.com/kbase/kbase-ui
git clone https://github.com/eapearson/kbase-ui-proxier
git clone -b develop https://github.com/kbase/narrative
```

## [3] Build and run kbase-ui:

```
cd kbase-ui
make docker-image build=dev
make run-docker-image env=dev
```

> Note: keep the docker container running in this window; each app will get it's own window.

## [4] Build and run narrative:

open a new terminal tab or window (recent versions of Terminal or iTerm should open new windows within the same directory)

```
cd ../narrative
```

ok, a quick fix to the Dockerfile.

in ./Dockerfile, replace this line

```
RUN npm install && bower install --allow-root --config.interactive=false
```

with this

```
RUN npm install && ./node_modules/.bin/bower install --allow-root --config.interactive=false
```

(this causes the correct version of bower to be used, from the package.json file)

then run:

```
make dev_image
```

Now edit the container run script, scripts/local-dev-run.sh

remove the line :

```
    --mount type=bind,src=${root}/${ext_components_dir},dst=${container_root}/${ext_components_dir} \
```

(this removes the mapping of external components into the container -- the external components local directory does not exist yet if you haven't built the narrative locally, and the docker build would fail)


run the script

```
env=ci bash scripts/local-dev-run.sh
```

> Note: Both of the manual patches above are fixed in PR https://github.com/kbase/narrative/pull/1345

## [5] Build and run the proxier

open a new terminal tab or window

```
cd ../kbase-ui-proxier
make docker-image
local_narrative=true make run-docker-image env=dev
```

## [6] Local proxy

Edit your local /etc/hosts file to point ci to the running kbase-ui-proxier.

```
vi /etc/hosts
```

insert this line at the end if not already there.

```
127.0.0.1	ci.kbase.us
```

I find it handy to have this in my /etc/hosts and uncomment as needed:

```
127.0.0.1	ci.kbase.us
#127.0.0.1	appdev.kbase.us
#127.0.0.1	next.kbase.us
#127.0.0.1	kbase.us narrative.kbase.us
```

## [8] Run with it

You should now be able to pull up kbase-ui on `https://ci.kbase.us` and navigate to the Narrative.


