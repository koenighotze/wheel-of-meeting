resource "google_iap_web_type_app_engine_iam_member" "user" {
  project = var.project_id
  app_id  = google_app_engine_application.app.app_id
  role    = "roles/iap.httpsResourceAccessor"
  member  = "user:${var.authorized_user_email}"
}
