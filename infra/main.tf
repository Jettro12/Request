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

# --- 0. OBTENER DATOS DE LA RED POR DEFECTO ---
# Esto busca tu VPC por defecto automáticamente para configurar el DNS
data "aws_vpc" "default" {
  default = true
}

# --- 1. CONFIGURACIÓN COMÚN (Script) ---
locals {
  docker_install_script = <<-EOF
    #!/bin/bash
    set -e
    apt-get update
    apt-get install -y ca-certificates curl gnupg lsb-release
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    usermod -aG docker ubuntu
    mkdir -p /home/ubuntu/deploy
    chown ubuntu:ubuntu /home/ubuntu/deploy
    systemctl enable docker
    systemctl start docker
  EOF
}

# --- 2. LLAVES SSH ---
resource "tls_private_key" "pk" {
  algorithm = "RSA"
  rsa_bits  = 4096
}

resource "aws_key_pair" "kp" {
  key_name   = "my-app-key-dns" 
  public_key = tls_private_key.pk.public_key_openssh
}

resource "local_file" "ssh_key" {
  filename        = "${path.module}/private_key.pem"
  content         = tls_private_key.pk.private_key_pem
  file_permission = "0400"
}

# --- 3. DNS PRIVADO (LA MAGIA DE LAS IPs) ---
# Crea un dominio privado solo visible dentro de tus servidores AWS
resource "aws_route53_zone" "private" {
  name = "internal.app" # Tu dominio inventado

  vpc {
    vpc_id = data.aws_vpc.default.id
  }
}

# --- 4. GRUPOS DE SEGURIDAD ---

resource "aws_security_group" "bastion_sg" {
  name        = "bastion_sg"
  description = "Permitir SSH entrada"
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "app_sg" {
  name        = "app_sg"
  description = "Web, APIs y comunicacion interna"

  ingress { # SSH desde Bastion
    from_port = 22
    to_port = 22
    protocol = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }
  ingress { # HTTP
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress { # Microservicios
    from_port = 4000
    to_port = 4010
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  ingress { # Comunicación Interna entre Nodos
    from_port = 0
    to_port = 0
    protocol = "-1"
    self = true 
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_security_group" "data_sg" {
  name        = "data_sg"
  description = "Base de datos interna"
  ingress {
    from_port = 0
    to_port = 65535
    protocol = "tcp"
    security_groups = [aws_security_group.app_sg.id]
  }
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    security_groups = [aws_security_group.bastion_sg.id]
  }
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# --- 5. INSTANCIAS ---

resource "aws_instance" "bastion" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.nano" # Bastion barato
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.bastion_sg.id]
  tags = { Name = "Bastion" }
}

resource "aws_instance" "data_server" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.small" # BD estable
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.data_sg.id]
  user_data = local.docker_install_script
  tags = { Name = "Data-Server" }
}

resource "aws_instance" "app_node_1" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.small" # Apps estables
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  user_data = local.docker_install_script
  tags = { Name = "App-Node-1" }
}

resource "aws_instance" "app_node_2" {
  ami           = "ami-04b70fa74e45c3917"
  instance_type = "t3.small" # Apps estables
  key_name      = aws_key_pair.kp.key_name
  vpc_security_group_ids = [aws_security_group.app_sg.id]
  user_data = local.docker_install_script
  tags = { Name = "App-Node-2" }
}

# --- 6. REGISTROS DNS AUTOMÁTICOS ---

# Crea el registro "db.internal.app" que apunta a la IP privada del Data Server
resource "aws_route53_record" "db" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "db.internal.app"
  type    = "A"
  ttl     = "300"
  records = [aws_instance.data_server.private_ip]
}

# Crea "node1.internal.app"
resource "aws_route53_record" "node1" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "node1.internal.app"
  type    = "A"
  ttl     = "300"
  records = [aws_instance.app_node_1.private_ip]
}

# Crea "node2.internal.app"
resource "aws_route53_record" "node2" {
  zone_id = aws_route53_zone.private.zone_id
  name    = "node2.internal.app"
  type    = "A"
  ttl     = "300"
  records = [aws_instance.app_node_2.private_ip]
}

# --- 7. IPs PÚBLICAS (EIP) ---
# Solo las necesitamos si expones servicios al internet público directamente
resource "aws_eip" "node_1_eip" {
  instance = aws_instance.app_node_1.id
  domain   = "vpc"
}

resource "aws_eip" "node_2_eip" {
  instance = aws_instance.app_node_2.id
  domain   = "vpc"
}

# --- 8. OUTPUTS ---

output "dns_names_internos" {
  value = "Tus servidores se ven entre ellos como: db.internal.app, node1.internal.app, node2.internal.app"
}

output "public_ips" {
  value = {
    DATA_PRIVATE_IP  =aws_instance.data_server.private_ip
    bastion = aws_instance.bastion.public_ip
    node1   = aws_eip.node_1_eip.public_ip
    node2   = aws_eip.node_2_eip.public_ip
  }
}