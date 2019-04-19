# Local KBase Server Certs

## Background

When developing kbase-ui, the recommended workflow requires that the developer operate the kbase-ui web app at a normal kbase host. The workflow supported over the last year or so involves the usage of a self-signed certificate inside the development proxy.

This works for the development process, but introduces a few issues:

1. Browsers require extra steps in order to operate against servers with self signed certificates.

2. All browsers work best in private or incognito mode with self signed certificates

3. Some browser plugins, including some development tools like google tag assistant, do not work in private or incognito mode.

## Solution

There is a solution to this issue, which allows the use of locally generated certificates, granted against the appropriate hosts, which do not generate browser errors - they are recognized as valid certificates.

This allows using a browser in its normal mode, with full plugin support.

## Instructions

The solution hinges on a single utility named `mkcert`: https://github.com/FiloSottile/mkcert

`mkcert` works by installing its own root certificate into the local system and browsers and generating a certificate and key which chain to this root certificate.

While the prospect of installing a "fake" trusted certificate on your local machine may seem scary, the tool is widely used and complete reversible:

Instructions for installing it can be found at the repo cited above. For example, if you are a macOS user utilized macports:

```
sudo port selfupdate
sudo port install mkcert
sudo port install nss
```

After installing mkcert, the kbase-ui Makefile provides support

### set up mkcert

Before using the mkcert-generated certs, you need to install the host-wide root cert:

```
mkcert -install
```

### generate cert files

By hand

```
mkcert -cert-file test.crt --key-file test.key kbase.us "*.kbase.us"

```

After this the certs will be in the proper location for the local proxy, and it can be run as normal.

### remove mkcert

```
mkcert -uninstall
rm tools/proxy/contents/ssl/*
```

## Enabling self signed certs

You'll need to edit `tools/proxy/Docker`.
