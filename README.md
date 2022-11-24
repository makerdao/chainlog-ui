# chainlog-ui
UI and API for MakerDAO’s chainlog contract

## Production environment

* [chainlog.makerdao.com](https://chainlog.makerdao.com)
* [chainlog.makerdao.com/api.html](https://chainlog.makerdao.com/api.html)
* chainlog.makerdao.com/checksum/\<address\>

## Staging environment

* [chainlog-staging.makerdao.com](https://chainlog-staging.makerdao.com)
* [chainlog-staging.makerdao.com/api.html](https://chainlog-staging.makerdao.com/api.html)
* chainlog-staging.makerdao.com/checksum/\<address\>

## Deployment strategy

* Automatic deployment from `dev` branch to Staging environment
* Automatic deployment from `main` branch to Production environment

## Test locally with Docker
1. Make sure that older Docker images are removed, and containers are stopped, if you want to test new code:
```
docker rmi chainlog-ui
docker rmi chainlog-logger
docker rmi chainlog-checksum
```
2. Build the Docker images and start the 3 containers:
```
docker-compose up -d
```
3. Look at the logs:
```
docker logs -f chainlog-ui
docker logs -f chainlog-logger
docker logs -f chainlog-checksum
```
4. Stop the containers:
```
docker-compose down
```

**Note:** nginx.conf.template is being customized with the path `/checksum` and copied into the `chainlog-ui` container, for sending traffic to the container running the `checksum.py` script.
