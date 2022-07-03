#!/usr/bin/env bash

store_readme() {
  repo=${1:-$(cat)}
  # slug=$(grep -E '^.{3,6}$' /usr/share/dict/words | shuf -n 4 | paste -sd '-' -)
  slug=$(echo $repo | tr '/' '.')
  slug=${slug,,} # lowercase
  response=$(gh api /repos/$repo/readme)
  name=$(jq -r ".name" <<< "$response")

  shopt -s nocasematch

  if [[ "$name" =~ '.md'$ || "$name" =~ '.markdown'$ ]]
  then
    jq -r ".content" <<< "$response" | base64 --decode > "files/$slug.md"
  else
    echo "The README for $repo ($name) is not a valid Markdown file."
  fi
}

export -f store_readme

cat ./seeds/repos.json | jq '.items[].full_name' | xargs -n 1 -I {} bash -c 'store_readme {}'
