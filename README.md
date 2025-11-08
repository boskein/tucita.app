# Tucitas.app MVP Frontend

Sistema de gestión de reservas y citas para negocios. MVP frontend construido con Astro 4+, React, TypeScript, Tailwind CSS y shadcn/ui.

## 🚀 Características

- **Gestión de Negocios**: Registro y configuración de negocios multi-tenant
- **Servicios**: Crear y gestionar servicios con duración y precios
- **Personal**: Administrar empleados y asignar servicios
- **Horarios**: Configurar horarios semanales y excepciones
- **Reservas**: Sistema completo de reservas con validación de disponibilidad
- **Página Pública**: Interfaz para que los clientes reserven citas

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn

## 🛠️ Instalación

1. Clona el repositorio
2. Instala las dependencias:

```bash
npm install
```

## 🏃 Desarrollo

Inicia el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 📁 Estructura del Proyecto

```
/src
  /components
    /ui          # Componentes shadcn/ui
    *.tsx        # Componentes React personalizados
  /layouts       # Layouts Astro
  /lib
    /mock        # Servicios mock (almacenamiento en memoria)
    *.ts         # Utilidades, tipos, validadores
  /pages         # Páginas Astro (routing)
    /[t]/[slug]  # Rutas dinámicas por tenant
```

## 🗂️ Arquitectura

### Mock Services

El proyecto utiliza servicios mock con almacenamiento en memoria para desarrollo. Los datos se almacenan en `src/lib/mock/store.ts` usando Maps.

### Rutas Principales

- `/` - Página de inicio
- `/register` - Registro de nuevo negocio
- `/{t}/{slug}/onboarding` - Configuración inicial
- `/{t}/{slug}/app/*` - Dashboard del negocio
  - `/app` - Resumen
  - `/app/services` - Gestión de servicios
  - `/app/staff` - Gestión de personal
  - `/app/schedule` - Gestión de horarios
  - `/app/bookings` - Gestión de reservas
  - `/app/settings` - Configuración
- `/{t}/{slug}/booking` - Página pública de reservas

### Datos de Demostración

Al iniciar la aplicación, se crea automáticamente un tenant de demostración:
- **Nombre**: Barbería Elite
- **Slug**: `barberia-elite`
- **Servicio**: Corte de cabello (30 min, $25)
- **Horarios**: Lunes-Viernes 10:00-14:00 y 16:00-20:00

Para acceder en desarrollo:
1. Ve a `/register` y crea un nuevo negocio, o
2. Usa el tenant de demo: `/t/barberia-elite/app`

## 🧩 Tecnologías

- **Astro 4+**: Framework web
- **React 19**: Librería UI
- **TypeScript**: Tipado estático
- **Tailwind CSS 4**: Estilos
- **shadcn/ui**: Componentes UI
- **react-hook-form + Zod**: Formularios y validación
- **date-fns**: Manipulación de fechas
- **sonner**: Notificaciones toast

## 📝 Desarrollo

### Cambiar el Slug del Tenant en Desarrollo

1. Edita `src/lib/mock/mockTenant.ts` para cambiar el slug generado
2. O modifica directamente en `src/lib/mock/store.ts` después de crear un tenant
3. Los datos se resetean al recargar la página (almacenamiento en memoria)

### Agregar Nuevos Componentes shadcn/ui

```bash
npx shadcn@latest add [component-name]
```

### Estructura de Datos

- **Tenants**: Almacenados por slug
- **Users**: Vinculados a tenants
- **Employees**: Vinculados a tenants
- **Services**: Vinculados a tenants, pueden tener employeeIds específicos
- **Schedules**: Por tenant y employeeId (null = negocio general)
- **Bookings**: Vinculados a tenant, service, employee

## 🏗️ Build

Para crear una build de producción:

```bash
npm run build
```

Los archivos se generarán en `dist/`

## 🧪 Pruebas

Para probar el flujo completo:

1. **Registro**: Ve a `/register` y crea un negocio
2. **Onboarding**: Completa los 3 pasos (servicios, personal, horarios)
3. **Dashboard**: Explora las diferentes secciones
4. **Reserva Pública**: Ve a `/{slug}/booking` y crea una reserva
5. **Gestión**: Ve a `/app/bookings` para ver y gestionar reservas

## 📚 Próximos Pasos

- [ ] Integración con backend real
- [ ] Autenticación y autorización
- [ ] Persistencia de datos (base de datos)
- [ ] Notificaciones por email
- [ ] Calendario visual mejorado
- [ ] Reportes y estadísticas
- [ ] Multi-idioma completo
- [ ] PWA (Progressive Web App)

## 📄 Licencia

Este proyecto es parte del MVP de Tucitas.app
