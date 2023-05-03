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

resource "aws_dynamodb_table" "firms" {
  name         = "firms"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "guide"

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "guide"
    type = "N"
  }

  attribute {
    name = "name"
    type = "S"
  }

  global_secondary_index {
    name               = "name-guide-index"
    hash_key           = "name"
    range_key          = "guide"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "guide-name-index"
    hash_key           = "guide"
    range_key          = "name"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "lawyers" {
  name         = "lawyers"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "guide"

  global_secondary_index {
    name               = "guide-name-index"
    hash_key           = "guide"
    range_key          = "name"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "name-firm-index"
    hash_key           = "name"
    range_key          = "firm"
    projection_type    = "ALL"
  }

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "guide"
    type = "N"
  }

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "firm"
    type = "S"
  }
}

resource "aws_dynamodb_table" "locations" {
  name         = "new_locations"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "description"

  global_secondary_index {
    name               = "description-index"
    hash_key           = "description"
    projection_type    = "ALL"
  }

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "description"
    type = "S"
  }
}

resource "aws_dynamodb_table" "practices" {
  name         = "practices"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"
  range_key    = "description"

  global_secondary_index {
    name               = "description-index"
    hash_key           = "description"
    projection_type    = "ALL"
  }

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "description"
    type = "S"
  }
}

resource "aws_dynamodb_table" "subsections" {
  name         = "subsections"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  global_secondary_index {
    name               = "locationId-practiceAreaId-index"
    hash_key           = "locationId"
    range_key          = "practiceAreaId"
    projection_type    = "ALL"
  }

  attribute {
    name = "id"
    type = "N"
  }

  attribute {
    name = "locationId"
    type = "N"
  }

  attribute {
    name = "practiceAreaId"
    type = "N"
  }
}
