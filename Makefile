# Variables para facilitar el mantenimiento
DC=docker-compose

# --- COMANDOS PRINCIPALES ---

# Levanta toda la infraestructura en segundo plano
run:
	$(DC) up --build -d
	@echo "🚀 Frontend disponible en: http://localhost:3001"
	@echo "🔌 API disponible en: http://localhost:3000"
	@echo "📊 Prisma Studio disponible en: http://localhost:5555"

# Detiene los servicios y borra los volúmenes (limpieza total de datos)
stop:
	$(DC) down -v

# --- BASE DE DATOS (Se ejecutan dentro del contenedor de la API) ---

# Sincroniza el esquema de la base de datos
migrate:
	$(DC) exec api npx prisma migrate dev --name init

# Genera el cliente de Prisma para TypeScript
generate:
	$(DC) exec api npx prisma generate

# Carga los datos iniciales (Seed)
seed:
	$(DC) exec api npx prisma db seed

# --- UTILIDADES ---

# Ver logs de todos los servicios
logs:
	$(DC) logs -f

# Acceder a la terminal de la API
shell:
	$(DC) exec api sh

# --- DESPLIEGUE (KUBERNETES) ---

# Comando para validar los manifiestos de K8s antes de entregar
deploy-check:
	@echo "📦 Validando manifiestos de Kubernetes..."
	@if [ -d "./k8s" ]; then \
		kubectl apply --dry-run=client -f ./k8s/; \
	else \
		echo "⚠️  Error: La carpeta /k8s no existe aún."; \
	fi