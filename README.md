# WonderQuest - the quests given by life
Wonderquest is a kanban application designed to help users automatically prioritize and manage tasks on a Kanban board. The app is built using React, Docker, GCP, Docker, and it features a front end served through Nginx, a backend API, and SSL/TLS certificates handled via Let's Encrypt and Certbot. The app can be easily deployed on a cloud VM like AWS EC2 with a Dockerized setup. Alternatively, it can be deployed locally as well. 

You can also check out the live version at: [wonderquest.ajitm.com](https://wonderquest.ajitm.com). 

![](./client/src/assets/demo/demoLight.gif)

## Features

* Automatic Task Prioritization: Uses customizable formulas to assign priority scores to tasks.
* Task Management: Add, edit, delete, and reorder tasks using drag-and-drop.
* Focus mode: focus on what needs to be done, not what has already been completed
* Linked-List Based Dragging: Optimized task reordering with a linked-list implementation for smooth performance.
* OAuth Integration: Supports authentication via Google Sign-In.
* SSL/TLS Support: Secure HTTPS configuration with Let's Encrypt certificates.
* Easy Deployment: Docker Compose support for a fully containerized setup.
* Auto-Renewing SSL: Certbot with a cron job for automatic SSL renewal every 60 days.

## Architecture
                            +---------------------------+
                            |       Cloudflare          |
                            |    (DNS & SSL Redirect)   |
                            +-------------+-------------+
                                          |
                                          |
                          +---------------v---------------+
                          |           EC2 Instance       |
                          |    (Ubuntu, Dockerized)      |
                          +----------------+-------------+
                                          |
                          +---------------+---------------+
                          |               |               |
             +------------v-----+   +-----v------------+  |
             |  Nginx + Frontend |   |  Backend (API)  |  |
             |    (React + Vite) |   |  (Express +     |  |
             +-------------------+   |    Firebase SDK)|
                                     +-----------------+

## Setup Instructions
There's some very detailed instructions for both local and production setup and deployment. Check it out [here](/documentation/Setup%20Guide.md).

## Technologies Used

* React: Frontend library for building user interfaces.
* Vite: Build tool
* GCP Auth & Firebase: Backend for authentication and real-time database.
* Docker: For containerization of app
* AWS EC2: For hosting the server on a VM
* Cloudflare: For custom domain and DNS settings
* React-Bootstrap: For UI components and styling.

## Contributing is not welcome HAHAHA. 
Jk. Fork the repo, create a new branch, and send in a pull request. You can also tell us if you encounter any bugs by reporting them on our website or github.

A couple things on the todo list:
- [ ] Fix API endpoints to not include UserID in URL and take them from the auth-token instead (should be done on some, just need to do the rest)
- [ ] Replace React-Beautiful-DnD with another dependency that works better with latest React (had to remove React Strict Mode after updating react version for deployment)
- [ ] Seperate Nginx reverse proxy container from the frontend docker just for better seperation. We use ngix for both serving static content and then also as a reverse proxy.
- [ ] Make it easier to deploy because there are so many things you need to setup for a relatively simple application, but I guess that's normal.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
