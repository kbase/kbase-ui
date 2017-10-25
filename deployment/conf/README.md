# Configuration files

This directory contains one configuration file per kbase deployment environment, in "ini" format, as can be consumed by Python's ConfigParser class. In actual implementation the config file is consumed by a utility app "jinja2" (or similar), which may consume INI, YAML, JSON, and TOML formats. However, KBase as of this time just supports INI.

TODO: kbase modules have a convention in which the config files are created with a section named after the module, and the entrypoint script provides just the part of the configuration inside that section ... that is it removes the module name qualifier. Thus references inside templates are not like "module.prop" but just "prop".

This makes it error-prone to merge configs from outside the service, so I don't know how that is handled.

I assume we should do that here, but it isn't done at the moment because I want to confirm this behavior first.

The one caveat for this is that, since these files are also consumed by Java, and in java I believe they are treated as properties files, which don't have sections, java will not see the sections anyway.
