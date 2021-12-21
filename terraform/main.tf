terraform {
  backend "s3" {}

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
  bucket        = "${var.environment}-${var.bucket_name}"
  acl           = "public-read"
  force_destroy = var.environment != "prod" ? true : false
}

resource "aws_dynamodb_table" "users_profile_table" {
  name         = "${var.environment}-${var.table_name}"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "id"

  attribute {
    name = "id"
    type = "S"
  }
}

resource "aws_sns_topic" "user_profile_created_topic" {
  name         = "${var.environment}-user-profile-created"
  display_name = "Topic used to publish when user profile is created"
}

resource "aws_sqs_queue" "user_profile_created_queue_dlq" {
  name                      = "${var.environment}-user-profile-created-queue-dlq"
  message_retention_seconds = 1209600
}

resource "aws_sqs_queue" "user_profile_created_queue" {
  name                       = "${var.environment}-user-profile-created-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 1209600

  redrive_policy = jsonencode({
    maxReceiveCount     = 5
    deadLetterTargetArn = aws_sqs_queue.user_profile_created_queue_dlq.arn
  })
}

resource "aws_sqs_queue_policy" "user_profile_created_queue_policy" {
  queue_url = aws_sqs_queue.user_profile_created_queue.id

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "sqspolicy",
  "Statement": [
    {
      "Sid": "First",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "sqs:SendMessage",
      "Resource": "${aws_sqs_queue.user_profile_created_queue.arn}",
      "Condition": {
        "ArnEquals": {
          "aws:SourceArn": "${aws_sns_topic.user_profile_created_topic.arn}"
        }
      }
    }
  ]
}
POLICY
}

resource "aws_sns_topic_subscription" "user_profile_created_subscription" {
  protocol             = "sqs"
  raw_message_delivery = true
  topic_arn            = aws_sns_topic.user_profile_created_topic.arn
  endpoint             = aws_sqs_queue.user_profile_created_queue.arn
}
