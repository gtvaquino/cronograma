# Supervisor Scheduler Logic (React + Tailwind)

Aplicación web para la generación y optimización de cronogramas de supervisores de perforación, desarrollada como parte de la prueba técnica.

![Supervisor Scheduler Dashboard](https://raw.githubusercontent.com/gtvaquino/cronograma/main/dashboard-preview.png)

## 🚀 Características

- **Algoritmo Inteligente**: Simulación día a día que ajusta dinámicamente los turnos de los supervisores (S2 y S3) para maximizar el cumplimiento de la regla de *2 supervisores en perforación*.
- **Configuración Flexible**:
  - Selector de Regímenes de Prueba (Casos 1-4).
  - Configuración manual de parámetros NxM (Días Trabajo / Días Descanso).
  - Ajuste de días de inducción.
- **Visualización Interactiva**:
  - Tabla de cronograma con código de colores (S, I, P, B, D).
  - Fila de estadísticas en tiempo real (#P).
  - Alertas interactivas: Click para navegar a los días con déficit o conflicto.
- **Exportación**: Descarga del cronograma generado en formato CSV.
- **Diseño Premium**: Interfaz moderna creada con React y Tailwind CSS (v4), totalmente responsiva y en modo oscuro.

## 🛠️ Tecnologías

- **React 18**: Librería de UI.
- **Vite**: Build tool y entorno de desarrollo.
- **Tailwind CSS v4**: Framework de estilos de última generación.
- **Lucide React**: Iconografía.
- **Papaparse**: Generación de CSV.

## 📋 Requisitos Previos

- Node.js (v18 o superior recomendado)
- npm o yarn

## 🔧 Instalación y Ejecución

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/gtvaquino/cronograma.git
    cd cronograma
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Ejecutar en desarrollo**:
    ```bash
    npm run dev
    ```
    La aplicación estará disponible en `http://localhost:5173`.

4.  **Compilar para producción**:
    ```bash
    npm run build
    ```
    Los archivos generados estarán en la carpeta `dist`.

## 🧠 Lógica del Algoritmo

El sistema utiliza una **estrategia de agentes reactivos** en lugar de un desfase estático simple:

1.  **S1 (Ancla)**: Genera su ciclo de forma fija según el régimen NxM.
2.  **S2 y S3 (Agentes)**:
    - Monitorean la cantidad de supervisores en estado 'P' para los próximos días.
    - Si detectan un déficit futuro (< 2 supervisores), pueden **interrumpir su descanso (D)** anticipadamente para iniciar la subida (S).
    - Si detectan un exceso (> 2 supervisores), ajustan su salida a Bajada (B) para evitar violar las reglas de seguridad.
3.  **Validación**: El sistema reporta visualmente cualquier día donde no se logre el objetivo matemático (debido a limitaciones físicas de la cantidad de personal vs días de inducción).

## 📄 Licencia

Este proyecto es una prueba técnica y se distribuye tal cual para fines de evaluación.
