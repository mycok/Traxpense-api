FROM node:12-alpine AS dev
ARG PORT
ARG MONGODB_URI
ARG PRIVATE_KEY
WORKDIR /usr/
COPY package.json /usr/
COPY yarn.lock /usr/
COPY tsconfig.json /usr/
RUN yarn install
COPY . /usr/
RUN yarn build

FROM node:12-alpine
WORKDIR /usr/
COPY package.json /usr/
RUN yarn install --production --ignore-engines
COPY --from=dev /usr/dist/ /usr/dist/
CMD ["yarn", "start"]
