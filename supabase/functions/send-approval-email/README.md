# send-approval-email

Función Edge para enviar el email de aprobación de usuarios con Resend.

## Secretos necesarios

```bash
supabase secrets set RESEND_API_KEY=tu_api_key
supabase secrets set ADMIN_EMAIL=lmproductos@gmail.com
```

## Despliegue

```bash
supabase functions deploy send-approval-email
```

