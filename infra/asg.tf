resource "aws_autoscaling_group" "api" {
  desired_capacity = 2
  max_size         = 3
  min_size         = 1
  vpc_zone_identifier = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  launch_template {
    id      = aws_launch_template.api.id
    version = "$Latest"
  }
}

resource "aws_autoscaling_group" "frontend" {
  desired_capacity = 1
  max_size         = 2
  min_size         = 1
  vpc_zone_identifier = [aws_subnet.public_1.id, aws_subnet.public_2.id]

  launch_template {
    id      = aws_launch_template.frontend.id
    version = "$Latest"
  }
}
