terraform {
  required_version = ">= 1.0"

  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {
  # Se connecte au daemon Docker local
  # Sur Linux/Mac : unix:///var/run/docker.sock
  # Sur Windows   : npipe:////./pipe/docker_engine
}

# ── Réseau dédié ─────────────────────────────────────
resource "docker_network" "techstore_network" {
  name = "techstore-network"
}

# ── Image depuis GHCR ────────────────────────────────
resource "docker_image" "techstore_api" {
  name         = "ghcr.io/mandarasoloson/project_cicd:${var.image_tag}"
  keep_locally = true
}

# ── Conteneur de l'application ───────────────────────
resource "docker_container" "techstore_api" {
  name  = "techstore-api"
  image = docker_image.techstore_api.image_id

  restart = "unless-stopped"

  ports {
    internal = var.container_port
    external = var.host_port
  }

  networks_advanced {
    name = docker_network.techstore_network.name
  }

  env = [
    "NODE_ENV=${var.node_env}",
    "PORT=${var.container_port}",
  ]

  healthcheck {
    test         = ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:${var.container_port}/health"]
    interval     = "30s"
    timeout      = "3s"
    start_period = "5s"
    retries      = 3
  }
}
