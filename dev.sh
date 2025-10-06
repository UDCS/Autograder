#!/bin/sh

[ -f ./emailrc ] && source ./emailrc
cd web && yarn dev & air && fg
