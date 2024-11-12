# Setup Guide

## Prerequisites

* Node.js: Install the latest version of Node.js (v22.x recommended).

* Docker: Required for containerization (optional if running locally or directly).

* Firebase: Set up a Firebase project, enabling Firestore and Firebase Authentication.

## Clone the Repository

```bash 
$ git clone <repository-url>
$ cd <project-folder>
```

## Local Setup 
### Environment Variables

Create a .env file for both backend and frontend to store sensitive data.

**Backend .env:**
```sh
# General
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# SSL Certificates
SSL_KEY_PATH=
SSL_CERT_PATH=

# Firebase Admin SDK (see docs for more info)
TYPE=
PROJECT_ID=
PRIVATE_KEY_ID=
PRIVATE_KEY=
CLIENT_EMAIL=
CLIENT_ID=
AUTH_URI=
TOKEN_URI=
AUTH_PROVIDER_X509_CERT_URL=
CLIENT_X509_CERT_URL=
UNIVERSE_DOMAIN=
```
General
* `NODE_ENV` --> production or development
* `PORT` --> whatever port you're running the backend server on
* `CORS_ORIGIN` --> whitelisting who can call the API

In development env, you can leave the ssl paths blank. 

Firebase Admin SDK:
> 
1. Generate a service account key for Firebase access via Firebase Admin SDK
   1. Go to your Firebase ***Project*** Settings
   2. Navigate to the `Service accounts` tab 
   3. Click `Generate new private key`
   4. This should download a JSON file containing the service account key
   5. Copy all of the information to the env file

**Frontend .env:**
```sh
VITE_APP_BACKEND_SERVER_URL=http://localhost:3001

VITE_APP_FIREBASE_AUTH_API_KEY=
VITE_APP_FIREBASE_AUTH_DOMAIN=
VITE_APP_FIREBASE_AUTH_PROJECT_ID=
VITE_APP_FIREBASE_AUTH_STORAGE_BUCKET=
VITE_APP_FIREBASE_AUTH_MESSAGING_SENDER_ID=
VITE_APP_FIREBASE_AUTH_APP_ID=
VITE_APP_FIREBASE_AUTH_MEASUREMENT_ID=

```


* `VITE_APP_BACKEND_SERVER_URL` --> the url for the backend server. Used to send API requests to the backend from the frontend. 
* The rest can be found by going to your Firebase ***Project*** settings:
  * Navigate to `SDK setup and configuration` 
  * Clicking the `Config` radio button.
  * Copy the values from the firebaseConfig object to the .env file 


###  Install Dependencies & Run


**Backend**
```sh
$ cd backend
$ npm install
$ dotenvx run -- npm start
```
**Frontend/Client**
```sh
$ cd client
$ npm install
$ npm start
```

## Deployment Guide

The repository contains Dockerfiles for both client and backend. 

### Prerequisites

1. AWS EC2 instance or whatever you're deploying on
2. A custom domain
3. Clone the repo on the host server
4. Basic Docker Knowledge
5. Basic vim knowledge. Here's a good [cheat sheet](https://opensource.com/downloads/cheat-sheet-vim)


### Deployment Steps


 **Connecting to your EC2 instance** 

Once you create your EC2 instance, you need to SSH into it in order to access the VM's terminal remotely:
1. Open Windows Powershell
2. Type `ssh` to verify ssh command exists. If it doesn't then you need to install an SSH client like OpenSSH or use WSL
3.  Go to your EC2 instance on amazon. Select it and click `connect`. Navigate to the `SSH client` screen.
4.  Copy the script in the `example`. 

Some Debugging:

* If you run into any issues in this process, this might [help](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/connect-linux-inst-ssh.html). 

* You might need to add an Inbound rule on your EC2 instance on Port 22. Do one for your own IP address and then another two for the ones with "instance-connect" in the "prefixes list". So three rules total. 

