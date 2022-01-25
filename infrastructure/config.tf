terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "3.63.0"
    }
  }
}

variable "region" {
  default = "eu-west-1"
}


provider "aws" {
  profile = "default"
  region  = var.region
}

data "aws_caller_identity" "current" {}
