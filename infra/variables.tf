variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "App Engine region (cannot be changed after creation)"
  type        = string
  default     = "europe-west3"
}

variable "authorized_user_email" {
  description = "Google account email that is allowed to access the app"
  type        = string
}
