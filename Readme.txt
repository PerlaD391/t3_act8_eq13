
==============================
Actividad 8: Consumo de APIs
==============================

**Materia:** Programación Web
**Integrantes:**
- Gallardo Vasquez Perla Danae
- Lemus Sánchez Ricardo
Equipo: 13

##  Descripción del Proyecto
Sistema de gestión de cosméticos construido con React y Vite. Consiste en un login funcional conectado a una API real y un catálogo CRUD interactivo con filtros
y paginación reflejada en la URL, todo con un diseño moderno en modo oscuro (Dark Mode).

##  Enlace del Proyecto Desplegado
El sistema está funcionando en vivo en el VPS de Contabo:

**[http://13.140.226.55/t3_act8_eq13/](http://13.140.226.55/t3_act8_eq13/)**

##  Credenciales de Prueba
- **Usuario:** `emilys`
- **Contraseña:** `emilyspass`

##  APIs Utilizadas
1. **Autenticación:** `https://dummyjson.com/auth/login` (DummyJSON) para validar las credenciales del usuario y obtener su foto de perfil y nombre.
2. **Datos (Tabla CRUD):** `https://dummyjson.com/products` (DummyJSON) para mostrar el catálogo de maquillaje, permitiendo búsquedas, filtros por categoría,
paginación, y las acciones de Agregar, Editar y Eliminar.

##  Tecnologías y Buenas Prácticas
- **React + Vite** para el frontend.
- **React Router DOM** para la navegación y protección de rutas.
- **Tailwind CSS** para los estilos visuales.
- Separación de responsabilidades en carpetas: `/components`, `/pages`, `/services`.
- Llamadas a la API centralizadas en `src/services/api.js`.
- Manejo de errores visible para el usuario y validación de campos en el Login.