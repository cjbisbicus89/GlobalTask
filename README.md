🚀 GlobalTask Credito – 

Este repositorio contiene una solución para la gestión de solicitudes de crédito multi-país, diseñada para manejar alta concurrencia, grandes volúmenes de datos y procesos asíncronos distribuidos.

🛠️ Stack Tecnológico 

Categoría	Tecnología	Razón Técnica
Framework Base	Next.js Unifica Frontend y API en un solo despliegue, facilitando la gestión de rutas y seguridad.
Lenguaje	TypeScript	Garantiza la integridad de los datos en transacciones financieras y validaciones de PII.
Base de Datos	PostgreSQL 	Soporta JSONB para datos variables de bancos y funciones nativas/disparadores solicitados.
ORM	Prisma	Proporciona un esquema tipado, manejo de migraciones profesional y abstracción de la base de datos.
Gestión de Colas	BullMQ	Solución robusta en Node.js para procesamiento asíncrono persistente y distribuido.
Caché	Redis	Almacenamiento en memoria para resultados de riesgo y catálogos, optimizando el rendimiento.
Tiempo Real	Socket.io	Comunicación bidireccional para actualizar la interfaz ante cambios de estado.
Seguridad	JWT / Bcrypt	Manejo seguro de PII y autenticación robusta evitando exponer datos sensibles.

🚀 Instalación y Ejecución (Quick Start)

Para levantar el ecosistema completo (API, Worker, DB, Redis, Frontend) desde cero:

1. Levantar contenedores (Docker)
make run

2. Inicializar esquema de base de datos e índices
make migrate

 3. Cargar datos maestros (Países y Estados del 1 al 8)
make seed



🌐 Puertos y Acceso Local

Frontend: http://localhost:3001

API: http://localhost:3000

Prisma Studio: http://localhost:5555
 (Auditoría de DB en tiempo real)

Redis: Puerto 6379


🔄 Flujo de Estados por País

El sistema implementa una máquina de estados determinística para los países configurados:

ES, PT, IT, MX, CO, BR

ID	Nombre de Usuario	Descripción del Proceso
1	Solicitud Recibida	Hemos recibido tus datos y estamos iniciando el proceso.
2	Validación de Identidad	Estamos confirmando la validez de tu documento oficial.
3	Analizando Perfil Financiero	Conectando con tu banco para agilizar la aprobación.
4	En Revisión de Crédito	Nuestro sistema está evaluando las mejores condiciones para ti.
5	Pendiente Aprobación	Estamos verificando un último detalle con un aliado externo.
7	Crédito Aprobado	¡Felicidades! Tu crédito ha sido aprobado con éxito.
8	No Aprobado	Lo sentimos, en este momento no podemos procesar tu solicitud.


📈 Análisis de Escalabilidad (High Volume)

1️⃣ Estrategia de Base de Datos

Particionamiento:
Implementación de particionamiento declarativo en PostgreSQL basado en country_id o created_at para mantener el rendimiento ante millones de registros.

Índices Recomendados:

idx_credit_request_user_id → B-Tree para consultas rápidas por cliente.

idx_request_status_composite → Índice compuesto sobre (status, country_id) para reportes operativos.


2️⃣ Gestión de Colas y Concurrencia

Estrategia de Colas:
Se utiliza BullMQ (Redis) para desacoplar el motor de riesgo.

La API produce un Job al llegar a estados críticos.

El Worker lo consume asíncronamente.

Se evita bloquear la navegación del usuario.

Se previenen cuellos de botella bajo alta concurrencia.

Caché e Invalidación:

Estrategia Write-through para catálogos.

Invalidación mediante eventos de cambio de estado.

Limpieza selectiva de claves en Redis para asegurar consistencia.


🛡️ Seguridad y Notas de Entrega
🔐 Manejo de PII

Capas de abstracción para evitar exposición innecesaria.

Cifrado de datos sensibles.

Protección contra filtrado en logs y respuestas API.

Autenticación robusta basada en JWT.

Hash seguro de contraseñas con Bcrypt.


🏗️ Arquitectura

Implementa principios de Clean Architecture.

Separación clara entre dominio, infraestructura y aplicación.

Preparado para despliegue en Kubernetes.

Manifiestos incluidos en /k8s.


🌎 Multi-País

Validaciones específicas por región.

Adaptación a normativas locales.

Configuración extensible para nuevos países.


📌 Objetivo del Proyecto


Construir un motor de flujo de crédito:

Escalable

Seguro

Multi-región

Preparado para millones de transacciones

Resiliente ante fallos distribuidos
