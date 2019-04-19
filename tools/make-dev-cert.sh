
cd temp
mkcert -cert-file test.crt --key-file test.key kbase.us "*.kbase.us"
mv test.* ../tools/proxy/contents/ssl