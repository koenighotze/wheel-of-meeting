variable "project_id" {
  description = "GCP project ID"
  type        = string
}

variable "region" {
  description = "GCP region"
  type        = string
  default     = "europe-west3"
}

variable "authorized_user_email" {
  description = "Google account email that is allowed to access the app"
  type        = string
}

variable "container_image" {
  description = "Platform AR image URI, e.g. europe-west3-docker.pkg.dev/platform-POSTFIX/docker-POSTFIX/wheel-of-meeting:latest"
  type        = string
}

variable "cloud_run_sa_email" {
  description = "Email of the Cloud Run runtime service account (wheel-of-meeting-run-sa)"
  type        = string
}
