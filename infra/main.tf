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
  description = "GitHub Container Registry Token"
  type        = string
  sensitive   = true
}

variable "ssh_key_name" {
  description = "Nombre de la Key Pair en AWS (sin .pem)"
  type        = string
}

variable "database_url" {
  description = "URL de Supabase o RDS"
  type        = string
}

variable "nextauth_secret" {
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

# SG para el Balanceador
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

# SG para los Microservicios (EC2 Principal)
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
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# SG para Infraestructura (Redis, MQTT, RabbitMQ externo)
resource "aws_security_group" "infra_sg" {
  name   = "infra-sg"
  vpc_id = data.aws_vpc.default.id

  # Permitir Redis desde la EC2 de apps
  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  # Permitir MQTT (Mosquitto)
  ingress {
    from_port       = 1883
    to_port         = 1883
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2_sg.id]
  }

  # SSH para mantenimiento
  ingress {
    from_port   = 22
    to_port     = 22
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

############################################
# RECURSOS DE INFRAESTRUCTURA (REDIS & MQTT)
############################################

# Redis gestionado (ElastiCache)
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "app-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  security_group_ids   = [aws_security_group.infra_sg.id]
}

# MQTT Broker (EC2 con Mosquitto)
resource "aws_instance" "mqtt_broker" {
  ami                         = "ami-0c02fb55956c7d316"
  instance_type               = "t3.nano"
  key_name                    = var.ssh_key_name
  vpc_security_group_ids      = [aws_security_group.infra_sg.id]
  associate_public_ip_address = true

  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    amazon-linux-extras install mosquitto -y
    systemctl start mosquitto
    systemctl enable mosquitto
  EOF

  tags = { Name = "MQTT-Broker" }
}

############################################
# LAUNCH TEMPLATE (APP PRINCIPAL)
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

    mkdir -p /app
    cd /app

    # Crear el archivo .env con los endpoints de AWS
    cat << 'ENV' > .env
    DATABASE_URL="${var.database_url}"
    NEXTAUTH_SECRET="${var.nextauth_secret}"
    REDIS_URL="redis://${aws_elasticache_cluster.redis.cache_nodes[0].address}:6379"
    MQTT_BROKER="mqtt://${aws_instance.mqtt_broker.private_ip}:1883"
    ENV

    docker login ghcr.io -u Jettro12 -p ${var.ghcr_token}

    cat << 'COMPOSE' > docker-compose.prod.yml
    ${file("docker-compose.prod.yml")}
    COMPOSE

    mkdir -p nginx
    cat << 'NGINX' > nginx/nginx.conf
    ${file("../nginx/nginx.conf")}
    NGINX

    # Levantar
    docker-compose -f docker-compose.prod.yml up -d
  EOF
  )
}

############################################
# LOAD BALANCER & ASG
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
output "alb_dns" { value = aws_lb.app_alb.dns_name }
output "redis_endpoint" { value = aws_elasticache_cluster.redis.cache_nodes[0].address }
output "mqtt_private_ip" { value = aws_instance.mqtt_broker.private_ip }