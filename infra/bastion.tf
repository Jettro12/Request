resource "aws_instance" "bastion" {
  ami           = var.ami_id
  instance_type = "t3.medium"
  subnet_id     = aws_subnet.public_1.id
  key_name      = "request-key"

  associate_public_ip_address = true

  vpc_security_group_ids = [aws_security_group.bastion_sg.id]

  tags = {
    Name = "request-app-bastion"
  }
}
