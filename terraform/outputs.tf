output "dynamodb_table_arn" {
  value = aws_dynamodb_table.users_profile_table.arn
}

output "user_profile_created_topic_arn" {
  value = aws_sns_topic.user_profile_created_topic.arn
}
