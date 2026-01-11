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
  description = "Tu IP pública (SOLO los números, sin /32)"
  type        = string
}

############################################
# DATA: DEFAULT VPC + SUBNETS
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

# 1. ALB SG (Abierto a todo el mundo para HTTP)
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

# 2. Bastion SG (Solo tu IP puede entrar por SSH)
resource "aws_security_group" "bastion_sg" {
  name   = "bastion-sg"
  vpc_id = data.aws_vpc.default.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    # AQUÍ AGREGAMOS EL /32 AUTOMÁTICAMENTE
    cidr_blocks = ["${var.my_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3. EC2 App SG (Solo acepta tráfico del ALB y del Bastion)
resource "aws_security_group" "ec2_sg" {
  name   = "ec2-sg"
  vpc_id = data.aws_vpc.default.id

  # Entrada aplicación (Desde el Balanceador)
  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  # Entrada SSH (Desde el Bastion)
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # Salida (Necesaria para descargar Docker e imágenes)
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
  image_id      = "ami-0c02fb55956c7d316" # Amazon Linux 2 (us-east-1)
  
  # CRÍTICO: Kafka y Java requieren memoria. t3.medium = 4GB RAM.
  instance_type = "t3.medium"
  
  key_name      = var.ssh_key_name

  network_interfaces {
    security_groups             = [aws_security_group.ec2_sg.id]
    # CRÍTICO: True para tener salida a internet en VPC Default
    associate_public_ip_address = true
  }

  user_data = base64encode(<<-EOF
    #!/bin/bash
    
    # 1. Instalar Docker
    yum update -y
    amazon-linux-extras install docker -y
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ec2-user

    # 2. Instalar Docker Compose
    curl -L https://github.com/docker/compose/releases/download/v2.25.0/docker-compose-linux-x86_64 -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # 3. Login a GHCR
    docker login ghcr.io -u Jettro12 -p ${var.ghcr_token}

    # 4. Preparar carpeta
    mkdir -p /app
    cd /app

    # 5. Crear archivos desde tu PC local
    cat << 'SQL' > init.sql
    ${file("init.sql")}
    SQL

    cat << 'COMPOSE' > docker-compose.yml
    ${file("docker-compose.prod.yml")}
    COMPOSE

    # 6. Ajuste memoria virtual (Elastic/Kafka)
    sysctl -w vm.max_map_count=262144

    # 7. Levantar
    docker-compose up -d
  EOF
  )
}

############################################
# ALB (Load Balancer)
############################################
resource "aws_lb" "app_alb" {
  name               = "app-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "app_tg" {
  name     = "app-tg"
  port     = 3000
  protocol = "HTTP"
  vpc_id   = data.aws_vpc.default.id

  health_check {
    path                = "/"
    port                = "3000"
    interval            = 60  # Damos más tiempo porque Java es lento en arrancar
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
  # IMPORTANTE: Nombre fijo para GitHub Actions
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
# BASTION HOST
############################################
resource "aws_instance" "bastion" {
  ami                         = "ami-0c02fb55956c7d316"
  instance_type               = "t3.micro"
  key_name                    = var.ssh_key_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id]
  associate_public_ip_address = true
  
  tags = {
    Name = "Bastion-Host"
  }
}

############################################
# OUTPUTS
############################################
output "alb_url" {
  value = aws_lb.app_alb.dns_name
}

output "bastion_ssh" {
  value = "ssh -i ${var.ssh_key_name}.pem ec2-user@${aws_instance.bastion.public_ip}"
}