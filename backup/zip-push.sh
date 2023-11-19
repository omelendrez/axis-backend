#!/bin/bash

git add .
git commit -m "Add database backup files as of  $(date +"%d/%m/%Y %H:%M") "
git push
