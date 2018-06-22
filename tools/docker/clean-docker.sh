network=$1
if [ -z "$network" ]; then 
    echo "ERROR: argument 1, 'network', not provided"
    usage
    exit 1
fi

function clean_docker() {
    local net=$1
    local network_exists=$(docker network ls --filter name=$net --format='{{.CreatedAt}}')
    if [ -n "$network_exists" ]
    then
        docker network rm $net
        echo "Docker network ${net} removed"
    else
        echo "Docker network ${net} not present, skipping removal"
    fi
	docker image prune --force --filter label=stage=intermediate
}

clean_docker $network

