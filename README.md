# Clarity 🎯

**Clarity** es una aplicación web todo en uno diseñada para organizar tu vida, registrar lo que te inspira y mantener el enfoque mental. Centraliza tu productividad diaria y tu consumo cultural en un solo lugar limpio y minimalista.

¡Organiza tus tareas, colecciona lo que te apasiona y mide tu progreso!

## Características Principales

*   **Gestión de Tareas Eficiente:** Crea, organiza y completa tus pendientes diarios para liberar espacio de trabajo en tu mente.
*   **Biblioteca Cultural (Colecciones):** Registra y categoriza el contenido que consumes. Añade películas, series, libros, música, videojuegos y podcasts en listas personalizadas.
*   **Panel de Estadísticas Integrado:** Gráficos y métricas en tiempo real que te muestran visualmente cómo vas con el progreso de tus tareas y hábitos.
*   **Exportar y Compartir:** Comparte tus listas de tareas o tus colecciones culturales favoritas con amigos o colegas en un solo clic.

### Tecnologías Utilizadas

Este proyecto fue desarrollado utilizando el stack moderno de desarrollo web:
*   **Frontend:** React.js, HTML5, CSS3, JavaScript / Bootstrap
*   **Backend:** Node.js / Express 
*   **Base de Datos:** MySQL y Apache
*   **Control de Versiones:** Git y GitHub

### Vista Previa

**Login**
<img src="../mylist/imagenes/login.png" alt="Login de Clarity" width="80%">

**Barra de tareas**
<img src="../mylist/imagenes/barra de tareas.png" alt="Tareas de Clarity" width="80%">

**Barra de colecciones**
<img src="../mylist/imagenes/barra de colecciones.png" alt="Colecciones de Clarity" width="80%">

**Barra de estadisticas**
<img src="../mylist/imagenes/barra de estadisticas.png" alt="Estadisticas de Clarity" width="80%">

**Barra de exportación**
<img src="../mylist/imagenes/barra de exportacion.png" alt="Login de Clarity" width="80%">


### Estructura del Proyecto

Para mantener el código limpio y escalable, el proyecto está estructurado de la siguiente manera:

mylist/
├── backend/
│   ├── node_modules/
│   ├── src
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── itemsController.js
│   │   │   └── todosController.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── routes/
│   │      ├── auth.js
│   │      ├── items.js
│   │      └── todos.js
│   ├──.env
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
├── imagenes/
├── node_modules
├── public
│   ├── favicon
│   │   └── favicon.png
│   └── index.html
├── src
│   ├── api
│   │   └── axios.js
│   ├── components
│   │   ├── Authpage.jsx
│   │   ├── CollectionsView.jsx
│   │   ├── ExportPDF.jsx
│   │   ├── ItemModal.jsx
│   │   ├── SearchAPI.jsx
│   │   ├── ShareModal.jsx
│   │   ├── StatsPanel.jsx
│   │   └── TodoView.jsx
│   ├── context
│   │   └── AuthContext.jsx
│   ├── hooks
│   │   ├── useAPI.js
│   │   └── useSearch.js
│   ├── App.css
│   ├── App.js
│   ├── index.css
│   ├── index.js
│   └── useLocalStorage.js
├── .gitignore
├── package-lock.json
├── package.json
└── README.md


### Instalación y Configuración Local

Si quieres clonar este proyecto y ejecutarlo en tu máquina local, sigue estos pasos:
Prerrequisitos: Necesitas tener instalado Node.js en tu equipo.

**Paso 1: Clonar el repositorio**
git `clone` [https://github.com/TU_USUARIO/clarity.git](https://github.com/TU_USUARIO/clarity.git)
`cd` clarity

**Paso 2: Levantar el Servidor (Backend)**
cd backend
`npm install`
`npm start`

**Paso 3: Levantar la Aplicación (Frontend)**
(En una nueva ventana de la terminal)
cd frontend
`npm install`
`npm run dev` (o npm start si usas Create React App)

### Autor
Desarrollado por **[ Nerina Bonnnin]**
*   **GitHub:** [@NerinaBonnin](https://github.com/NerinaBonnin)
*   **LinkedIn:** [Nerina Bonnin](www.linkedin.com/in/nerina-bonnin-ba8879252)


### Licencia
Este proyecto está bajo la Licencia **MIT**. Siéntete libre de usar, modificar y aprender de este código.


# Hecho con amor para personas que quieren organizarse






