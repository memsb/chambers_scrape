resource "aws_iam_role" "scrape_chambers" {
  name = "scrape_chambers_role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      },
    ]
  })

  tags = var.chambers_tags
}

resource "aws_iam_role_policy" "dynamo" {
  name = "chambers-research-dynamo-policy"
  role = aws_iam_role.scrape_chambers.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Action": [
              "dynamodb:*",
              "dax:*",
              "application-autoscaling:DeleteScalingPolicy",
              "application-autoscaling:DeregisterScalableTarget",
              "application-autoscaling:DescribeScalableTargets",
              "application-autoscaling:DescribeScalingActivities",
              "application-autoscaling:DescribeScalingPolicies",
              "application-autoscaling:PutScalingPolicy",
              "application-autoscaling:RegisterScalableTarget",
              "cloudwatch:DeleteAlarms",
              "cloudwatch:DescribeAlarmHistory",
              "cloudwatch:DescribeAlarms",
              "cloudwatch:DescribeAlarmsForMetric",
              "cloudwatch:GetMetricStatistics",
              "cloudwatch:ListMetrics",
              "cloudwatch:PutMetricAlarm",
              "cloudwatch:GetMetricData",
              "iam:GetRole",
              "iam:ListRoles",
              "resource-groups:ListGroups",
              "resource-groups:ListGroupResources",
              "resource-groups:GetGroup",
              "resource-groups:GetGroupQuery",
              "resource-groups:DeleteGroup",
              "resource-groups:CreateGroup",
              "tag:GetResources"
          ],
          "Effect": "Allow",
          "Resource": "*"
      },
      {
          "Action": "cloudwatch:GetInsightRuleReport",
          "Effect": "Allow",
          "Resource": "arn:aws:cloudwatch:*:*:insight-rule/DynamoDBContributorInsights*"
      },
      {
          "Action": [
              "iam:PassRole"
          ],
          "Effect": "Allow",
          "Resource": "*",
          "Condition": {
              "StringLike": {
                  "iam:PassedToService": [
                      "application-autoscaling.amazonaws.com",
                      "application-autoscaling.amazonaws.com.cn",
                      "dax.amazonaws.com"
                  ]
              }
          }
      },
      {
          "Effect": "Allow",
          "Action": [
              "iam:CreateServiceLinkedRole"
          ],
          "Resource": "*",
          "Condition": {
              "StringEquals": {
                  "iam:AWSServiceName": [
                      "replication.dynamodb.amazonaws.com",
                      "dax.amazonaws.com",
                      "dynamodb.application-autoscaling.amazonaws.com",
                      "contributorinsights.dynamodb.amazonaws.com",
                      "kinesisreplication.dynamodb.amazonaws.com"
                  ]
              }
          }
      }
  ]
}
EOF
}

resource "aws_iam_role_policy" "ses" {
  name = "chambers-ses-policy"
  role = aws_iam_role.scrape_chambers.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "ses:SendEmail",
                "ses:SendTemplatedEmail",
                "ses:SendRawEmail"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "s3" {
  name = "chambers-research-s3-policy"
  role = aws_iam_role.scrape_chambers.id

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "VisualEditor0",
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:ListBucketVersions",
                "s3:ListBucket",
                "s3:GetObjectVersion"
            ],
            "Resource": [
                "arn:aws:s3:::lcmillsconsulting.com/*",
                "arn:aws:s3:::lcmillsconsulting.com"
            ]
        }
    ]
}
EOF
}

resource "aws_iam_role_policy" "ecs" {
  name = "chambers-research-ecs-policy"
  role = aws_iam_role.scrape_chambers.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
      {
          "Effect": "Allow",
          "Action": [
              "ecr:GetAuthorizationToken",
              "ecr:BatchCheckLayerAvailability",
              "ecr:GetDownloadUrlForLayer",
              "ecr:BatchGetImage",
              "logs:CreateLogStream",
              "logs:PutLogEvents"
          ],
          "Resource": "*"
      }
  ]
}
EOF
}
