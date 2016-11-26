FROM node:6.9.1
MAINTAINER Nicolas Lefebvre

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

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

CMD ["npm", "start"]
