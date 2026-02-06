# Configurar dominio personalizado para R2

## Opción 1: CNAME en tourtovalencia.com

1. Ve a Cloudflare Dashboard → DNS → tourtovalencia.com
2. Añade registro CNAME:
   - Type: CNAME
   - Name: r2
   - Target: pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev
   - Proxy: false (DNS only)

3. URL resultante: https://r2.tourtovalencia.com/tourtovalencia/public/hero3.jpg

## Opción 2: Usar el mismo dominio con Workers (recomendado)

Crear un worker que sirva las imágenes:
```javascript
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/r2\//, );
    const r2Url = `https://pub-b33f26330e8542cbbcca76ef18d29dd0.r2.dev/${path}`;
    return fetch(r2Url);
  }
}
```

## URLs que funcionarían:
- https://r2.tourtovalencia.com/tourtovalencia/public/hero3.jpg
- https://tourtovalencia.com/r2/tourtovalencia/public/hero3.jpg

