This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## API de obras

El mapa y la lista consultan la misma API. Por defecto se usa
`https://tula-maps.somee.com/api`. Para usar otro servidor, crea `.env.local`
en la raíz del frontend y configura la URL base, incluyendo `/api`:

```dotenv
NEXT_PUBLIC_API_URL=https://localhost:7209/api
```

Reinicia el servidor de desarrollo después de cambiar esta variable. En un
despliegue, configúrala antes de compilar el frontend. La API debe permitir
el origen del frontend mediante CORS y tener un certificado HTTPS válido.
El backend local debe estar iniciado y su certificado de desarrollo debe ser
de confianza. No desactives la validación de certificados para resolver fallos.

## Comprobaciones

`npm test` verifica la consulta de comunidades, los errores de red y HTTP,
las respuestas inválidas y la cancelación de solicitudes.

## Controles del explorador

- Tamaños de mapa: compacto, cómodo y amplio; también pantalla completa.
- Panel de comunidades plegable, con búsqueda que ignora acentos.
- Vista 2D inicial; el relieve se solicita al activar 3D.
- Ajustes para ocultar nombres y cambiar la intensidad de los polígonos.
- Centrado automático al seleccionar una comunidad y botón para ver todo el municipio.

Las comunidades consultadas se conservan en memoria durante un minuto mientras
el explorador está abierto. Reabrirlas en ese intervalo evita otra petición;
los cambios del servidor pueden tardar hasta un minuto en aparecer al reabrir.
En pantallas pequeñas el panel comienza cerrado para dejar visible el mapa.

## Fotografías de obras

Cada ficha tiene un botón **Ver imágenes**, con carrusel y navegación por flechas
o teclado. Las fotografías se consultan al abrir el carrusel y se descarga solo
la imagen actual. La carga está disponible únicamente en `/obras` después de
iniciar sesión: de 1 a 10 archivos JPG, PNG o WebP de hasta 5 MB cada uno.

Los archivos se almacenan en SQL Server, en la tabla `ObraImagen`, y no se envían
a servicios externos. La API debe tener aplicada la migración
`20261021180000_ImagenesEnBaseDeDatos` y configurada la variable privada
`Uploads__AccessKey` como clave técnica de carga. En desarrollo está en User
Secrets del backend y se retiró de los archivos appsettings.

## Acceso a la administración

Al visitar `/obras` se muestra un modal de contraseña. El servidor del frontend
valida `OBRAS_ADMIN_PASSWORD` y emite una cookie HttpOnly firmada, válida por
4 horas. El listado no se renderiza sin una sesión válida. Hay un botón para
cerrar sesión. El mapa público solo permite ver fotografías.

En desarrollo están configuradas en `.env.local`, excluido de Git:

- `OBRAS_ADMIN_PASSWORD`: contraseña solicitada al entrar.
- `OBRAS_SESSION_SECRET`: secreto aleatorio que firma las sesiones.
- `OBRAS_UPLOAD_KEY`: clave técnica que coincide con `Uploads__AccessKey` de la API.
- `OBRAS_API_URL` (opcional): URL de API desde el servidor, si es distinta de `NEXT_PUBLIC_API_URL`.

Ninguna de estas claves debe tener prefijo `NEXT_PUBLIC_`. El navegador envía
las fotos a `/api/admin/obras/{id}/imagenes`, que verifica la sesión y contacta
al backend sin revelar su clave. La contraseña solo se pide al entrar.

Para producción, configurar estas variables privadas en el servidor Next.js y
`Uploads__AccessKey` en el servidor .NET. La protección requiere ejecutar Next.js
con soporte de servidor y HTTPS; una exportación estática en GitHub Pages no
puede ejecutar la autenticación ni la carga protegida. Reiniciar ambos servidores
al cambiar la configuración. Cambiar `OBRAS_SESSION_SECRET` invalida todas las sesiones.

El backend incluye `IMAGENES.md` y `Scripts/imagenes-en-base-de-datos.sql` con los
pasos de activación. Esta funcionalidad requiere publicar la API actualizada;
no funciona contra una versión anterior de los endpoints. Las fotos ya
registradas como URLs se conservan y no se importan automáticamente.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Listado de obras

La pantalla `/obras`, accesible directamente por URL, permite buscar
por obra, comunidad, ubicación o dirección y consultar 12 obras por página.
Cada ficha tiene **Ver / subir fotografías**, que abre el carrusel y la carga
usando la sesión de administración. Reutiliza el mismo almacenamiento en SQL.

El backend actualizado incorpora `GET /api/obras?page=1&pageSize=12&buscar=...`.
Incluye obras sin comunidad asignada y no carga archivos de imagen en el listado.
No requiere otra migración; reiniciar o publicar el backend para activar la ruta.

## Comunidades agrupadas

San Marcos, Michimaloya y Nantzha tienen una sola figura MultiPolygon por
comunidad. Tula Centro conserva sus dos partes en una sola figura. Se mantienen
las coordenadas y los IDs; los territorios separados no se rellenan. Los IDs
compartidos entre nombres diferentes siguen pendientes de revisión en
`public/data/README.md`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
