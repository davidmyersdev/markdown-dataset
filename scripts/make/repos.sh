#!/usr/bin/env bash

gh api -X GET /search/repositories -f q="license:mit sort:stars" -f per_page="100" -f page="1"  | jq --sort-keys > ./seeds/repos.json
