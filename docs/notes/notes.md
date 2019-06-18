---
title: KBase UI
nav_order: 3
---

### An aside: How plugins are built into kbase-ui

In the kbase-ui build configuration, there exists a configuration file listing all of the plugins to be built into the kbase-ui web app. This configuration file specifies the plugin name, the location and the version.

The entry will look like this:

```
    -
        name: PLUGINNAME
        globalName: kbase-ui-plugin-PLUGINNAME
        version: 1.2.3
        cwd: src/plugin
        source:
            bower: {}
```

During the kbase-ui build process, the build tool uses the _bower_ package manager to locate and download the correct version of the plugin source from github and install it locally. The build tool then copies the plugin's _src/plugin_ directory into kbase-ui's _build/build/client/modules/plugins_ directory, and uses the plugin's _src/plugin/config.yml_ file to integrate plugin components into the ui.

Now, you may be able to see that one way to develop plugins is to simply update the plugin source, push it up into the repo, update the repo version, and rebuild kbase-ui. That is the short version of the steps necessary to integrate a plugin change! Although these steps are necessary for a well-managed system, it would be a slow way to incrementally develop a plugin (although you can imagine a set of tools to automate it.)

So, at develop-time, an alternative method is used. Since during the kbase-ui build process the plugin _src/plugin_ directory is simply copied, whole-cloth, into the kbase-ui build source tree, we can simply alter the kbase-ui build to point to the plugin's local _src/plugin/module_ rather than the installed one.

In old development workflows, the installed plugin would be removed and the local development directory linked into the build. In the current docker-based workflow, we use the docker run mount options to perform a similar function. Fortunately this is wrapped within the 'run-image.sh' tool.
