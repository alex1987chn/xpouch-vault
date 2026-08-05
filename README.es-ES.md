

# XPouch Vault

Un escritorio seguro y elegante para gestionar claves API de IA y monitorear nodos de la puerta de enlace OpenClaw. Construido con Tauri 2.x, React 19 y Rust.

[**中文文档**](./README_zh.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Tauri](https://img.shields.io/badge/Tauri-2.x-24C8D8?logo=tauri)](https://v2.tauri.app)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![Rust](https://img.shields.io/badge/Rust-Stable-000000?logo=rust)](https://www.rust-lang.org)

<img src="https://github.com/user-attachments/assets/21eb77a8-c6f0-4270-b054-7d6558c46e4c" alt="XPouch Vault - Bóveda de Claves" width="900">
<img src="https://github.com/user-attachments/assets/fc80092f-1a80-4c32-a799-369902519460" alt="XPouch Vault - Monitor Lobster" width="900">

> **Filosofía de Diseño** — Inspirado en la estética cálida y minimalista de Claude: blancos piedra, acentos naranja tostado, espaciado generoso y sombras sutiles.

## Características

### Bóveda — Gestión de Claves API

- **Cifrado AES-256-GCM** — Las claves API se cifran en reposo con cifrado a nivel de campo; las claves nunca llegan al frontend en texto plano
- **9 Proveedores de IA** — OpenAI, Anthropic, Google AI, DeepSeek, MiniMax, Kimi, Qwen, Doubao, GLM + personalizados
- **Iconos de Marca** — Logotipos auténticos de proveedores vía `@lobehub/icons`
- **Ping de Estado** — Validación asíncrona de claves a través del backend en Rust; resultados guardados en la base de datos
- **Insignia de Validez** — Las tarjetas muestran Válido / Inválido / No probado según los resultados reales del ping
- **Mostrar y Copiar Clave** — Alternar entre máscara/plano; copiar al portapapeles con un clic
- **Renombrar Claves** — Diálogo de edición inline para renombrar claves sin volver a crearlas
- **Gestión por Categorías** — Organiza claves por entorno (producción, desarrollo/pruebas, personal, copia de seguridad)
- **Visualización enmascarada** — Las claves se muestran como cadenas enmascaradas (p. ej., `sk-...7xYz`) en la interfaz
- **i18n** — Soporte trilingüe: chino, inglés, japonés

### Lobster — Monitoreo de Puerta de Enlace OpenClaw

- **Monitoreo en Tiempo Real vía WebSocket** — Se conecta a puertas de enlace OpenClaw mediante protocolo WS (métodos de salud y estado)
- **CRUD de Nodos** — Agregar, editar y eliminar nodos de puerta de enlace con almacenamiento cifrado de tokens
- **Panel de Control** — Estado online/offline, versión de la puerta de enlace, tiempo activo, canales, agentes, trabajos cron, presencia, sesiones, habilidades, tareas, latido
- **Auto Refresco** — Actualización automática cada 30 segundos para todos los estados de los nodos
- **Barra Lateral de Detalles** — Detalles completos: canales (en ejecución/error), agentes (modelo/sesiones), trabajos cron, dispositivos en línea

### Compartido

- **Primero Local** — Todos los datos se almacenan en SQLite local (modo WAL); sin sincronización en la nube, sin telemetría
- **UI Inspirada en Claude** — Blancos cálidos piedra, acento naranja tostado, espaciado generoso, sombras sutiles
- **Propiedades CSS Personalizadas** — Temas mediante `--accent`, `--bg-base`, `--text-primary`, etc.
- **Biblioteca de Componentes** — Dialog, ConfirmDialog, EmptyState, PageHeader, ActionButton, Form, Toast, StatCard

## Stack Tecnológico

| Capa | Tecnología |
|-------|-----------|
| Runtime de Escritorio | Tauri 2.x |
| Frontend | React 19 + TypeScript + TailwindCSS v4 |
| Gestión de Estado | Zustand 5 |
| Iconos | @lobehub/icons (marca) + Lucide (UI) |
| Backend | Rust (comandos nativos de Tauri) |
| Base de Datos | SQLite (vía rusqlite, incluido) |
| Cifrado | AES-256-GCM (a nivel de campo) |
| Cliente HTTP | reqwest 0.12 (asíncrono, para ping de salud) |
| WebSocket | tokio-tungstenite 0.26 (asíncrono, para monitoreo de OpenClaw) |
| i18n | Personalizado (zh/en/ja) |
| Construcción | Vite 8 + pnpm |
| CI | GitHub Actions (Windows + macOS) |

## Primeros Pasos

### Requisitos Previos

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- [Rust](https://www.rust-lang.org/tools/install) (estable)
- [Tauri CLI](https://v2.tauri.app/start/prerequisites/)

### Instalar Dependencias

```bash
pnpm install
```

### Desarrollo

```bash
pnpm tauri dev
```

Esto inicia el servidor de desarrollo de Vite en `http://localhost:1420` y lanza la ventana de Tauri.

### Construcción

```bash
pnpm tauri build
```

Genera instaladores específicos de la plataforma en `src-tauri/target/release/bundle/`:

| Plataforma | Formatos de Salida |
|----------|---------------|
| Windows | `.msi`, `.exe` (NSIS) |
| macOS | `.dmg`, `.app` |
| Linux | `.deb`, `.AppImage` |

> **Nota:** Debes compilar en la plataforma objetivo. Usa la CI de GitHub Actions para lanzamientos multiplataforma.

### Notas de Instalación

Esta aplicación **no está firmada digitalmente** (sin certificado de pago). Es posible que encuentres advertencias del SO al iniciarla por primera vez:

- **Windows**: SmartScreen puede mostrar "Windows protegió tu PC" — haz clic en **Más información** → **Ejecutar de todos modos**
- **macOS**: Puede ver "no se puede abrir porque es de un desarrollador no identificado" — haz **clic derecho** en la aplicación → **Abrir**, o ve a **Ajustes del Sistema → Privacidad y seguridad → Abrir de todos modos**

## Estructura del Proyecto

```
xpouch-vault/
├── src/                      # Frontend (React + TypeScript)
│   ├── components/           # Componentes de negocio
│   │   ├── KeyCard.tsx       # Tarjeta de clave (copiar/mostrar/ping/eliminar)
│   │   ├── AddKeyDialog.tsx  # Diálogo para agregar clave
│   │   ├── NodeCard.tsx      # Tarjeta de nodo (estado online/canales/tareas)
│   │   ├── AddNodeDialog.tsx # Diálogo para agregar/editar nodo
│   │   ├── NodeDetailPanel.tsx # Barra lateral de detalles del nodo
│   │   ├── VaultLogo.tsx     # Logotipo animado de puerta de bóveda
│   │   ├── LanguageSwitcher.tsx # Selector de idioma zh/en/ja
│   │   ├── Toast.tsx         # Notificaciones toast globales
│   │   └── ui/               # Primitivas UI reutilizables
│   │       ├── Dialog.tsx    # Caparazón de modal
│   │       ├── ConfirmDialog.tsx
│   │       ├── EmptyState.tsx
│   │       ├── PageHeader.tsx
│   │       ├── ActionButton.tsx
│   │       ├── DialogActions.tsx
│   │       ├── Form.tsx      # Input + Select
│   │       └── StatCard.tsx  # StatCard + StatSection + ChannelBadge
│   ├── pages/                # Páginas de ruta
│   │   ├── VaultPage.tsx     # Bóveda (inicio)
│   │   └── LobsterPage.tsx   # Monitoreo Lobster
│   ├── store/                # Almacenes Zustand
│   │   ├── vaultStore.ts     # Estado y acciones de la bóveda
│   │   ├── nodeStore.ts      # Estado y acciones de monitoreo de nodos
│   │   └── toastStore.ts     # Estado de toast
│   ├── types/                # Definiciones de tipos TypeScript
│   │   ├── vault.ts          # VaultEntry, KeyProvider, PROVIDER_LABELS/COLORS
│   │   └── node.ts           # OpenClawNode, NodeStatus, ChannelInfo, TasksInfo
│   ├── i18n/                 # Internacionalización
│   │   ├── index.ts          # Hook useI18n
│   │   └── translations.ts   # Tabla de traducciones zh/en/ja
│   ├── utils/                # Funciones utilitarias
│   │   └── format.ts         # formatDateTime, formatUptime
│   ├── App.tsx               # Layout raíz + barra lateral
│   └── main.tsx              # Punto de entrada (HashRouter)
├── src-tauri/                # Backend (Rust)
│   ├── src/
│   │   ├── commands.rs       # Comandos Tauri (CRUD Bóveda + ping + CRUD Nodo + sonda WS)
│   │   ├── node.rs           # Modelo de datos de nodo + CRUD + descifrar token
│   │   ├── crypto.rs         # Cifrado/descifrado AES-256-GCM
│   │   ├── db.rs             # Esquema SQLite + consultas de bóveda
│   │   ├── lib.rs            # Registro de módulos + configuración
│   │   └── main.rs           # Punto de entrada
│   ├── Cargo.toml
│   └── tauri.conf.json
├── .github/
│   └── workflows/
│       └── build.yml         # CI: compilación multiplataforma + lanzamiento
└── package.json
```

## Sistema de Diseño

### Fijos de Color (Propiedades CSS Personalizadas)

```css
--bg-base: #faf9f7;        /* blanco cálido stone-50 */
--bg-surface: #ffffff;      /* tarjetas blanco puro */
--bg-muted: #f5f4f0;       /* fondo sutil stone-100 */
--border-default: #e7e5e0; /* stone-200 */
--text-primary: #1c1917;   /* stone-900 */
--text-secondary: #57534e; /* stone-600 */
--text-tertiary: #a8a29e;  /* stone-400 */
--accent: #c96442;         /* naranja tostado */
--accent-light: #fef3ee;   /* tono de fondo acento */
--success: #16a34a;
--error: #dc2626;
--warning: #ca8a04;
```

### Endpoints de Ping de Proveedores

| Proveedor | Método | Endpoint | Autenticación |
|----------|--------|----------|------|
| OpenAI | GET | `api.openai.com/v1/models` | `Bearer {key}` |
| Anthropic | GET | `api.anthropic.com/v1/models` | `x-api-key` + `anthropic-version: 2023-06-01` |
| Google AI | GET | `generativelanguage.googleapis.com/v1beta/models?key={key}` | Parámetro de consulta |
| DeepSeek | GET | `api.deepseek.com/v1/models` | `Bearer {key}` |
| MiniMax | POST | `api.minimaxi.com/v1/chat/completions` | `Bearer {key}` (chat mínimo) |
| Kimi | GET | `api.moonshot.cn/v1/models` | `Bearer {key}` |
| Qwen | GET | `dashscope.aliyuncs.com/compatible-mode/v1/models` | `Bearer {key}` |
| Doubao | POST | `ark.cn-beijing.volces.com/api/v3/chat/completions` | `Bearer {key}` (chat mínimo) |
| GLM | GET | `open.bigmodel.cn/api/paas/v4/models` | `Bearer {key}` |

> **Nota:** Algunos proveedores (MiniMax, Doubao) no soportan el endpoint estándar `/v1/models`. Para estos, el ping envía una solicitud mínima `POST /chat/completions` con `max_tokens: 1` — cualquier respuesta que no sea 401/403 significa que la clave está autenticada. Esto consume como máximo 1 token por ping.

## Arquitectura de Seguridad

```
[Entrada de Usuario] → Frontend (solo en memoria como texto plano)
       ↓
[Comando Tauri] → Backend Rust
       ↓
[Cifrado AES-256-GCM] → nonce + texto cifrado → base64 → SQLite

[Ping de Salud] → Rust descifra clave → reqwest HTTP asíncrono → resultado → DB + Toast
[Sonda WS]      → Rust descifra token → tokio-tungstenite WS → estado → UI
```

- La clave de cifrado se deriva de características del equipo (nombre de host + nombre de usuario) como solución provisional
- **TODO**: Integrar con el Bóveda de Credenciales del SO (Keychain en macOS, Administrador de Credenciales en Windows, Secret Service en Linux)
- Todas las solicitudes HTTP/WS externas se realizan desde Rust, las claves/tokens nunca pasan por el stack de red del frontend
- El archivo de base de datos se almacena en el directorio de datos de la aplicación Tauri

## Lanzamientos

Publica una etiqueta de versión para activar la compilación automática multiplataforma:

```bash
git tag v0.3.0
git push origin v0.3.0
```

GitHub Actions compilará los instaladores de Windows (.msi/.exe) y macOS (.dmg) y creará un Lanzamiento con enlaces de descarga.

## Requisitos de la Puerta de Enlace OpenClaw

Por defecto, la puerta de enlace OpenClaw se vincula a `localhost` (modo LAN) y rechaza conexiones de clientes externos. Para permitir que XPouch Vault se conecte desde otra máquina, configura la puerta de enlace para escuchar en `0.0.0.0`:

**Opción 1: Vía UI de OpenClaw** — Configuración → Puerta de enlace:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

**Opción 2: Vía `openclaw.json`**:

```json
{
  "gateway": {
    "bind": "custom",
    "customBindHost": "0.0.0.0"
  }
}
```

Luego reinicia: `openclaw gateway restart`

## Licencia

MIT
