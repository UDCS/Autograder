cd grader
# Remove any existing autograder-grader images (tagged or orphaned) before rebuilding
docker images "autograder-grader" -q | sort -u | xargs -r docker rmi -f
docker build -t autograder-grader .
docker image prune -f
cd ..
