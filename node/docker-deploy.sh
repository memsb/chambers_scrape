docker build -t node_scrape -f node.Dockerfile .
docker tag node_scrape:latest 295760464315.dkr.ecr.eu-west-1.amazonaws.com/node_scrape:latest
docker push 295760464315.dkr.ecr.eu-west-1.amazonaws.com/node_scrape:latest