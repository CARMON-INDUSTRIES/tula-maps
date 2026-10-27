# Datos geográficos del mapa de Tula

## Archivos

| Archivo | Contenido | Uso |
| --- | --- | --- |
| `comunidades_poligonos.geojson` | 51 figuras; 42 IDs de comunidad distintos. | Mapa y buscador. |
| `comunidades.geojson` | 57 trazos LineString originales. | Referencia; el frontend no lo carga. |

## Comunidades agrupadas

- San Marcos: sus tres figuras ahora son una sola entrada MultiPolygon.
- Michimaloya: agrupa Michimaloya y Michimaloya agregar.
- Nantzha: agrupa Nantzha y Nantzha unir.
- Tula Centro: se conserva como una sola entrada MultiPolygon con dos partes.

Los polígonos mantienen todos sus puntos y su precisión. Solo se añadió el punto inicial al final de los anillos que estaban abiertos. No se rellenan huecos ni se crean puentes entre territorios separados. Cada comunidad agrupada aparece una sola vez en el listado y sus partes comparten selección.

El cierre se aplica también a las 47 figuras restantes, incluida Xiteje de Zapata: así la línea dorada dibuja el mismo tramo final que el relleno cierra automáticamente. No se desplazan vértices ni se cambia el área. `scripts/cerrar-contornos.mjs` permite repetir esta reparación sin duplicar puntos de cierre.

La agrupación usa nombres e IDs identificados, nunca únicamente el ID: La Mezquitera, por ejemplo, conserva su figura aparte aunque comparta el 52 con Tula Centro.

`scripts/agrupar-comunidades.mjs` permite repetir la agrupación sin duplicar puntos ni figuras. `tests/fixtures/comunidades-agrupadas.json` conserva las huellas de sus coordenadas originales para comprobar su integridad.

## Cómo leer una figura

- `properties.id`: ID usado para consultar `/api/comunidades/{id}`.
- `properties.NOMBRE`: nombre visible y utilizado por la búsqueda.
- `properties.obras`: lista original vacía; las obras se obtienen de la API.
- `geometry.type`: Polygon para un polígono; MultiPolygon para las partes de una comunidad.
- `geometry.coordinates`: pares `[longitud, latitud]`, uno por línea.
- `id` en la raíz de la figura, si existe, es diferente del ID de comunidad. MapLibre genera identificadores de figura al cargar el archivo.

## Catálogo de figuras

Ordenado por nombre solo en esta guía. Figura indica la posición dentro de `features`, empezando por 1.

| Figura | ID de comunidad | Nombre | Geometría |
| --- | --- | --- | --- |
| 7 | 1 | Acoculco | Polygon |
| 50 | 2 | Bomintzha | Polygon |
| 42 | 47 | Cerrito del Tepeyac CHECAR ID | Polygon |
| 29 | 7 | Colonia Benito Juarez | Polygon |
| 33 | 28 | Colonia el Recinto (Ejido Pueblo Nuevo) | Polygon |
| 34 | 39 | Colonia el Saabi CHECAR ID | Polygon |
| 31 | 67 | Colonia el Sesenta y Dos | Polygon |
| 28 | 67 | Colonia el Sesenta y Uno | Polygon |
| 32 | 66 | Colonia Nueva Santa Maria | Polygon |
| 41 | 46 | Ejido Tula CHECAR ID | Polygon |
| 45 | 50 | El Creston | Polygon |
| 5 | 23 | El Llano | Polygon |
| 8 | 53 | Heroes Carranza | Polygon |
| 49 | 25 | Ignacio Zaragoza | Polygon |
| 39 | 44 | Jardines de San Miguel CHECAR ID | Polygon |
| 19 | 14 | Julian Villagran | Polygon |
| 35 | 34 | La Amistad | Polygon |
| 38 | 43 | La Cuarta Manzana CHECAR ID | Polygon |
| 46 | 51 | La Hacienda CHECAR ID | Polygon |
| 47 | 52 | La Mezquitera CHECAR ID | Polygon |
| 12 | 26 | Michimaloya | MultiPolygon |
| 13 | 16 | Monte Alegre | Polygon |
| 14 | 24 | Nantzha | MultiPolygon |
| 36 | 41 | no encontrado 4 TRAE ID 41 | Polygon |
| 44 | 49 | no encontrado 5 CHECAR ID | Polygon |
| 21 | 25 | no encontrado trae id 25 | Polygon |
| 30 | 35 | Praderas del Llano CHECAR CUAL DEL LLANO | Polygon |
| 6 | 28 | Pueblo Nuevo de Jasso | Polygon |
| 48 | 73 | Residencial Arboledas | Polygon |
| 16 | 29 | San Andres Tultepec | Polygon |
| 17 | 70 | San Antonio Tula | Polygon |
| 18 | 58 | San Francisco Bojay | Polygon |
| 51 | 17 | San Jose Acoculco | Polygon |
| 20 | 32 | San Lucas Teacalco | Polygon |
| 2 | 33 | San Marcos | MultiPolygon |
| 22 | 62 | San Miguel de las Piedras Primera Seccion | Polygon |
| 40 | 62 | San Miguel de las Piedras Segunda Seccion | Polygon |
| 23 | 65 | San Pedrito Apulyeca | Polygon |
| 3 | 39 | Santa Ana Ahuehuepan | Polygon |
| 4 | 40 | Santa Maria Ilucan | Polygon |
| 24 | 64 | Santa Maria Macua | Polygon |
| 9 | 27 | Santa Maria Michimaltongo | Polygon |
| 43 | 48 | Tercera Manzana CHECAR ID | Polygon |
| 11 | 13 | TIENE EL ID 13 (COL. JALPA) | Polygon |
| 26 | 31 | TIENE ID 31 | Polygon |
| 1 | 52 | Tula Centro | MultiPolygon |
| 25 | 57 | Xijay de Cuauhtemoc | Polygon |
| 15 | 48 | Xiteje de la Reforma | Polygon |
| 10 | 43 | Xiteje de Zapata | Polygon |
| 27 | 49 | Xochitlan de las Flores | Polygon |
| 37 | 42 | Xonthe CHECAR ID | Polygon |

## IDs compartidos pendientes de revisar

Estos nombres diferentes conservan su ID original. Es necesario cotejarlos con el catálogo de la base antes de corregirlos o agruparlos.

| ID | Nombres |
| --- | --- |
| 25 | no encontrado trae id 25; Ignacio Zaragoza |
| 28 | Pueblo Nuevo de Jasso; Colonia el Recinto (Ejido Pueblo Nuevo) |
| 39 | Santa Ana Ahuehuepan; Colonia el Saabi CHECAR ID |
| 43 | Xiteje de Zapata; La Cuarta Manzana CHECAR ID |
| 48 | Xiteje de la Reforma; Tercera Manzana CHECAR ID |
| 49 | Xochitlan de las Flores; no encontrado 5 CHECAR ID |
| 52 | Tula Centro; La Mezquitera CHECAR ID |
| 62 | San Miguel de las Piedras Primera Seccion; San Miguel de las Piedras Segunda Seccion |
| 67 | Colonia el Sesenta y Uno; Colonia el Sesenta y Dos |

Las notas CHECAR ID y no encontrado se conservan para no inventar asignaciones.
