resource "aws_ecs_cluster" "scrape_chambers" {
  name               = "scrape_chambers"
  capacity_providers = ["FARGATE"]

  tags = var.publications_tags
}

resource "aws_ecr_repository" "research" {
  name                 = "research"
  image_tag_mutability = "MUTABLE"
  tags                 = var.research_tags
}

resource "aws_ecr_repository" "scrape" {
  name                 = "scrape"
  image_tag_mutability = "MUTABLE"
  tags                 = var.chambers_tags
}

resource "aws_ecr_repository" "publications" {
  name                 = "publications"
  image_tag_mutability = "MUTABLE"
  tags                 = var.publications_tags
}

resource "aws_ecr_repository" "lawyers" {
  name                 = "lawyers"
  image_tag_mutability = "MUTABLE"
  tags                 = var.lawyers_tags
}

resource "aws_ecr_repository" "pdfs" {
  name                 = "pdfs"
  image_tag_mutability = "MUTABLE"
  tags                 = var.pdfs_tags
}

resource "aws_ecr_repository" "feedback" {
  name                 = "feedback"
  image_tag_mutability = "MUTABLE"
  tags                 = var.feedback_tags
}

resource "aws_ecs_task_definition" "publications" {
  family             = "publications"
  execution_role_arn = aws_iam_role.scrape_chambers.arn
  task_role_arn      = aws_iam_role.scrape_chambers.arn
  requires_compatibilities = [
  "FARGATE"]
  cpu          = 256
  memory       = 512
  network_mode = "awsvpc"

  container_definitions = jsonencode([
    {
      name    = "publications"
      command = ["scrape_publications.py"]
      image   = "${aws_ecr_repository.scrape.repository_url}:latest"
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.publications.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = var.publications_tags
}

resource "aws_ecs_task_definition" "lawyers" {
  family             = "lawyers"
  execution_role_arn = aws_iam_role.scrape_chambers.arn
  task_role_arn      = aws_iam_role.scrape_chambers.arn
  requires_compatibilities = [
  "FARGATE"]
  cpu          = 256
  memory       = 512
  network_mode = "awsvpc"

  container_definitions = jsonencode([
    {
      name    = "lawyers"
      command = ["scrape_lawyers.py"]
      image   = "${aws_ecr_repository.scrape.repository_url}:latest"
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.lawyers.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = var.lawyers_tags
}

resource "aws_ecs_task_definition" "research" {
  family             = "research"
  execution_role_arn = aws_iam_role.scrape_chambers.arn
  task_role_arn      = aws_iam_role.scrape_chambers.arn
  requires_compatibilities = [
  "FARGATE"]
  cpu          = 256
  memory       = 512
  network_mode = "awsvpc"

  container_definitions = jsonencode([
    {
      name    = "research"
      command = ["scrape_research.py"]
      image   = "${aws_ecr_repository.scrape.repository_url}:latest"
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.research.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = var.research_tags
}

resource "aws_ecs_task_definition" "pdfs" {
  family             = "pdfs"
  execution_role_arn = aws_iam_role.scrape_chambers.arn
  task_role_arn      = aws_iam_role.scrape_chambers.arn
  requires_compatibilities = [
  "FARGATE"]
  cpu          = 256
  memory       = 512
  network_mode = "awsvpc"

  container_definitions = jsonencode([
    {
      name    = "pdfs"
      command = ["scrape_pdfs.py"]
      image   = "${aws_ecr_repository.scrape.repository_url}:latest"
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.pdfs.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = var.pdfs_tags
}


resource "aws_ecs_task_definition" "feedback" {
  family             = "feedback"
  execution_role_arn = aws_iam_role.scrape_chambers.arn
  task_role_arn      = aws_iam_role.scrape_chambers.arn
  requires_compatibilities = [
  "FARGATE"]
  cpu          = 256
  memory       = 512
  network_mode = "awsvpc"

  container_definitions = jsonencode([
    {
      name    = "feedback"
      command = ["scrape_feedback.py"]
      image   = "${aws_ecr_repository.scrape.repository_url}:latest"
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = aws_cloudwatch_log_group.feedback.name
          awslogs-region        = var.region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])

  tags = var.feedback_tags
}

