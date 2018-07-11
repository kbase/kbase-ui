
network=$1
if [ -z "$network" ]; then 
    echo "ERROR: argument 1, 'network', not provided"
    usage
    exit 1
fi

function ensure_network_exists() {
    local net=$1
    local network_exists=$(docker network ls --filter name=$net --format='{{.CreatedAt}}')
    if [ -z "$network_exists" ]; then
        docker network create $net
    fi
}

ensure_network_exists $network