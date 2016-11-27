FROM node:6.9.1
MAINTAINER Nicolas Lefebvre

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

# install cron
RUN apt-get update && apt-get install -y --no-install-recommends \
    cron \
    dos2unix \
 && rm -rf /var/lib/apt/lists/*

# put the crontab in a temp location; the start script will put it where it belong, after prepending the env vars
COPY ./watcher-reddit/crontab /tmp/crontab
RUN chmod 0644 /tmp/crontab

ARG appDir=/usr/src/notifier

# create app dir
RUN mkdir -p $appDir

# install common code and its dependencies
COPY ./common $appDir/../common
WORKDIR $appDir/../common
RUN npm install 

# install Node deps
COPY ./notifier/package.json $appDir
WORKDIR $appDir
RUN npm install

# install app
COPY ./notifier $appDir

# make start script executable
RUN dos2unix start.sh
RUN chmod +x start.sh

RUN touch /var/log/cron.log

CMD ./start.sh
