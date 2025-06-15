# ☁️ Nuvora-chat Backend

**¡Bienvenido al backend de Nuvora-chat!**

Este repositorio alberga el servidor y la lógica de la API para la aplicación de chat en tiempo real **Nuvora-chat**. Es el cerebro detrás de la comunicación, la gestión de usuarios y las salas, y el almacenamiento de datos.

Para la interfaz de usuario de este proyecto, visita el repositorio del frontend: [Nuvora-chat Frontend](https://github.com/HazaFG/nuvora-chat).

---

## Características principales

* **API RESTful** para la gestión de usuarios y salas.
* **Comunicación en tiempo real** mediante Socket.IO.
* **Autenticación segura** basada en tokens.
* **Integración con Turso** para una base de datos distribuida y rápida.
* **Manejo de archivos** para imágenes, audio y video.
* **Optimizado para Docker** y despliegue en Render.

---

## Tecnologías utilizadas

Este backend está construido con las siguientes tecnologías clave:

* **Node.js**: Entorno de ejecución de JavaScript.
* **Express.js**: Framework web para Node.js.
* **Socket.IO**: Librería para comunicación bidireccional basada en eventos en tiempo real.
* **Turso**: Base de datos SQLite distribuida y de alto rendimiento.
* **Docker**: Para la contenerización y despliegue.

---

## 🚀 Cómo ejecutar Nuvora-chat Backend

El backend de Nuvora-chat utiliza **Turso** como su base de datos principal. Para que el servidor funcione correctamente, ya sea localmente o en un despliegue, necesitarás configurar las variables de entorno para la conexión a Turso.

### ⚙️ Configuración de Turso

1.  **Crea una base de datos en Turso:** Si aún no tienes una, visita [Turso](https://turso.tech/) y sigue los pasos para crear una nueva base de datos.
2.  **Obtén tus credenciales:** Una vez creada, obtén la `DATABASE_URL` y el `DATABASE_AUTH_TOKEN` de tu base de datos Turso.
3.  **Configura las variables de entorno:**
    * Crea un archivo `.env.local` (o `.env` si es para producción) en la raíz de tu proyecto.
    * Agrega tus credenciales de Turso de la siguiente manera:

    ```
    DATABASE_URL="your_turso_database_url_here"
    DATABASE_AUTH_TOKEN="your_turso_auth_token_here"
    # Otras variables de entorno necesarias, como el puerto del servidor:
    PORT=3001
    ```

---

### 🐳 Ejecutar localmente con Docker

Asegúrate de tener Docker instalado en tu sistema.

1.  **Construye la imagen Docker:**
    ```bash
    docker build -t nuvora-backend .
    ```
2.  **Ejecuta el contenedor Docker:**
    ```bash
    docker run -p 3000:3000 nuvora-backend
    ```
    (Ajusta el puerto `3000` si tu `.env.local` especifica uno diferente).
    El backend estará accesible en `http://localhost:3000`.

---

### 💻 Ejecutar en desarrollo local (sin Docker)

Si prefieres correr el proyecto directamente en tu entorno de desarrollo Node.js:

1.  **Instala las dependencias:**
    ```bash
    npm install
    ```
2.  **Ejecuta el servidor en modo desarrollo:**
    ```bash
    npm start
    ```
    El backend estará escuchando en el puerto configurado (por defecto, `3001`).

---

## ☁️ Despliegue en Render (Docker)

Este proyecto está preparado para desplegarse como un contenedor Docker en [Render](https://render.com).

1.  Conecta tu repositorio de GitHub/GitLab a Render.
2.  Asegúrate de configurar las variables de entorno (`DATABASE_URL`, `DATABASE_AUTH_TOKEN`, `PORT`) en la configuración de tu servicio en Render.
3.  Render construirá y desplegará automáticamente tu contenedor Docker.

---

## 📝 Notas adicionales

* La comunicación entre el frontend y el backend se realiza principalmente a través de la API REST para operaciones como la creación de salas, y mediante **Socket.IO** para el chat en tiempo real y las notificaciones instantáneas.
* Asegúrate de que las credenciales de Turso sean correctas para establecer la conexión con la base de datos.

---
