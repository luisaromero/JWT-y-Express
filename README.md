# 🔐 Autenticación y Autorización con JWT — Express

API REST con login, middleware de autenticación y rutas protegidas usando JWT, más un frontend simple en HTML/JS.

## 🚀 Cómo correrlo

```bash
npm install
npm run dev
```

Luego abre 👉 `http://localhost:3000/login.html`

### ⚙️ Variables de entorno (`.env`)

```
PORT=3000
JWT_SECRET=tu_clave_secreta
JWT_EXPIRES=15m
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
DB_NAME=jwt_example
```

## 🛠️ Tecnologías

- 🟩 Node.js + Express
- 🔑 jsonwebtoken (JWT)
- 🔒 bcryptjs (hash de contraseñas)
- 🐘 PostgreSQL + pg
- 📦 dotenv
- 🔁 nodemon
- 🎨 HTML / CSS / JS (vanilla)

## ✅ Qué se implementó

- [x] 🔓 **Login — `POST /auth/login`**
      Endpoint construido con **Express** que recibe `email` y `password` en el body. Primero valida que ambos campos vengan presentes (si no, responde `400`). Luego busca al usuario en **PostgreSQL** mediante una query parametrizada con el driver **`pg`**, y compara la contraseña recibida contra el hash guardado usando `bcrypt.compare` de **bcryptjs** (nunca se compara texto plano). Si las credenciales son correctas, se firma un **JWT** con la librería `jsonwebtoken`, incluyendo el email y el rol del usuario en el payload, con una expiración de 15 minutos definida en `.env`. La respuesta final es `{ ok: true, token }` con status `200`, o `401` si las credenciales no coinciden.

- [x] 🛡️ **Middleware de autenticación**
      Función intermedia de **Express** (`middlewares/auth.js`) que se ejecuta antes de cualquier ruta protegida. Extrae el token del header `Authorization: Bearer <token>`, y usa `jwt.verify` de **jsonwebtoken** para confirmar que la firma es válida (fue creada con nuestro `JWT_SECRET`) y que no expiró. Si todo está bien, agrega los datos del usuario a `req.user` y llama a `next()` para dejar pasar la petición hacia la ruta real. Si el token falta, está mal formado, fue alterado o expiró, corta la ejecución inmediatamente respondiendo `401`, sin llegar nunca a la lógica de la ruta protegida.

- [x] 👤 **Perfil protegido — `GET /api/perfil`**
      Ruta de **Express** que usa el middleware de autenticación como filtro previo. Como el middleware ya validó el token y dejó los datos del usuario en `req.user`, esta ruta simplemente toma `email` y `role` de ahí y los devuelve en la respuesta, sin necesidad de volver a consultar la base de datos. Es el ejemplo concreto de "ruta protegida": si no pasas por el middleware con un token válido, nunca llegas a ver esta respuesta.

- [x] 📝 **Registro — `POST /auth/register`**
      Endpoint que primero verifica en **PostgreSQL** si el email ya existe (para evitar duplicados, gracias también a la restricción `UNIQUE` de la tabla `usuarios`). Si no existe, la contraseña se hashea con `bcrypt.hash` de **bcryptjs** antes de guardarla — así, aunque alguien accediera a la base de datos, nunca vería contraseñas reales, solo hashes irreversibles. La inserción se hace con una query parametrizada (`$1, $2, $3`) usando el driver **`pg`**, lo que evita ataques de SQL injection. Responde `201` si se crea el usuario, `409` si el email ya está registrado, y `400` si faltan datos.

- [x] 🚦 **Manejo de códigos HTTP**
      A lo largo de toda la API construida con **Express** se usan los códigos de estado según corresponda: `200` para operaciones exitosas de lectura/login, `201` para creación de un usuario nuevo, `400` cuando faltan datos obligatorios, `401` cuando el token o las credenciales no son válidas, `409` cuando hay un conflicto de datos (email duplicado), y `500` para errores inesperados del servidor (por ejemplo, si PostgreSQL no responde). Las rutas que interactúan con la base de datos están envueltas en bloques `try/catch` para capturar esos errores y no dejar el servidor caído.

- [x] 🖥️ **Pantalla de Login (frontend)**
      Página construida con **HTML** y **CSS** simple, con un formulario de email/contraseña. El botón "Ingresar" ejecuta **JavaScript** puro (sin frameworks) que usa la **Fetch API** para mandar los datos a `POST /auth/login`. Si la respuesta es exitosa, el token recibido se guarda en `localStorage` del navegador, para que las siguientes pantallas puedan usarlo sin pedir el login de nuevo. Si falla, se muestra el mensaje de error devuelto por el backend directamente en pantalla.

- [x] 🙋 **Pantalla de Perfil (frontend)**
      Al cargar esta página, un script en **JavaScript** revisa si existe un token guardado en `localStorage`. Si no hay token, redirige de inmediato a la pantalla de acceso denegado, sin siquiera llamar a la API. Si hay token, hace una petición con **Fetch** a `GET /api/perfil`, enviándolo en el header `Authorization: Bearer <token>` — igual que se probó manualmente en Postman. Si el backend responde con éxito, muestra el email y rol del usuario; si responde `401` (token vencido o inválido), borra el token guardado y redirige también a la pantalla de acceso denegado. También incluye el botón "Cerrar sesión", que borra el token de `localStorage` y devuelve al login — así es como se implementa el logout en un esquema basado en JWT, donde el token no se invalida en el servidor, sino que simplemente se "olvida" en el cliente.

- [x] ⛔ **Pantalla de Acceso denegado (frontend)**
      Página estática en **HTML/CSS** que se muestra cuando alguien intenta entrar a `perfil.html` sin un token válido. Explica el motivo del error (401), indica el header que la API espera (`Authorization: Bearer <token>`) y ofrece un botón para volver al login. Es el punto de llegada común para los dos casos de fallo de autenticación que puede detectar el frontend: ausencia de token, o token rechazado por el backend.
