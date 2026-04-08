resource "google_cloud_run_v2_service" "app" {
  name     = "wheel-of-meeting"
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.cloud_run_sa_email
    containers {
      image = var.container_image
    }
  }

}

# Only the authorized user may invoke the service
resource "google_cloud_run_v2_service_iam_member" "invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "user:${var.authorized_user_email}"
}
