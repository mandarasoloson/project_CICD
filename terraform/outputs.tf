output "container_name" {
  description = "Nom du conteneur déployé"
  value       = docker_container.techstore_api.name
}

output "container_id" {
  description = "ID du conteneur Docker"
  value       = docker_container.techstore_api.id
}

output "app_url" {
  description = "URL de l'application"
  value       = "http://localhost:${var.host_port}"
}

output "network_name" {
  description = "Nom du réseau Docker"
  value       = docker_network.techstore_network.name
}
