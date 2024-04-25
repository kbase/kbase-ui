
cd temp
mkcert -cert-file test.crt --key-file test.key kbase.us "*.kbase.us" "*.ci.kbase.us" "*.next.kbase.us" "*.appdev.kbase.us" "*.narrative2.kbase.us" "*.narrative.kbase.us" "*.narrative-dev.kbase.us" "*.ci-europa.kbase.us"
mv test.* ../tools/proxy/contents/ssl