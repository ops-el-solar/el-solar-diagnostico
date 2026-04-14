# Credenciales - El Solar Diagnostico (Lead Magnet)

## Ubicación de credenciales reales

Las credenciales de API se guardan de forma centralizada en:

**Ubicación local:** `~/.claude/secrets/el-solar-credentials.json`

**Acceso:** Solo administradores del proyecto

---

## Variables de entorno necesarias

### Para desarrollo local (`.env.local`)

Copiar `.env.example` → `.env.local` y reemplazar placeholders:

```bash
cp .env.example .env.local
```

Luego pedir credenciales reales a: **operaciones@elsolaragencia.co**

### Para Netlify (Production)

Las variables se inyectan directamente en Netlify:
- Settings → Environment variables
- No guardar en el repo

**Variables necesarias:**
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `OPENAI_API_KEY`
- `RESEND_API_KEY`

---

## Servicios integrados

| Servicio | Función | Contacto |
|----------|---------|----------|
| **Supabase** | Base de datos + autenticación | https://supabase.com/dashboard/project/gufipulkwnavldejokzf |
| **OpenAI** | Análisis inteligente | https://platform.openai.com/api-keys |
| **Resend** | Envío de emails | https://resend.com/api-keys |

---

## Nota de seguridad

✅ `.env.local` está en `.gitignore`
✅ Credenciales reales NO están en el repo
✅ El repo privado (ops-el-solar) solo tiene `.env.example` con placeholders

