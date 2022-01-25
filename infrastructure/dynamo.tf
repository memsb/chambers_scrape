resource "aws_dynamodb_table" "research" {
  name         = "chambers_research"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  tags = var.research_tags
}

resource "aws_dynamodb_table" "guides" {
  name         = "chambers_guides"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "publicationTypeId"

  attribute {
    name = "publicationTypeId"
    type = "N"
  }

  tags = var.publications_tags
}

resource "aws_dynamodb_table" "pdfs" {
  name         = "chambers_pdfs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  tags = var.pdfs_tags
}

resource "aws_dynamodb_table" "publication_research" {
  name         = "chambers_publication_research"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "guideYear"

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "guideYear"
    type = "N"
  }

  tags = var.research_tags
}

resource "aws_dynamodb_table" "publications" {
  name         = "chambers_publications"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "N"
  }

  tags = var.publications_tags
}

resource "aws_dynamodb_table" "subscriptions" {
  name         = "research_subscriptions"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "guide_id"

  attribute {
    name = "guide_id"
    type = "N"
  }

  tags = var.research_tags
}
