#!/bin/bash
yum update -y
yum install -y docker git
systemctl start docker
systemctl enable docker

curl -L https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64 \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

cd /home/ec2-user
git clone https://github.com/Jettro12/Request.git
cd Request
git checkout fix-microservices

docker-compose -f docker-compose.messaging.yml up -d
