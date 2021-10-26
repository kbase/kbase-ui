cd tools/deno-cli
DIR=`pwd`/../.. docker-compose run deno run \
  --unstable --allow-run --allow-write --allow-read \
  /app/scripts/deno/docker-compose-override.ts /app/dev --config-dir /app/dev/gitlab-config

# docker run -v `pwd`/../..:/app --rm deno run --unstable --allow-run --allow-write --allow-read /app/scripts/deno/docker-compose-override.ts /app/dev/docker-compose-override.yml --config-dir /app/dev/gitlab-config