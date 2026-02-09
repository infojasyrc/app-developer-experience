output "key_arn" {
  value = aws_kms_key.logs.arn
}

output "key_id" {
  value = aws_kms_key.logs.id
}