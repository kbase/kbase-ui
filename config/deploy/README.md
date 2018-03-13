# Configuration files

This directory contains example configuration files for each environment, in "ini" format. The actual configurations are stored
in different source control repositories appropriate for actual deployed services. Note that files in this directory
are not actually used, so changes to these files will have no effect on ci, appdev, next or prod.

The files in this directory can be fed to the "env_file" directive in docker and docker-compose, as well as consumed by
apps such as dockerize that can parse name=value syntax (many YAML parsers such as the common Golang yaml parser as well
as some Python yaml parsers happily consume this as well)