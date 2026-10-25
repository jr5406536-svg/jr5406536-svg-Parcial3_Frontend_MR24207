# Frontend del Sistema de Constancias

Aplicación web para solicitar y administrar constancias. Consume la API del
proyecto backend y ofrece interfaces diferentes para administradores y
usuarios.

## Tecnologías

- Vue 3
- Vite
- Vue Router
- Vuetify
- Axios
- Chart.js
- PDF.js

## Funcionalidades

### Administrador

- Crear cuentas de usuario.
- Registrar y administrar constancias.
- Consultar constancias activas e inactivas.
- Enviar constancias por correo.
- Visualizar y descargar reportes PDF y CSV.
- Consultar gráficos mensuales.

### Usuario

- Solicitar nuevas constancias.
- Consultar sus propias solicitudes.
- Revisar el estado y detalle de cada constancia.
- Consultar el código QR correspondiente.

### Autenticación

- Inicio de sesión con correo y contraseña.
- Verificación de códigos TOTP.
- Enrolamiento mediante código QR en una aplicación de autenticación.
- Cambio obligatorio de contraseña temporal.
- Protección de rutas según el rol del usuario.

## Requisitos

- Node.js
- npm
- Backend de constancias ejecutándose en `http://localhost:8081`

## Instalación

1. Clonar el repositorio:

```bash
git clone https://github.com/jr5406536-svg/jr5406536-svg-Parcial3_Frontend_constancias_MR24207.git
cd jr5406536-svg-Parcial3_Frontend_constancias_MR24207
```

2. Instalar las dependencias:

```bash
npm install
```

3. Crear el archivo de configuración.

En Git Bash:

```bash
cp .env.example .env
```

En PowerShell:

```powershell
Copy-Item .env.example .env
```

4. Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Vite mostrará en la terminal la dirección local para abrir la aplicación,
normalmente `http://localhost:5173`.

## Configuración de la API

El archivo `.env` utiliza la siguiente variable:

```env
VITE_API_URL=http://localhost:8081/api
```

Se puede cambiar esta dirección cuando la API se ejecute en otro servidor. Las
variables de Vite incluidas en el frontend son públicas, por lo que no se deben
guardar contraseñas, tokens ni secretos en ellas.

## Usuarios de prueba

Los usuarios son creados por los seeders del backend.

### Administrador

- Correo: `admin@constancias.com`
- Contraseña temporal: `admin123`

### Usuario

- Correo: `usuario@constancias.com`
- Contraseña temporal: `usuario123`

En el primer inicio de sesión se debe escanear el código QR con Google
Authenticator, Microsoft Authenticator u otra aplicación TOTP. Después de
verificar el código de seis dígitos, el sistema solicitará cambiar la contraseña
temporal.

## Scripts disponibles

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Generar la versión de producción:

```bash
npm run build
```

Previsualizar la compilación:

```bash
npm run preview
```

## Proyecto relacionado

La API utilizada por este frontend se encuentra en:

https://github.com/jr5406536-svg/Parcial3_Backend_MR24207
