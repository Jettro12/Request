terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = "us-east-1"
}

# --- 0. CONFIGURACIÓN COMÚN (Script de instalación) ---
# Definimos el script de instalación una sola vez para usarlo en App y Data
locals {
  docker_install_script = <<-EOF
              #!/bin/bash
              sudo apt-get update
              sudo apt-get install -y ca-certificates curl gnupg
              sudo install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
              sudo chmod a+r /etc/apt/keyrings/docker.gpg
              echo \
                "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
                "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
                sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
              sudo apt-get update
              sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
              sudo usermod -aG docker ubuntu
              # Crear directorio de despliegue por defecto
              mkdir -p /home/ubuntu/deploy
              chown ubuntu:ubuntu /home/ubuntu/deploy
              EOF
}

# --- 1. LLAVES SSH ---

resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = "my-app-key"
  public_key = tls_private_key.pk.public_key_openssh
}

resource "local_file" "ssh_key" {
  filename        = "${path.module}/private_key.pem"
  content         = tls_private_key.pk.private_key_pem
  file_permission = "0400"
}

# --- 2. GRUPOS DE SEGURIDAD ---

# A. Bastion SG (Entrada SSH desde internet)
resource "aws_security_group" "bastion_sg" {
  name        = "bastion_sg"
  description = "Permitir SSH entrada"

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

# B. App SG (Web publica, SSH desde Bastion)
resource "aws_security_group" "app_sg" {
  name        = "app_sg"
  description = "Web publica y SSH interno"

  # SSH solo desde el Bastion
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  # HTTP Publico
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Publico (Opcional si configuras SSL luego)
  ingress {
    from_port   = 443
    to_port     = 443
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

# C. Data SG (Solo accesible desde App Server y Bastion)
resource "aws_security_group" "data_sg" {
  name        = "data_sg"
  description = "Base de datos y Mensajeria interna"

  # Permitir TODO el tráfico TCP que venga del App Server
  # (Postgres 5432, Redis 6379, Kafka 9092, etc.)
  ingress {
    from_port       = 0
    to_port         = 65535
    protocol        = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }

  # Permitir SSH desde el Bastion (para depuración)
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- 3. INSTANCIAS ---

# A. Bastion Host
resource "aws_instance" "bastion" {
  ami           = "ami-04b70fa74e45c3917" # Ubuntu 24.04 us-east-1
  instance_type = "t3.micro"
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  tags = { Name = "Bastion-JumpBox" }
}

# B. Data Server (Backend Infra: BD, Kafka, Redis)
resource "aws_instance" "data_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.medium" # Más RAM para Kafka/Postgres
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.data_sg.id]
  
  user_data = local.docker_install_script

  tags = { Name = "Data-Server" }
}

# C. App Server (Microservicios + Frontend)
resource "aws_instance" "app_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.medium"
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]

  user_data = local.docker_install_script

  tags = { Name = "App-Server" }
}

# --- 4. NETWORKING AVANZADO ---

# IP Elástica para el App Server (Para que el Frontend siempre apunte a la misma IP)
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"
  
  tags = { Name = "App-Elastic-IP" }
}

# --- 5. OUTPUTS (Lo que necesitas para GitHub y .env) ---

output "bastion_public_ip" {
  value = aws_instance.bastion.public_ip
  description = "IP Publica del Bastion. Usar en GitHub Secret: BASTION_HOST"
}

output "app_public_ip_fija" {
  value = aws_eip.app_eip.public_ip
  description = "IP Publica FINAL. Usar en .env local (NEXT_PUBLIC_API) y GitHub Secret"
}

output "app_private_ip" {
  value = aws_instance.app_server.private_ip
  description = "IP Privada App. Usar en GitHub Secret: APP_HOST"
}

output "data_private_ip" {
  value = aws_instance.data_server.private_ip
  description = "IP Privada Data. Usar en GitHub Secret: DATA_HOST y en .env como host de DB/Kafka"
}

output "private_key_pem" {
  value     = tls_private_key.pk.private_key_pem
  sensitive = true
}