#!/bin/sh

source ./emailrc
cd web && yarn dev & air && fg
