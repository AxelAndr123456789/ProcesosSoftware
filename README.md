# ProcesosSoftware

Aplicación web full-stack para la gestión y seguimiento de procesos de software, con un frontend moderno desarrollado en TypeScript y un backend en Python.

## 🗂 Estructura del proyecto

```
ProcesosSoftware/
├── frontend/   # Interfaz de usuario (TypeScript, HTML, CSS)
└── backend/    # API y lógica del servidor (Python)
```

## 🛠 Tecnologías

| Capa      | Tecnología              |
|-----------|-------------------------|
| Frontend  | TypeScript, HTML, CSS   |
| Backend   | Python                  |

## 🚀 Instalación y ejecución

### Requisitos previos

- Node.js (v18 o superior)
- Python 3.10 o superior
- npm o yarn

### Backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📁 Variables de entorno

Crea un archivo `.env` en cada carpeta según sea necesario.

Backend:

```env
PORT=8000
DATABASE_URL=your_database_url
```

Frontend:

```env
VITE_API_URL=http://localhost:8000
```

## 🤝 Contribuciones

1. Haz un fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Haz commit de tus cambios (`git commit -m 'feat: agrega nueva funcionalidad'`)
4. Haz push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.
