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
  description = "Bootstrap image used only on first apply. Subsequent image updates are handled by deploy.sh via gcloud run deploy."
  type        = string
  default     = "nginx:alpine"
}

variable "cloud_run_sa_email" {
  description = "Email of the Cloud Run runtime service account (wheel-of-meeting-run-sa)"
  type        = string
}
