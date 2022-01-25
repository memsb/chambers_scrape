resource "aws_cloudwatch_log_group" "scrape" {
  name              = "/ecs/chambers_scrape"
  retention_in_days = 30

  tags = var.research_tags
}
resource "aws_cloudwatch_log_group" "research" {
  name              = "/ecs/chambers_research"
  retention_in_days = 30

  tags = var.research_tags
}

resource "aws_cloudwatch_log_group" "lawyers" {
  name              = "/ecs/chambers_lawyers"
  retention_in_days = 30

  tags = var.lawyers_tags
}

resource "aws_cloudwatch_log_group" "publications" {
  name              = "/ecs/chambers_publications"
  retention_in_days = 30

  tags = var.publications_tags
}

resource "aws_cloudwatch_log_group" "pdfs" {
  name              = "/ecs/chambers_pdfs"
  retention_in_days = 30

  tags = var.pdfs_tags
}

resource "aws_cloudwatch_log_group" "feedback" {
  name              = "/ecs/chambers_feedback"
  retention_in_days = 30

  tags = var.feedback_tags
}
