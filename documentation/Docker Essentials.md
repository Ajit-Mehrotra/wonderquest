# Docker Essentials


## Core Concepts

* **Image:**
  *  A lightweight, standalone, and executable software package that includes everything needed to run a piece of software, including code, runtime, libraries, and environment variables.
* **Container:**  
  * A runtime instance of an image. Containers are isolated and can run multiple instances of the same image.
* **Dockerfile:** 
  * A script defining how to build a Docker image, including the environment setup, dependencies, and the application code.


### Dockerfile: Blueprint for a Single Container

A Dockerfile is a script containing a series of commands that specify how to build a Docker image.

When you run `docker build -t [image_name] .` with a Dockerfile, Docker creates an image that can be run as a container.
Example:
```Dockerfile
FROM node:14
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
```

This Dockerfile sets up a Node.js environment, installs dependencies, and specifies the command to start the app.

### Images: Executable Snapshots of Applications

An image is a snapshot based on the instructions in a Dockerfile. Once created, it is reusable and portable. Images are immutable; each time you change a Dockerfile and rebuild, you get a new image.

### Containers: Running Instances of Images

A container is a runtime instance of an image. When you run docker run [image_name], Docker uses the specified image to start a container.
Containers are isolated environments where you can execute your applications.
Containers can be started, stopped, removed, and restarted as needed.

### Docker Compose: Orchestrating Multiple Containers

Docker Compose is a tool designed for defining and running multi-container Docker applications. 

In a Compose file (usually named docker-compose.yml or compose.yaml), you specify services (containers), networks, and volumes in a single configuration file.
With docker-compose up, all services defined in the Compose file are built (if needed) and started together.


### Making Changes to Docker
After any change you make in Docker, you have to first stop and remove your existing docker containers. Then you have to build the images again, and then start them up. Here's how you do that for our Docker Compose setup:

Stop and remove running docker containers:

```
$ docker compose down
```

Build and Start Services:
```
docker compose up --build -d
```
Alternatively, you could first build and then start the services:

`docker compose build` and then `docker compose up -d`. If you want to force a rebuild without using any cached layers, you can add the `docker compose build --no-cache` no cache flag:

## Debugging Docker Containers:

### See all running containers
You can see all running containers with `docker ps`. If a container that should be running isn't, you can see its logs to figure it out.

### Logging
You can see the logs by: `docker logs [container-name]` 

### Using the Docker's Command Line
Once a Docker container is up and running and you'd like to verify a file or see what's inside. You'd need to use the Docker container's command line. You can run an interactive command line in a running Docker by: `docker exec -it [container-name] sh` the "sh" is for shell. When you want to exit, type `exit` in the command line. 
