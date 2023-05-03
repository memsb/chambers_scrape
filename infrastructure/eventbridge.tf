resource "aws_cloudwatch_event_rule" "publications" {
  name                = "publications_scan"
  description         = "Check for new Chambers guides and publications"
  schedule_expression = "cron(0 9 ? * * *)"
  tags                = var.publications_tags
}

resource "aws_cloudwatch_event_rule" "research" {
  name                = "research_scan"
  description         = "Scan Chambers research schedules"
  schedule_expression = "cron(0 21 ? * MON-FRI *)"
  tags                = var.research_tags
}

resource "aws_cloudwatch_event_rule" "lawyers" {
  name                = "lawyers_scan"
  description         = "Scan lawyers ranked in each publication"
  schedule_expression = "cron(0 19 ? * * *)"
  tags                = var.lawyers_tags
}

resource "aws_cloudwatch_event_rule" "firms" {
  name                = "firms_scan"
  description         = "Scan firms ranked in each publication"
  schedule_expression = "cron(0 19 ? * * *)"
  tags                = var.firms_tags
}

resource "aws_cloudwatch_event_rule" "pdfs" {
  name                = "pdfs_scan"
  description         = "Scrape guide PDFs"
  schedule_expression = "cron(0 19 ? * * *)"
  tags                = var.pdfs_tags
}

resource "aws_cloudwatch_event_rule" "feedback" {
  name                = "feedback_scan"
  description         = "Scrape guide feedback"
  schedule_expression = "cron(0 19 ? * * *)"
  tags                = var.feedback_tags
}

resource "aws_iam_role" "chambers_ecs_events" {
  name = "chambers_ecs_events"

  assume_role_policy = <<DOC
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "",
      "Effect": "Allow",
      "Principal": {
        "Service": "events.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
DOC
}

resource "aws_iam_role_policy" "run_task_role" {
  name = "ecs_events_run_task_with_any_role"
  role = aws_iam_role.chambers_ecs_events.id

  policy = <<DOC
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": "iam:PassRole",
            "Resource": "*"
        },
        {
            "Effect": "Allow",
            "Action": "ecs:RunTask",
            "Resource": [
              "${replace(aws_ecs_task_definition.feedback.arn, "/:\\d+$/", ":*")}",
              "${replace(aws_ecs_task_definition.publications.arn, "/:\\d+$/", ":*")}",
              "${replace(aws_ecs_task_definition.lawyers.arn, "/:\\d+$/", ":*")}",
              "${replace(aws_ecs_task_definition.firms.arn, "/:\\d+$/", ":*")}",
              "${replace(aws_ecs_task_definition.research.arn, "/:\\d+$/", ":*")}",
              "${replace(aws_ecs_task_definition.pdfs.arn, "/:\\d+$/", ":*")}"
            ]
        }
    ]
}
DOC
}

resource "aws_cloudwatch_event_target" "publications" {
  target_id = "publications"
  rule      = aws_cloudwatch_event_rule.publications.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.publications.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}

resource "aws_cloudwatch_event_target" "research" {
  target_id = "research"
  rule      = aws_cloudwatch_event_rule.research.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.research.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}

resource "aws_cloudwatch_event_target" "lawyers" {
  target_id = "lawyers"
  rule      = aws_cloudwatch_event_rule.lawyers.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.lawyers.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}

resource "aws_cloudwatch_event_target" "firms" {
  target_id = "firms"
  rule      = aws_cloudwatch_event_rule.firms.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.firms.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}

resource "aws_cloudwatch_event_target" "pdfs" {
  target_id = "pdfs"
  rule      = aws_cloudwatch_event_rule.pdfs.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.pdfs.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}

resource "aws_cloudwatch_event_target" "feedback" {
  target_id = "feedback"
  rule      = aws_cloudwatch_event_rule.feedback.name
  arn       = aws_ecs_cluster.scrape_chambers.arn
  role_arn  = aws_iam_role.chambers_ecs_events.arn

  ecs_target {
    group               = "family:chambers"
    task_definition_arn = aws_ecs_task_definition.feedback.arn
    launch_type         = "FARGATE"
    network_configuration {
      assign_public_ip = true
      subnets          = data.aws_subnet.subnets.*.id
      security_groups = [
        aws_security_group.chambers_scan.id
      ]
    }
  }
}
