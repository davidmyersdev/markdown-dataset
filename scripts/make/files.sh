#!/usr/bin/env bash

store_readme() {
  full_name=${1:-$(cat)}
  IFS='/' read -r user repo <<< $(echo ${full_name,,})
  slug="$user.$repo"
  response=$(gh api /repos/$full_name/readme)
  name=$(jq -r ".name" <<< "$response")

  shopt -s nocasematch

  if [[ "$name" =~ '.md'$ || "$name" =~ '.markdown'$ ]]
  then
    jq -r ".content" <<< "$response" | base64 --decode > "files/$slug.md"
  else
    echo "The README for $full_name ($name) is not a valid Markdown file."
  fi
}

export -f store_readme

cat ./seeds/repos.json | jq '.items[].full_name' | xargs -n 1 -I {} bash -c 'store_readme {}'
