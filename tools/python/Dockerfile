FROM python:3.12.2-slim-bookworm
# Note that the python version needs to match that used to create
# poetry.lock.

MAINTAINER KBase Developer
LABEL org.opencontainers.image.source = "https://github.com/kbase/kbase-service-orcidlink"
LABEL org.opencontainers.image.description="A KBase core service to provide for linking a KBase account to an ORCID account, and associated services"
LABEL org.opencontainers.image.licenses=MIT

# -----------------------------------------
# In this section, you can install any system dependencies required
# to run your App.  For instance, you could place an apt-get update or
# install line here, a git checkout to download code, or run any other
# installation scripts.
# -----------------------------------------

# We need curl to install poetry; git for the git-info tool.
RUN apt-get update && apt-get install -y curl git openssh-client

SHELL ["/bin/bash", "-c"]

# Install poetry
# RUN curl -sSL https://install.python-poetry.org | python3 - --version 1.8.2

# Temporary fix for broken Python venv.
# setuptools is not used by poetry (see the install command below), but it is present
# anyway in poetry's venv (which is separate from that for the service). However, a bug
# in Python 3.11.1 (and perhaps others, I just confirmed with this version) installs the
# wrong version of setup tools -- it installs 65.5.0 from 3.11, which has a CVE issued
# against it. Just upgrading to the latest version, to avoid having to fix this when poetry's
# venv has a more recent version than 65.5.1 (which fixes the CVE). When the upstream issue is fixed,
# this line can be removed.
# RUN cd /root/.local/share/pypoetry && source venv/bin/activate

# Don't need curl any more.
#RUN apt-get purge -y curl && apt-get autoremove -y

# Annoyingly it puts it here.
# ENV PATH="/root/.local/bin:$PATH"
ENV PYTHONPATH="/app/tools/python"

RUN mkdir -p /app && chmod -R a+rw /app

# Copying only files needed for service runtime.
# Other usages of this image, e.g. testing, mount the project root at /kb/module
# and have access to everything.
# COPY ./pyproject.toml /app
# COPY ./poetry.lock /app
# COPY ../tools /app/tools

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

# RUN poetry config virtualenvs.create false && poetry install

ENTRYPOINT [ "tools/python/entrypoint.sh" ]

CMD [ "bash" ]
