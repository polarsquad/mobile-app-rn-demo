# Background worker

This service reads an RSS feed from medium.com and writes the items to Redis using the blogs data structure.

## Get started

```sh
# For local development
yarn run dev
```

## Environment configuration

The service relies on some configuration parameters being set from the outside. For local development, these can be configured using a file called `.env` in the service root (this directory). By design, this file is not included in the version control so you'll have to create it yourself.

A template containing the required variables exists in this repository, so you can use it as a starting point. Some values need to be manually added/maintained, look in the usual places to find them, or ask your teammates.

```sh
cp env-template .env
```
