# Obras Tula

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

La ciudadanía consulta obras públicas por comunidad en el mapa. `/obras` es una herramienta de trabajo para el único administrador actual, quien consulta, sube y elimina fotografías. Uso confirmado por el usuario en esta conversación.

## Product Purpose

Permitir explorar las obras registradas de Tula de Allende y consultar su evidencia fotográfica sin requerir acceso de administración.

## Operating Context

El mapa y la búsqueda por comunidad son públicos. La administración se abre directamente mediante `/obras`, sin enlaces nuevos en el encabezado público. El acceso utiliza la contraseña y la sesión existentes.

## Capabilities and Constraints

- Conservar geometrías, IDs, datos originales y relaciones de obras.
- Mantener tamaños del mapa, pantalla completa, selección, búsqueda y vistas 2D/3D.
- Mantener modo claro/oscuro, carrusel, carga y borrado con confirmación.
- Frontend Next.js; API ASP.NET y SQL en Somee; fotos nuevas en Cloudinary.
- No cambiar autenticación, almacenamiento ni endpoints durante la mejora visual.
- No inventar cifras, resultados o contenido institucional.

## Brand Commitments

Conservar la identidad de Tula de Allende y sus colores vino y dorado. El usuario busca una presentación cuidada, coherente y alejada de plantillas genéricas.

## Product Principles

- El mapa y las obras son el contenido principal.
- Diferenciar la consulta ciudadana de las tareas de administración.
- Priorizar lectura, controles comprensibles y uso en pantallas pequeñas.
- Refinar la presentación sin alterar los flujos que ya funcionan.
