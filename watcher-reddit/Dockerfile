FROM node:6.9.1
MAINTAINER Nicolas Lefebvre

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

ARG appDir=/usr/src/watcher-reddit

# create app dir
RUN mkdir -p $appDir

# install common code and its dependencies
COPY ./common $appDir/../common
WORKDIR $appDir/../common
RUN npm install 

# install Node deps
COPY ./watcher-reddit/package.json $appDir
WORKDIR $appDir
RUN npm install

# install app
COPY ./watcher-reddit $appDir

CMD ["node", "watcher.js"]
