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

resource "aws_s3_bucket" "bucket" {
  bucket = "${var.environment}-${var.bucket_name}"
  acl    = "public-read"
}
