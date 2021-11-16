# Local Development

1. map ci.kbase.us -> localhost

2. run the local proxy

cd tools/proxy-standalone
ENV=ci docker compose up

3. start the app

cd react-app
npm run start