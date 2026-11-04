---
target: "Mapa público y /obras: opinión de los cambios y siguientes mejoras"
total_score: 28
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\jisaw\\OneDrive\\Documentos\\tula-maps\\src\\app\\page.tsx"
target_fingerprint: "sha256:9c34066d8d078c6366b31e800abe0c25921be18306cb098aaa3b7dc1bca0a2f4"
target_path: "C:\\Users\\jisaw\\OneDrive\\Documentos\\tula-maps\\src\\app\\page.tsx"
timestamp: 2026-11-04T15-49-30Z
slug: src-app-page-tsx
---
# Revisión Impeccable: mapa y administración de obras

Fecha: 4 de noviembre de 2026. Objetivo principal: src/app/page.tsx; incluye /obras y los componentes compartidos. Dos evaluaciones independientes: criterio de diseño y detector. Revisión basada en código; no hay verificación visual en navegador ni overlays.

## Valoración

La dirección mejoró: el mapa y las obras llevan la jerarquía; se redujeron etiquetas y contenedores decorativos. Vino y dorado se conservan como identidad local, con tokens comunes para ambos temas. El resultado estructural es más pertinente para una herramienta municipal y menos intercambiable con una landing genérica. Esto no certifica una apariencia humana ni la accesibilidad.

## Detector

Comando: impeccable detect --json src. Salida: [] y código 0. No reportó hallazgos. Este resultado no reemplaza la evaluación de interacción, contraste calculado y pantallas móviles.

## Fortalezas

- Entrada más directa al mapa y búsqueda por comunidad.
- Tokens semánticos coherentes entre temas, con controles de lectura más claros.
- Ajustes y galerías se revelan cuando se necesitan; el borrado requiere confirmación.

## Prioridades

1. P1: etiquetas públicas del GeoJSON todavía contienen CHECAR ID, TIENE ID 31 y no encontrado. Confirmar nombres con el catálogo antes de corregir etiquetas; no inventar asociaciones ni cambiar IDs o geometría. MapaObras.tsx muestra NOMBRE directamente.
2. P2: la galería pública vacía invita a agregar imágenes, aunque el ciudadano no tiene permiso. Separar el mensaje público del administrativo en ImagenesObra.tsx.
3. P2: /obras sustituye los resultados por un spinner durante búsquedas. Conservar resultados previos con estado Actualizando o usar un esqueleto estable. ListadoObras.tsx.
4. P2: el disparador exterior puede desmontar una galería durante una carga o borrado. Evitar el cierre mientras está ocupado o confirmar la salida; comprobar coherencia al terminar la petición. ImagenesObra.tsx.

## Heurísticas provisionales

Puntuación de fuente, no prueba con usuarios. Estado 3/4; lenguaje 2/4; control 3/4; consistencia 3/4; prevención 3/4; reconocimiento 3/4; eficiencia 2/4; minimalismo 3/4; recuperación 3/4; ayuda 3/4. Total 28/40.

## Público y carga cognitiva

Ciudadanía: tarea principal enfocada; los nombres internos afectan confianza y orientación. Administrador: carga moderada al abrir varias galerías; resultados que desaparecen y operaciones que pueden interrumpirse aumentan incertidumbre. Uso móvil y baja visión: requieren prueba de contraste, foco, tamaño y desbordamiento en ejecución; no se afirma que pasen.

## Continuación

Priorizar clarify y harden para mensajes y estados; adapt y audit para móvil y accesibilidad; document para fijar el sistema existente en DESIGN.md; polish al cerrar. No añadir animación por defecto. No modificar la pantalla azul intencional sin solicitud.
