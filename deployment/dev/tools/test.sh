function test() {
    local here="$(dirname "$(dirname "$(readlink -fm "$0")")")"
    echo "HERE?"
    echo $here
}

test
