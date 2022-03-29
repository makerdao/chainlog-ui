# chainlog-ui
UI and API for MakerDAO’s chainlog contract

* [chainlog.makerdao.com](https://chainlog.makerdao.com)
* [chainlog.makerdao.com/api.html](https://chainlog.makerdao.com/api.html)

## Test locally with Docker
1. Make sure that older Docker images are removed, and containers are stopped, if you want to test new code:
```
docker rmi chainlog-ui
docker rmi chainlog-logger
```
2. Build the Docker images and start the 2 containers:
```
docker-compose up -d
```
3. Look at the logs:
```
docker logs -f chainlog-ui
docker logs -f chainlog-logger
```
4. Stop the containers:
```
docker-compose down
```
