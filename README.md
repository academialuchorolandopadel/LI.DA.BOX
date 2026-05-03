# 🎾 Padel Box — Liga de Damas · App Web

App PWA (instalable en celular) para seguir la tabla de posiciones, fixture e inscripciones de la liga.

---

## ⚙️ PASO 1 — Google Apps Script (backend)

1. Abrí tu Google Sheets de la liga
2. Ir a **Extensiones → Apps Script**
3. Borrá todo el contenido que haya y pegá el contenido de `Code.gs`
4. Hacé clic en **Guardar** (ícono de disquete)
5. Ir a **Implementar → Nueva implementación**
6. Tipo: **Aplicación web**
7. Configurar:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
8. Hacer clic en **Implementar**
9. **Copiá la URL** que aparece (la vas a necesitar en el Paso 3)

> ⚠️ Cada vez que modifiques `Code.gs` debés crear una **Nueva implementación** para que los cambios se apliquen.

---

## ⚙️ PASO 2 — Crear repositorio en GitHub

1. Entrá a [github.com](https://github.com) y creá una cuenta si no tenés
2. Clic en **New repository**
3. Nombre: `padel-app` (tiene que coincidir con lo que dice `vite.config.js`)
4. Público ✅
5. **Create repository**
6. Subí todos los archivos de esta carpeta al repo (arrastrar o usar Git)

---

## ⚙️ PASO 3 — Conectar con tu Google Sheet

Abrí el archivo `src/api.js` y reemplazá esta línea:

```js
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/TU_DEPLOYMENT_ID_AQUI/exec";
```

Por la URL real que copiaste en el Paso 1:

```js
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz...TuUrlReal.../exec";
```

Guardá y subí el cambio a GitHub.

---

## ⚙️ PASO 4 — Activar GitHub Pages

1. En tu repositorio de GitHub ir a **Settings → Pages**
2. Source: **GitHub Actions**
3. La primera vez que subas código, GitHub va a compilar y publicar la app automáticamente
4. La URL de tu app será:
   ```
   https://TU_USUARIO.github.io/padel-app/
   ```

---

## 📱 Cómo instalarla en el celular

### Android (Chrome):
1. Abrí la URL de la app en Chrome
2. Aparece un banner "Agregar a pantalla de inicio" → aceptar
3. O: menú (⋮) → "Instalar aplicación"

### iPhone (Safari):
1. Abrí la URL en Safari
2. Botón compartir → **Agregar a pantalla de inicio**
3. Confirmar

---

## 🔄 Actualizar datos cada semana

Solo necesitás cargar los resultados en Google Sheets como siempre.
La app se actualiza automáticamente porque lee directo de la planilla.

### Para cambiar el número de fecha actual:
Abrí Apps Script y cambiá esta línea en `Code.gs`:

```js
const FECHA_ACTUAL = 3;  // ← cambiá este número
```

Luego **nueva implementación** para que tome efecto.

---

## 📋 Hojas necesarias en Google Sheets

| Hoja | Descripción |
|------|-------------|
| `DAMAS SABADOS CLASIFICACION` | Ya existe — tabla principal |
| `INSCRIPCIONES` | Se crea automáticamente |
| `FIXTURE` | Crear manual con columnas: **Fecha, Cancha, Pareja1, Pareja2, Hora** |

### Ejemplo hoja FIXTURE:
| Fecha | Cancha | Pareja1 | Pareja2 | Hora |
|-------|--------|---------|---------|------|
| 3 | BOX 1 | Lore G / Ana B | Jaqueline / Lise | 9:00 |
| 3 | BOX 2 | Sil O / Carli C | Lichi / Alu E | 9:00 |

---

## 📁 Estructura del proyecto

```
padel-app/
├── .github/
│   └── workflows/
│       └── deploy.yml       ← deploy automático
├── public/
│   └── manifest.json        ← config PWA
├── src/
│   ├── main.jsx             ← entrada React
│   ├── App.jsx              ← app completa
│   └── api.js               ← llamadas a Google Sheets ← EDITAR URL AQUÍ
├── index.html
├── vite.config.js           ← cambiar nombre del repo si es diferente
├── package.json
└── Code.gs                  ← pegar en Google Apps Script
```

---

## ❓ Problemas frecuentes

**La tabla aparece vacía**
→ Verificá que la URL en `api.js` sea correcta y que el deployment de Apps Script sea público.

**Error CORS**
→ En Apps Script asegurate de que el acceso sea "Cualquier usuario" (no solo usuarios de Google).

**Los cambios no se reflejan**
→ Cada modificación en `Code.gs` requiere una **nueva implementación** (no editar la existente).
