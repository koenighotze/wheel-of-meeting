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

    volumes {
      name = "partners-data"
      secret {
        secret = google_secret_manager_secret.partners.secret_id
        items {
          version = "latest"
          path    = "partners.json"
        }
      }
    }

    volumes {
      name = "leads-data"
      secret {
        secret = google_secret_manager_secret.leads.secret_id
        items {
          version = "latest"
          path    = "lead-developers.json"
        }
      }
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
      volume_mounts {
        name       = "partners-data"
        mount_path = "/run/secrets/partners"
      }
      volume_mounts {
        name       = "leads-data"
        mount_path = "/run/secrets/leads"
      }
    }
  }

  lifecycle {
    ignore_changes = [template[0].containers[0].image]
  }

  # Ensure the runtime SA has secretAccessor on both secrets before Cloud Run
  # tries to resolve versions/latest. Without this, Terraform may update the
  # service in parallel with creating the IAM bindings, causing a "not found"
  # error from Cloud Run even when the secret versions exist.
  depends_on = [
    google_secret_manager_secret_iam_member.runtime_reads_partners,
    google_secret_manager_secret_iam_member.runtime_reads_leads,
  ]

}

# Only the authorized user may invoke the service
resource "google_cloud_run_v2_service_iam_member" "invoker" {
  project  = var.project_id
  location = var.region
  name     = google_cloud_run_v2_service.app.name
  role     = "roles/run.invoker"
  member   = "user:${var.authorized_user_email}"
}
