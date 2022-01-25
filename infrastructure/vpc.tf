variable "vpc_id" {
  default = "vpc-022346a8254a276bf"
}

data "aws_vpc" "selected" {
  id = var.vpc_id
}

data "aws_subnet_ids" "subnets" {
  vpc_id = data.aws_vpc.selected.id
}

data "aws_subnet" "subnets" {
  count = "${length(data.aws_subnet_ids.subnets.ids)}"
  id    = "${tolist(data.aws_subnet_ids.subnets.ids)[count.index]}"
}

resource "aws_security_group" "chambers_scan" {
  name        = "chambers_scan"
  description = "Security group for scanning chambers"
  vpc_id      = var.vpc_id

  tags = var.chambers_tags
}

resource "aws_security_group_rule" "allow_all" {
  security_group_id = aws_security_group.chambers_scan.id
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  ipv6_cidr_blocks  = ["::/0"]
}
