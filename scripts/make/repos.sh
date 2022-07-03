#!/usr/bin/env bash

gh api -X GET /search/repositories -f q="license:mit sort:stars" | jq --sort-keys > ./seeds/repos.json
