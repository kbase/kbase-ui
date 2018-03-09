export PATH=`pwd`/node_modules/.bin:$PATH
alias buildui="make build config=dev;make image build=build"
alias runui="make run-image env=dev"