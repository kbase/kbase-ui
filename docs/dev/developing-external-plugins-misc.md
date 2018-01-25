#### Set up kbase-ui to use a local plugin directory 

Configure the build to use the local plugin for the build

```
cd kbase-ui
vi config/ui/ci/build.yml
```

in the section for the plugin change the source:

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            bower: {}
```

to this

```
    -
        name: dataview
        globalName: kbase-ui-plugin-dataview
        version: 3.1.6
        cwd: src/plugin
        source:
            directory: {}
```

> Note: be sure to preserve spaces and not use tabs; otherwise you will get a yaml error during the build

Build kbase-ui

```
make init
make build config=ci
```

---

[Index](index.md) - [README](../README.md) - [Release Notes](../release-notes/index.md) - [KBase](http://kbase.us)

---