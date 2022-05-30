# kbase-ui deploy configuration template

## Environment Variables

Environemt variables are used for substitution into `deployment/config.json.tmpl`, the kbase-ui deployment configuration template, and `deployment/nginx.conf.tmpl`, the nginx configuration template.

Some are required, but most have a sensible default, as documented below.

The naming convension is to use underscores as a substitution for periods "." which would be used to construct a path into the config object in which they are used.




<table>
    <thead>
        <tr>
            <th>Name</th>
            <th colspan="2">Deploy Config</th>
            <th colspan="2">nginx Config</th>
            <th>Comments</th>
        </tr>
        <tr>
            <th></th>
            <th>required</th>
            <th>optional/default</th>
            <th>required</th>
            <th>optional/default</th>
            <th></th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>deploy_environment</td>
            <td>true</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>deploy_icon</td>
            <td>true</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>deploy_name</td>
            <td>true</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>deploy_hostname</td>
            <td>true</td>
            <td></td>
            <td>true</td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>deploy_ui_hostname</td>
            <td></td>
            <td>deploy_hostname</td>
            <td></td>
            <td>deploy_hostname</td>
            <td>only set in prod, since it is dual-hosted</td>
        </tr>
        <tr>
            <td>ui_featureSwitches_enabled</td>
            <td></td>
            <td>empty string ""</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>ui_featureSwitches_disabled</td>
            <td></td>
            <td>empty string ""</td>
            <td></td>
            <td></td>
            <td></td>
        </tr>
        <tr>
            <td>nginx_listen</td>
            <td></td>
            <td></td>
            <td></td>
            <td>80</td>
            <td></td>
        </tr>
        <tr>
            <td>nginx_server_name</td>
            <td></td>
            <td></td>
            <td></td>
            <td>localhost</td>
            <td></td>
        </tr>
        <tr>
            <td>nginx_log_syslog</td>
            <td></td>
            <td></td>
            <td></td>
            <td>implicitly empty string ""</td>
            <td>Only used in a conditional, which tests for its existence; an empty or non-existent environment variable is considered "false", so this implicitly defaults to false.</td>
        </tr>
        <tr>
            <td>nginx_log_stdout</td>
            <td></td>
            <td></td>
            <td></td>
            <td>true</td>
            <td></td>
        </tr>
        <tr>
            <td>nginx_log_stderr</td>
            <td></td>
            <td></td>
            <td></td>
            <td>true</td>
            <td></td>
        </tr>
        <tr>
            <td>nginx_loglevel</td>
            <td></td>
            <td></td>
            <td></td>
            <td>error</td>
            <td></td>
        </tr>
    </tbody>
</table>




### Required

- deploy_environment
- deploy_icon
- deploy_name
- deploy_hostname
- deploy_ui_hostname
- ui_featureSwitches_enabled
- ui_featureSwitches_disabled

#### `deploy_environment`

Config path: `deploy.environment`

Used in the header to identify environments other than prod. The only dependency on the actual value in the codebase is `"prod"`. The config template will set `deploy.displayEnvironment` to `false` if the value of this is `"prod"`, otherwise it is set to `true`.

When enabled, this value is simply displayed in the header, after conversion to upper case.

> To fully decouple the codebase from the environment, `deploy.displayEnvironment` should be controlled by an environment variable.

#### `deploy_icon`

Config path: `deploy.icon`

A string value, indicating the suffix to a [FontAwesome 5.0](https://fontawesome.com/v5/search) font. 


If `deploy.displayEnvironment` is true, this value is used to set the icon for the environment in the header.

#### `deploy_name`

Config path: `deploy.name`

Supplies the display name for the deployment environment. Used in the interface header for non-prod environments.

#### `deploy_hostname

Config path `deploy.hostname`




### Optional

- ui_backupCookie_domain
- ui_backupCookie_enabled
- ui_coreServices_disabled
- deploy_services_auth2_path


