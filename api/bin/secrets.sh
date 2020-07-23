#!/bin/sh
./node_modules/.bin/serverless $1 --stage local --password $2
./node_modules/.bin/serverless $1 --stage test --password $2
./node_modules/.bin/serverless $1 --stage production --password $2