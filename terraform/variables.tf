variable "image_tag" {
  description = "Tag de l'image Docker à déployer"
  type        = string
  default     = "latest"
}

variable "container_port" {
  description = "Port exposé par le conteneur"
  type        = number
  default     = 3000
}

variable "host_port" {
  description = "Port sur la machine hôte"
  type        = number
  default     = 3000
}

variable "node_env" {
  description = "Environnement Node.js"
  type        = string
  default     = "production"
}
