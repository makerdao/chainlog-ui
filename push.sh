#! /bin/bash

git add api
git commit -m "feat: add ${1} v${2}"
git push https://$GITHUB_ACCESS_TOKEN@github.com/makerdao/chainlog-ui.git