* I ran into permission issues regarding the `.pem` file. I found this [StackExchange post](https://superuser.com/questions/1296024/windows-ssh-permissions-for-private-key-are-too-open) from 13 years ago to be helpful.


**Install Docker and Docker Compose**

Follow this to install [Docker on Linux](https://docs.docker.com/engine/install/ubuntu/).

Follow this to install [Docker Compose](https://docs.docker.com/compose/install/linux/#install-using-the-repository).

Make sure you're installing `docker compose` and not `docker-compose` **as in**, when you type the command, it should look like "docker compose" and not "docker-compose". 

**Clone the Repository**

```bash 
$ git clone <repository-url>
$ cd <project-folder>
```

**Basic Setup - Enviornment Variables**

This guide assumes that you have bought your domain, but have not set up SSL to enable HTTPS. We'll be walking through that process later in the guide. Just make sure to have that URL ready as we're going to use it in the enviornment variables

The enviornment variables that would be traditionally (in a local enviornment) be an `.env` are in the `compose.yaml` file under `args`. I've created a `compose.yaml`. Fill in your details.

The setup is similar to the setup previously described in the [local enviornment variables setup](#environment-variables) except:
* You're going to be using the **http** version of your domain (and no port number) instead of localhost:port. 


**HTTP Setup - Backend Server**

In order to have HTTPS, we need to get an SSL certificate. We can't do that unless we have HTTP running properly. The code is different for HTTP and HTTPS and the current code is for HTTPS, not HTTP.

* Set the enviornment in compose.yaml in the backend to `development` this will enable HTTP.


**HTTP Setup - Nginx Configuration**

The current configuration is for HTTPS, which is on PORT 443 by default. However, port 80, which is the default for HTTP is what we need to use.

1. Go to `client/nginx.conf`
2. Delete everything
3. Replace it what is in `documentation/pre-ssl-cert-gen/client/nginx.conf`
4. ! Important ! - Replace my `server_name` with yours

Basically the nginx configuration is acting as a router, telling all requests on port 80 to go where they need to go.

**HTTP Setup - Docker Configuration**

1. Go to `client/Dockerfile` and delete the `COPY certbot_renew /etc/crontabs/root` line. We'll add that back after we add the SSL certification. 
2. Go to `compose.yaml` in the root directory.
3. Change `https` to `http` in the `args` for both `CORS_ORIGIN` and `VITE_APP_BACKEND_SERVER_URL`

**HTTP Setup - Build and Start Docker Images**

```sh
$ docker compose up --build -d
```

**Verify Containers are Running**

There should be two containers running. 
```sh
$ docker ps
```
If there aren't, then there was an error. You need to check the logs:
```sh
docker logs [container-name]
```

**Verify Inbound Rules on EC2 Instance**
Make sure you have an inbound rule for the AWS EC2 instance for HTTP on port 80 from anywhere (we're going to a request from the Let's Encrypt CA for SSL certification, so don't do it only for your IP)

**Point your domain name to your EC2 instance**

If you're using Cloudflare (you can use anything) you can follow these steps:
1. Go to your custom domain
2. Navigate to `DNS`
3. Click `Add Record`
4. Add an `A` record with the `@` for a root domain (ex. @ for ajitm.com) or the actual subdomain (ex. wonderquest for wonderquest.ajitm.com)
5. Enter in the public IPv4 address of your EC2 instance
6. Disable the proxy (for now, you should be able to enable it later).

**Verify HTTP website**

Go to the **HTTP** version of your domain (ex. http://wonderquest.ajitm.com vs https://wonderquest.ajitm.com). If you've done this multiple times now, the browser might have cached your website, so you might want to try clearing cache or using incognito mode. 

Test all functionality (using dummy data). Make sure both frontend and backend are working. You can do this while inspecting the console and the network tab for any errors. 

Errors will likely be due to due a misconfiguration in the nginx config, compose.yaml, or ec2 inbound rules. If everything works fine, move onto the next step. 

**Get the SSL Certificate**

At this point, both of your containers should be running fine. If they're not you need to get them running. 

Once both are running and you've verified that the domain is up. Type the following in the command line:

```
$ docker exec -it [FRONTEND CONTAINER NAME] certbot --nginx -d [YOUR DOMAIN] --non-interactive --agree-tos -m [YOUR EMAIL]
```

Your frontend container name should be: `auto_kanban-frontend-1`, but just double check you're using the command on the frontend docker.

You should not get any errors. If you do, fix that first before moving on.

**Verify SSL Certificate**

The SSL certificate should exist on the EC2 instance itself. Exit the docker container's command line by typing `exit` and cd to the following directory. 

```
$ cd ~
$ cd ../../etc/letsencrypt
$ sudo -s
$ cd live
$ ls
$ exit
```
You should see your domain name as a folder. If that exists, you're good, everything worked properly. Now we're going to enable the configuration for https

**HTTPS Setup - Backend Server**

Now that we have an SSL certification, we can run HTTPS. Let's set that up.

1. Navigate back to your project directory
2. Run `docker compose down` 
3. Change the compose.yaml node enviornment to `production`
4. Remember to change the domain to https: your domain in the compose yaml file.

**HTTPS Setup - Nginx Configuration**

The current configuration is for HTTPS, which is on PORT 443 by default. However, port 80, which is the default for HTTP is what we need to use.

1. Go to `client/nginx.conf`
2. Delete everything
3. Replace it with what it was originally. You can find that on the GitHub repo
4. ! Important ! - Replace all of the [YOUR-DOMAIN] with your domain.

Basically the nginx configuration is acting as a router. It's telling all requests on port 80 (except the SSL challenge) to redirect to HTTPS (port 443). On port 443, redirect to respective places with https. 

**HTTPS Setup - Docker Configuration**

1. Go to `client/Dockerfile` and add the `COPY certbot_renew /etc/crontabs/root` line back in.
2. Go to `compose.yaml` in the root directory.
3. Change `http` to `https` in the `args` for both `CORS_ORIGIN` and `BACKEND_SERVER_URL`


**HTTPS Setup - Build and Start Docker Images**

```sh
$ docker compose up --build -d
```

**Verify Containers are Running**

```sh
$ docker ps
```
There should be two containers running. If there aren't, then there was an error. You need to check the logs:
```sh
docker logs [container-name]
```

**Verify Inbound Rules on EC2 Instance**

Make sure you have an inbound rule for HTTP on port 443 from anywhere.

**Verify HTTPS website**

Go to the **HTTPS** version of your domain. If you've done this multiple times now, the browser might have cached your website, so you might want to try clearing cache or using incognito mode. Test all functionality (using dummy data). Make sure both frontend and backend are working. You can do this while inspecting the console and the network tab for any errors. 

Errors will likely be due to due a misconfiguration in the nginx config, compose.yaml, or ec2 inbound rules. If everything works fine, move onto the next step. 

**Firebase Auth Issues**

If Google Sign-In isn't working, that's an issue with Firebase Authentication:
1. Go to your `Firebase Authentication`
2. Navigate to `Settings`
3. Click the `Authorized Domains` tab
4. Add your domain to this list. You can also add your public server IP address too, if you want.