output "main_bucket_name" {
  value = aws_s3_bucket.main.bucket
}

output "backup_bucket_name" {
  value = aws_s3_bucket.backup.bucket
}

output "s3_endpoint" {
  value = var.s3_endpoint
}

output "s3_region" {
  value = var.s3_region
}
