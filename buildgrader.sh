cd grader
docker build -t autograder-grader .
docker image prune -f
cd ..