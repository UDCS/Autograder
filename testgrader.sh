SUBMISSION_ID=054815b5-6912-4dc8-977f-856ad53697d9
DB_DSN=postgresql://postgres:postgres@host.docker.internal:5432/autograder?sslmode=disable

docker run --rm -it \
  --add-host=host.docker.internal:host-gateway \
  -e SUBMISSION_ID=$SUBMISSION_ID \
  -e DB_DSN=$DB_DSN \
  autograder-grader 
  #  --entrypoint bash \
  