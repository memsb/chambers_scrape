docker build -t scrape -f scrape.Dockerfile .
docker tag scrape:latest 295760464315.dkr.ecr.eu-west-1.amazonaws.com/scrape:latest
docker push 295760464315.dkr.ecr.eu-west-1.amazonaws.com/scrape:latest