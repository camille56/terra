variable "s3_access_key" {
  description = "Clé d'accès pour l'endpoint S3 (MinIO en local, IAM access key sur un vrai provider)."
  type        = string
  default     = "minioadmin"
}

variable "s3_secret_key" {
  description = "Clé secrète pour l'endpoint S3."
  type        = string
  default     = "minioadmin_password"
  sensitive   = true
}

variable "s3_region" {
  description = "Région à déclarer au provider AWS. Sans effet réel sur MinIO mais obligatoire pour le provider."
  type        = string
  default     = "us-east-1"
}

variable "s3_endpoint" {
  description = "URL de l'endpoint S3 compatible (MinIO local). Laisser vide ('') pour utiliser l'endpoint AWS par défaut."
  type        = string
  default     = "http://localhost:9000"
}

variable "s3_use_path_style" {
  description = "Style d'accès aux buckets (path-style, requis par MinIO ; virtual-hosted-style sur AWS)."
  type        = bool
  default     = true
}

variable "skip_aws_api_checks" {
  description = "Désactive les vérifications IAM/metadata (credentials, account id) inutilisables face à un émulateur S3 local comme MinIO. À mettre à false pour un vrai provider AWS."
  type        = bool
  default     = true
}

variable "bucket_main" {
  description = "Nom du bucket principal (stockage actif où l'app écrit les uploads)."
  type        = string
  default     = "app-data-main"
}

variable "bucket_backup" {
  description = "Nom du bucket froid (réplique de sauvegarde)."
  type        = string
  default     = "app-data-backup"
}
