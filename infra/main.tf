############################################
# PROVIDER
############################################
provider "aws" {
  region = "us-east-1"
}

############################################
# VARIABLES
############################################
variable "ghcr_token" {
  type      = string
  sensitive = true
}

variable "ssh_key_name" {
  type = string
}

variable "my_ip" {
  type = string
}

variable "database_url" {
  type = string
}

variable "nextauth_secret" {
  type      = string
  sensitive = true
}

variable "supabase_url" {
  type = string
}

variable "supabase_anon_key" {
  type      = string
  sensitive = true
}

############################################
# DATA
############################################
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

############################################
# SECURITY GROUPS
############################################

resource "aws_security_group" "alb_sg" {
  name   = "alb-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "bastion_sg" {
  name   = "bastion-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "ec2_sg" {
  name   = "ec2-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "infra_sg" {
  name   = "infra-sg"
  vpc_id = data.aws_vpc.default.id
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }
  ingress {
    from_port       = 1883
    to_port         = 1883
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

############################################
# INFRAESTRUCTURA (REDIS, MQTT, BASTION)
############################################

resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "app-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.infra_sg.id]
}

resource "aws_instance" "mqtt_broker" {
  ami                    = "ami-0c02fb55956c7d316"
  instance_type          = "t3.nano"
  key_name               = var.ssh_key_name
  vpc_security_group_ids = [aws_security_group.infra_sg.id]
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install mosquitto -y
    systemctl start mosquitto
    systemctl enable mosquitto
  EOF
  tags = { Name = "MQTT-Broker" }
}

resource "aws_instance" "bastion" {
  ami                         = "ami-0c02fb55956c7d316"
  instance_type               = "t3.micro"
  key_name                    = var.ssh_key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  associate_public_ip_address = true
  tags = { Name = "Bastion-Host" }
}

############################################
# LAUNCH TEMPLATE
############################################

resource "aws_launch_template" "app_lt" {
  name_prefix   = "app-lt-"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.medium"
  key_name      = var.ssh_key_name
  network_interfaces {
    security_groups             = [aws_security_group.ec2_sg.id]
    associate_public_ip_address = true
  }
  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user
    curl -L https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    mkdir -p /app/nginx
    cd /app

    # Generación del .env con el DNS dinámico del ALB
    cat << 'ENV' > .env
    DATABASE_URL="${var.database_url}"
    NEXTAUTH_SECRET="${var.nextauth_secret}"
    NEXT_PUBLIC_SUPABASE_URL="${var.supabase_url}"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="${var.supabase_anon_key}"
    REDIS_URL="redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
    MQTT_BROKER="mqtt://${aws_instance.mqtt_broker.private_ip}:1883"
    KAFKA_BROKER="kafka:9092"
    NEXTAUTH_URL="http://${aws_lb.app_alb.dns_name}"
    NEXT_PUBLIC_API_BASE_URL="http://${aws_lb.app_alb.dns_name}"
    ENV

    cat << 'COMPOSE' > docker-compose.prod.yml
    ${file("docker-compose.prod.yml")}
    COMPOSE

    cat << 'NGINX' > nginx/nginx.conf
    ${file("../nginx/nginx.conf")}
    NGINX

    # Reemplazo dinámico del DNS en Nginx para CORS
    sed -i "s/INSERT_ALB_DNS_HERE/${aws_lb.app_alb.dns_name}/g" nginx/nginx.conf

    docker login ghcr.io -u Jettro12 -p ${var.ghcr_token}
    /usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
  EOF
  )
}

############################################
# ALB & ASG
############################################

resource "aws_lb" "app_alb" {
  name               = "app-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "app_tg" {
  name     = "app-tg"
  port     = 80
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id
  health_check {
    path = "/health"
    port = "80"
  }
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.app_alb.arn
  port              = 80
  protocol          = "HTTP"
  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.app_tg.arn
  }
}

resource "aws_autoscaling_group" "app_asg" {
  name                = "request-app-asg"
  desired_capacity    = 1
  min_size            = 1
  max_size            = 2
  vpc_zone_identifier = data.aws_subnets.default.ids
  target_group_arns   = [aws_lb_target_group.app_tg.arn]
  launch_template {
    id      = aws_launch_template.app_lt.id
    version = "$Latest"
  }
}

############################################
# OUTPUTS
############################################
output "alb_dns_url" {
  value = "http://${aws_lb.app_alb.dns_name}"
}

output "bastion_ssh" {
  value = "ssh -i ${var.ssh_key_name}.pem ec2-user@${aws_instance.bastion.public_ip}"
}