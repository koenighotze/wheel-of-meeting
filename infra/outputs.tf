output "app_url" {
  value = "https://${google_app_engine_application.app.default_hostname}"
}
