submission_id=acefff89-5b96-11f0-a99a-00155d6bb69f
DOCKER_DBSTRING=postgresql://postgres:postgres@host.docker.internal:5432/autograder?sslmode=disable

docker run --rm -it \
  --add-host=host.docker.internal:host-gateway \
  -e SUBMISSION_ID=$submission_id \
  -e DB_DSN=$DOCKER_DBSTRING \
  autograder-grader 
  #  --entrypoint bash \
  