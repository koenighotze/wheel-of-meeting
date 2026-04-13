resource "google_cloud_run_v2_service" "app" {
  name     = "wheel-of-meeting"
  location = var.region
  project  = var.project_id
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    service_account = var.cloud_run_sa_email
    scaling {
      max_instance_count = 1
    }
    containers {
      image = var.container_image
      ports {
        container_port = 80
      }
      resources {
        limits = {
          memory = "128Mi"
        }
        cpu_idle = true
      }
    }
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image]
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
