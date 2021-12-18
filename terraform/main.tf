terraform {
  backend "s3" {
    bucket = "mvc-terraform-state"
    key    = "sls-user-profile/terraform.tfstate"
    region = "us-east-1"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~>3.0"
    }
  }
}

provider "aws" {
  profile = "default"
  region  = var.region
}

resource "aws_s3_bucket" "user_profile_bucket" {
  bucket = "${var.environment}-${var.bucket_name}"
  acl    = "public-read"
}

resource "aws_dynamodb_table" "users_profile_table" {
  name         = "${var.environment}-${var.table_name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "email"

  attribute {
    name = "email"
    type = "S"
  }
}
