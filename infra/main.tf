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

variable "my_ip" {
  description = "Tu IP pública"
  type        = string
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
    cidr_blocks = ["0.0.0.0/0"]
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
    from_port       = 80        # El tráfico del ALB llega a Nginx en el puerto 80
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

############################################
# LAUNCH TEMPLATE
############################################
resource "aws_launch_template" "app_lt" {
  name_prefix   = "app-lt-"
  image_id      = "ami-0c02fb55956c7d316"
  instance_type = "t3.medium"
  key_name      = var.ssh_key_name

  block_device_mappings {
    device_name = "/dev/xvda"
    ebs {
      volume_size = 30
      volume_type = "gp3"
    }
  }

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

    docker login ghcr.io -u Jettro12 -p ${var.ghcr_token}

    # Crear el docker-compose.prod.yml (está en la misma carpeta /infra)
    cat << 'COMPOSE' > docker-compose.prod.yml
    ${file("docker-compose.prod.yml")}
    COMPOSE

    # Crear el nginx.conf (subimos un nivel desde /infra para ir a /nginx)
    cat << 'NGINX' > nginx.conf
    ${file("../nginx/nginx.conf")}
    NGINX

    # Levantar el stack usando el archivo de producción
    docker-compose -f docker-compose.prod.yml pull
    docker-compose -f docker-compose.prod.yml up -d

    echo "✅ Sistema levantado con API Gateway en puerto 80."
  EOF
  )
}

############################################
# BASTION HOST
############################################
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
# LOAD BALANCER
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
    path                = "/health" # Endpoint definido en tu nginx.conf
    port                = "80"
    interval            = 60
    timeout             = 10
    healthy_threshold   = 2
    unhealthy_threshold = 5
    matcher             = "200-399"
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

############################################
# AUTO SCALING GROUP
############################################
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
output "alb_url" {
  value = aws_lb.app_alb.dns_name
}

output "asg_name" {
  value = aws_autoscaling_group.app_asg.name
}

output "bastion_ssh" {
  value = "ssh -i ${var.ssh_key_name}.pem ec2-user@${aws_instance.bastion.public_ip}"
}