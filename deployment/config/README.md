# Docker Run Configuration files

This directory contains example configuration files for each environment, in docker "env" format. These files are used by the "run-image-dev.sh" script tool to populate the environment with "docker run".

In KBase deployments, similar files are supplied directly to dockerize via the kbase-specific "-env" option which supports http/https download of the env files.

> Note: The kbase dockerize extension, at present, uses an INI library to parse the env file content. This has unfortunate side effects, since the INI format and the library specifically have parsing rules beyond those supported by the very simple docker env file format. 

## File format caveats

The format of the file should follow the docker env file format. This allows the same env file to be used for local development and testing (via docker run, docker compose, etc.), and for deployment (via dockerize -env).

The reason for this is that the INI parser used by the kbase "-env" dockerize performs transformations beyond what docker env does.

The general rule is that the file must follow the docker run env_file rules, environment variable naming rules, and template variable naming rules.

Below are some rules that I've found avoid inconsistencies between the two usages of the env file.

#### don't put spaces around key value pairs

The ENV file preserves all characters from the key and value; spaces are preserved.

So

```
 key = value 
```

provides the key ```<space>key<space>``` and the value ```<space>value<space>```.

The INI parser trims whitespace from the beginning and end of the value, so the above would produce ```key``` and ```value```.

#### don't use spaces in variable names

docker run will fail if a variable has one or more spaces before a variable name and the beginning of the line, after the variable name and the ```=``` sign, or within the variable name.

E.g. using

```
key2 =hello
```

results in the docker error:

```
docker: poorly formatted environment: variable 'key2 ' has white spaces.
```

The INI parser accepts spaces in these positions, and will trim whitespae from the beginning and ending of the variable name.

Always format variables like:

```
variable=value
```

#### Variable names must be valid environment variables

docker run will silently ignore ENV file variables which violate naming rules for environment variables; the INI parser will not.

In addition, at least some of the rules for ENV variable names apply to template variable names. So, for example the variable ```myvar*``` will be rejected by docker run, accepted by dockerize -env (INI parser), and rejected by the dockerize (go) template parser.

To be safe, use only alphanumeric characters and the underscore

#### don't use quoted strings (or quotes at all)

Given that docker ENV files preserve all characters for the key and value, embedded quotes are literally preserved. A quoted string like ```"my string"``` is literally preserved as that text, without removing the quotes.

The INI parser, hover, does remove the quotes from quoted strings. It does not always unquote strings, but I don't know all the parsing rules; it certainly does unquote quoted strings, though.

So, it is best to avoid quotes altogether.

#### don't use ini sections

The INI format supports the usage of "sections". A section is a line of the format:

```
[section]
```

where ```section``` is a section name, and variables following it are considered to be in that "section".

The docker ENV format does not support sections. Docker run will interpret a section provided in an ENV file as a variable name, but will ignore it because it violates the environment variable naming rules.

So in theory, a section will simply be ignored and may be used. 

However, I'm not confident that the "ignore" behavior of env files is a permanent condition. docker run does error out with spaces in variable names, and I would expect that other unacceptable variable names should behave the same.

Probably harmless, but best not to tempt fate.

## Value Format

A env variable's value includes all text, including spaces, following the ```=``` sign after the variable name, up to the end of the line.

Since env variable values are literal strings, and must be utilized as values in dockerize templates, there are some simple rules for representing data:


### JSON template target

1. strings: the template will surround the value call with double quotes - the string should contain no quotes
2. numbers: the env value must be in the form of an integer or floating point as recognized by JSON.
3. arrays: arrays of strings or numbers may be represented, but not mixed types; use a space to separate elements. In the template a somewhat tricky expression will split the string and arrange it into a list of either strings or numbers, with commas separating elements and square brackets surrounding it all.
4. map: not supported


## Testing

The env files within the repo should be tested against each environment locally, using ```scripts/run-image-dev.sh```. The ```kbase-web-assets``` repo may be used to test these same files provide by ```dockerize -env```. [to be documented]