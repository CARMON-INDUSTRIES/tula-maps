# Revisión de IDs de comunidades

Fecha: 23 de octubre de 2026. Consulta de solo lectura de Id y Nombre en la base configurada del backend. No se modificaron IDs, geometrías ni registros.

El catálogo contiene 79 comunidades. El GeoJSON contiene 51 figuras y 42 IDs distintos. IDs inexistentes en catálogo: 0. La existencia de un ID no confirma que corresponda al territorio dibujado.

## Correcciones propuestas, pendientes de aprobación

- San Miguel de las Piedras Primera Sección: cambiar 62 por 74. Segunda Sección: cambiar 62 por 75. El catálogo tiene entradas específicas para ambas. Verificar después que las obras antiguas del 62 no deban redistribuirse; no trasladarlas automáticamente.
- Colonia el Sesenta y Dos: conservar 67. Colonia el Sesenta y Uno: no debe darse por validada con ese mismo ID; no hay una entrada con ese nombre en el catálogo. Confirmar identidad y pertenencia antes de crear otra comunidad.
- Tula Centro: conservar 52. La Mezquitera: no hay entrada propia por nombre; confirmar su pertenencia antes de asignarle un ID. No unirla automáticamente con Tula Centro.
- Las figuras con CHECAR ID, no encontrado o etiquetas provisionales requieren identificar el territorio. No deducir su identidad a partir del ID actual.
- Nombres como Nantzha / Huerto Nantza, El Llano / Llano 2da Sección y Santa María Michimaltongo / Michimaltongo requieren confirmar equivalencia o sección. Un nombre parecido no basta para reasignar.

## Nombres duplicados en la base

No eliminar ni fusionar hasta revisar las obras y referencias asociadas a cada ID. Las diferencias de acentos no distinguen comunidades.

| Nombre | IDs |
| --- | --- |
| Col. Benito Juarez | 7, 69 |
| Santa Ana Ahuehuepan | 39, 79 |
| Santa Maria Ilucan | 40, 59 |
| Santa Maria Macua | 41, 64 |
| Xochitlan de las Flores | 44, 45, 49 |
| Xijay de Cuauhtemoc | 47, 57 |

## Comparación completa

La columna del catálogo muestra qué comunidad consulta actualmente cada figura. Las diferencias de texto no son por sí solas errores.

| Figura | Nombre GeoJSON | ID actual | Nombre en base de datos |
| --- | --- | --- | --- |
| 1 | Tula Centro | 52 | Tula Centro |
| 2 | San Marcos | 33 | San Marcos |
| 3 | Santa Ana Ahuehuepan | 39 | Santa Ana Ahuehuepan |
| 4 | Santa Maria Ilucan | 40 | Santa Maria Ilucan |
| 5 | El Llano | 23 | Llano 2da Sección |
| 6 | Pueblo Nuevo de Jasso | 28 | Pueblo Nuevo |
| 7 | Acoculco | 1 | Acoculco |
| 8 | Heroes Carranza | 53 | Héroes Carranza |
| 9 | Santa Maria Michimaltongo | 27 | Michimaltongo |
| 10 | Xiteje de Zapata | 43 | Xiteje de Zapata |
| 11 | TIENE EL ID 13 (COL. JALPA) | 13 | Col. Jalpa |
| 12 | Michimaloya | 26 | Michimaloya |
| 13 | Monte Alegre | 16 | Monte Alegre |
| 14 | Nantzha | 24 | Huerto Nantza |
| 15 | Xiteje de la Reforma | 48 | Xiteje de la Reforma |
| 16 | San Andres Tultepec | 29 | San Andrés Tultepec |
| 17 | San Antonio Tula | 70 | San Antonio Tula |
| 18 | San Francisco Bojay | 58 | San Francisco Bojay |
| 19 | Julian Villagran | 14 | Col. Julian Villagran |
| 20 | San Lucas Teacalco | 32 | San Lucas Teacalco |
| 21 | no encontrado trae id 25 | 25 | Ignacio Zaragoza |
| 22 | San Miguel de las Piedras Primera Seccion | 62 | San Miguel de las Piedras |
| 23 | San Pedrito Apulyeca | 65 | San Pedrito Alpuyeca |
| 24 | Santa Maria Macua | 64 | Santa María Macuá |
| 25 | Xijay de Cuauhtemoc | 57 | Xijay de Cuauhtémoc |
| 26 | TIENE ID 31 | 31 | Montecillo |
| 27 | Xochitlan de las Flores | 49 | Xochitlán de las Flores |
| 28 | Colonia el Sesenta y Uno | 67 | Col. Sesenta y Dos |
| 29 | Colonia Benito Juarez | 7 | Col. Benito Juarez |
| 30 | Praderas del Llano CHECAR CUAL DEL LLANO | 35 | Col. La Romera |
| 31 | Colonia el Sesenta y Dos | 67 | Col. Sesenta y Dos |
| 32 | Colonia Nueva Santa Maria | 66 | Nueva Santa María |
| 33 | Colonia el Recinto (Ejido Pueblo Nuevo) | 28 | Pueblo Nuevo |
| 34 | Colonia el Saabi CHECAR ID | 39 | Santa Ana Ahuehuepan |
| 35 | La Amistad | 34 | Col. La Amistad |
| 36 | no encontrado 4 TRAE ID 41 | 41 | Santa Maria Macua |
| 37 | Xonthe CHECAR ID | 42 | Teocalco |
| 38 | La Cuarta Manzana CHECAR ID | 43 | Xiteje de Zapata |
| 39 | Jardines de San Miguel CHECAR ID | 44 | Xochitlan de las Flores |
| 40 | San Miguel de las Piedras Segunda Seccion | 62 | San Miguel de las Piedras |
| 41 | Ejido Tula CHECAR ID | 46 | Col. San Lorenzo |
| 42 | Cerrito del Tepeyac CHECAR ID | 47 | Xijay de Cuauhtemoc |
| 43 | Tercera Manzana CHECAR ID | 48 | Xiteje de la Reforma |
| 44 | no encontrado 5 CHECAR ID | 49 | Xochitlán de las Flores |
| 45 | El Creston | 50 | El Crestón |
| 46 | La Hacienda CHECAR ID | 51 | Col. El Salitre |
| 47 | La Mezquitera CHECAR ID | 52 | Tula Centro |
| 48 | Residencial Arboledas | 73 | Arboledas |
| 49 | Ignacio Zaragoza | 25 | Ignacio Zaragoza |
| 50 | Bomintzha | 2 | Bomintzha |
| 51 | San Jose Acoculco | 17 | San José |
