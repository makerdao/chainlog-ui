# chainlog-ui
UI for MakerDAO’s chainlog contract

[chainlog.makerdao.com](https://chainlog.makerdao.com)

## Test locally with Docker
1. Build the 2 Docker images:
```
docker build -t chainlog-ui .
docker build -t chainlog-logger -f Dockerfile.logger .
```
2. Start the 2 containers:
```
docker-compose up -d
```
3. Look at the logs:
```
docker logs -f chainlog-ui
docker logs -f chainlog-logger
```
