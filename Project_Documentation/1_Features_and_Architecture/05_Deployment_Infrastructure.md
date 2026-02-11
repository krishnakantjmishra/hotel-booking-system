# 05. Deployment & Infrastructure (DevOps)

How this code runs on the internet (AWS EC2).

## The Components

1.  **EC2 (Elastic Compute Cloud)**:
    - A virtual server running **Ubuntu Linux**. It's our computer in the cloud.
2.  **Nginx (The Bouncer)**:
    - Listens on Port 80 (HTTP).
    - **Reverse Proxy**: It receives public requests.
        - If request is for a file (image/css): Nginx serves it from `/var/www/html` or similar.
        - If request is for logic (`/api`): Nginx forwards it to `localhost:8000` (where Gunicorn lives).
3.  **Gunicorn (The Application Server)**:
    - "Green Unicorn". It is a production-grade WSGI server.
    - `python manage.py runserver` is for **testing**. Gunicorn is for **production**.
    - It runs multiple "workers" (processes) to handle concurrent requests.
4.  **Systemd (The Supervisor)**:
    - A Linux background process manager.
    - We have a file `/etc/systemd/system/gunicorn.service`.
    - It ensures Gunicorn starts on boot and restarts if it crashes.

## Deployment Scripts
We wrote shell scripts (`.sh`) to automate updates. Manual typing is error-prone.
- **`deploy.sh`**:
    1.  `git pull origin main` (Get latest code).
    2.  `pip install -r requirements.txt` (Get new libraries).
    3.  `python manage.py migrate` (Update DB schema).
    4.  `python manage.py collectstatic` (Prepare CSS/JS).
    5.  `sudo systemctl restart gunicorn` (Reload code).
    6.  `sudo systemctl reload nginx` (Reload config).

## Automation (GitHub Actions - *Concept*)
Currently, we trigger deploy manually. In a CI/CD pipeline, GitHub would SSH into EC2 and run this script automatically on push.
