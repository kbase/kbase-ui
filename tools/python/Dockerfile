FROM python:3.12.2-slim-bookworm

MAINTAINER KBase Developer

# -----------------------------------------
# In this section, you can install any system dependencies required
# to run your App.  For instance, you could place an apt-get update or
# install line here, a git checkout to download code, or run any other
# installation scripts.
# -----------------------------------------

# We need git for the git-info tool.
RUN apt-get update && apt-get install -y git openssh-client

SHELL ["/bin/bash", "-c"]

ENV PYTHONPATH="/app/tools/python"

RUN mkdir -p /app && chmod -R a+rw /app

WORKDIR /app

COPY requirements.txt /app
RUN pip install -r requirements.txt

ENTRYPOINT [ "tools/python/entrypoint.sh" ]

CMD [ "bash" ]
