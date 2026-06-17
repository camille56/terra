terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Configuration provider-agnostic : pointe vers MinIO en local par défaut,
# vers un vrai provider AWS/S3-compatible si s3_endpoint est vide (voir aws.tfvars.example).
provider "aws" {
  access_key                  = var.s3_access_key
  secret_key                  = var.s3_secret_key
  region                      = var.s3_region
  s3_use_path_style           = var.s3_use_path_style
  skip_credentials_validation = var.skip_aws_api_checks
  skip_metadata_api_check     = var.skip_aws_api_checks
  skip_requesting_account_id  = var.skip_aws_api_checks

  endpoints {
    s3 = var.s3_endpoint != "" ? var.s3_endpoint : null
  }
}

# Création du bucket principal
resource "aws_s3_bucket" "main" {
  bucket = var.bucket_main
}

# Création du bucket de backup froid
resource "aws_s3_bucket" "backup" {
  bucket = var.bucket_backup
}
