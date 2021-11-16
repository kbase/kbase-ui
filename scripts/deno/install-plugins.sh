cd tools/deno-cli
DIR=`pwd`/../.. docker-compose run deno run --unstable --allow-run --allow-write --allow-read /app/scripts/deno/install-plugins.ts /app/config/plugins.yaml /app/build/dist/modules