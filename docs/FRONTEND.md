# Frontend de ciberseguridad: decisiones y continuidad

Fecha de implementación: 27 de octubre de 2026, America/Lima. Base de la reconstrucción: `master`, commit `10e8b96`. La entrega se versiona en `dev-v1` y se integra en `main`.

## Objetivo y supuestos

El usuario solicitó reconstruir la app existente como ticketera propia del equipo de ciberseguridad, trabajando solo el frontend en este repositorio.

La tarea principal es pasar de un reporte a un caso con contexto, prioridad, responsable, acciones documentadas y resultado. Se asume inicialmente una vista de analista. La identidad, los permisos, los acuerdos de atención y la taxonomía institucional deben definirse para el backend.

La identidad visual provisional se denomina **Cyberdesk**: superficies claras, navegación lateral, acento verde petróleo, tablas de trabajo y detalle bajo demanda. Las prioridades y estados siempre incluyen texto, además del color.

## Decisiones técnicas

| Decisión | Alternativas consideradas | Elección y motivo |
| --- | --- | --- |
| Framework | Conservar el framework o sustituirlo | Angular 22, TypeScript 6 y SCSS. La versión se actualizó por la solicitud de seguridad del usuario, con migraciones oficiales desde Angular 19. |
| Componentes | Biblioteca completa o controles nativos con comportamiento accesible | Controles nativos y CDK 22 para foco. Se conserva el sistema visual y se actualiza PrimeIcons a la versión 8. |
| Compilación | Compilador anterior o @angular/build | Migración oficial a @angular/build 22, retirando build-angular y su cadena de Webpack. |
| Estado | Almacén global externo o estado Angular | Signals y computed en TicketStore, con estado de filtros en la URL. No se agregó otra biblioteca de estado. |
| Persistencia del prototipo | Memoria o almacenamiento del navegador | localStorage versionado para probar la continuidad tras una recarga. Está aislado en TicketRepository y no representa almacenamiento multiusuario. |
| Ejecución | Mantener SSR o frontend estático | Se retiró el servidor Express/SSR del esqueleto. La fase entrega una SPA y no implementa un backend. |
| Gráficos | Dependencia de gráficos o SVG/CSS | SVG para la serie diaria y CSS para la distribución. Los valores proceden de los registros, sin tendencias inventadas. |
| Recursos visuales | CDN o archivos locales | Inter procedente del frontend existente y PrimeIcons empaquetados localmente. Sin fuentes, imágenes ni telemetría remotas. |

Versiones de esta revisión: Angular Core 22.2.3, CLI/build/CDK 22.2.4 y TypeScript 6.0.3. Entorno de ejecución de las verificaciones: Windows, Node 24.19.0, npm 11.17.0 y Chrome Headless 156. La compatibilidad de Node está declarada en package.json.

La implementación inicial se contrastó con la documentación de Angular 19. La actualización usa las migraciones oficiales 19 → 20 → 21 → 22 y la [matriz de compatibilidad vigente](https://angular.dev/reference/versions). Las migraciones declararon ChangeDetectionStrategy.Eager para conservar el comportamiento anterior y se mantienen los diagnósticos estrictos. El informe de seguridad y las comprobaciones están en [ACTUALIZACION-DEPENDENCIAS.md](ACTUALIZACION-DEPENDENCIAS.md).

## Responsabilidades

| Ubicación | Responsabilidad |
| --- | --- |
| src/app/app.component.* | Navegación, búsqueda global, avisos locales, reloj y composición del espacio. |
| src/app/overview/ | Resumen, cola priorizada, actividad y gráficos derivados. |
| src/app/tickets/ticket.model.ts | Tipos, validación, estados, objetivos y escape de CSV. |
| src/app/tickets/ticket.fixtures.ts | Escenarios sintéticos aislados del resto del producto. |
| src/app/tickets/ticket.repository.ts | Lectura y escritura del snapshot local, validación de formato. |
| src/app/tickets/ticket.store.ts | Registro, reglas del ciclo de vida, historial y estado derivado. |
| src/app/tickets/tickets.component.* | Búsqueda, filtros compartibles por URL, ordenación, paginación y tablero. |
| src/app/tickets/ticket-create.component.ts | Formulario tipado de registro y validación visible. |
| src/app/tickets/ticket-detail.component.ts | Contexto, seguimiento y consulta del historial. |
| src/app/tickets/ticket-export.ts | CSV descargable de los resultados y su historial. |
| src/app/shared/ | Diálogo con foco e inert, etiquetas de estado y tabla reutilizada. |
| src/app/workspace/ | Actividad, equipo y configuración local. |
| src/styles/ | Tokens semánticos, disposición, controles y estilos de las vistas. |

Las rutas cargan las vistas de forma diferida. `/dashboard` conserva una redirección a `/overview`. La antigua autenticación con credenciales fijas y los roles de agente, empleado y mantenimiento se retiraron.

## Contrato de datos actual

`Ticket` reúne identificador, asunto, descripción, tipo, categoría, prioridad, estado, responsable, solicitante, correo, activo, indicadores, fechas de registro/actualización/objetivo/resolución y una lista de eventos.

Cada `TicketEvent` contiene identificador, instante, actor, acción y detalle. Los campos temporales se guardan como cadenas ISO UTC; la presentación usa UTC−5. Las referencias se muestran como texto escapado, sin convertir indicadores en enlaces ni consultar reputación.

El snapshot tiene la forma `{ version: 1, tickets: Ticket[] }`. La lectura valida campos, enumeraciones, fechas, responsables, eventos, identificadores duplicados y límites. Si el contenido es incompatible, se informa del error, se permite una sesión con escenarios ficticios y no se sobrescribe silenciosamente el contenido anterior. Si una escritura falla, los cambios quedan en memoria y se muestra el aviso.

El almacenamiento es una implementación local concreta. Al incorporar transporte HTTP se deberán separar los comandos asíncronos de las reglas del prototipo, añadir estados de carga/error y reconciliar respuestas del servidor. No basta con reemplazar localStorage por fetch y conservar la autoridad en el navegador.

## Ciclo de vida y trazabilidad

| Estado actual | Transiciones admitidas |
| --- | --- |
| Nueva | En análisis |
| En análisis | En espera, Resuelta |
| En espera | En análisis, Resuelta |
| Resuelta | En análisis, Cerrada |
| Cerrada | En análisis |

Se puede conservar el estado para cambiar responsable, prioridad o añadir una nota. Un guardado sin cambios se rechaza. Resolver o cerrar requiere una nota de al menos 12 caracteres. Reabrir conserva el historial y elimina la fecha de resolución vigente.

Los cambios de estado, prioridad y responsable producen eventos separados. Las notas se añaden al historial. Cambiar la prioridad recalcula el objetivo desde el registro original: Crítica 4 h, Alta 12 h, Media 24 h y Baja 72 h. Estos valores son demostrativos y están visibles en Configuración.

El resumen cuenta activos excluyendo Resuelta y Cerrada. Los gráficos diarios agregan registros y fechas de resolución vigentes por día de Lima. Una reapertura elimina el caso de la serie de resoluciones vigentes, aunque la resolución anterior permanezca documentada en el historial.

## Estados de interfaz

- Formulario vacío o inválido: mensajes junto a los campos y resumen de error.
- Sin resultados: estado vacío con posibilidad de limpiar filtros.
- Ticket inexistente: diálogo con recuperación hacia la bandeja.
- Fallo de almacenamiento: aviso persistente y conservación durante la sesión.
- Restablecimiento: confirmación explícita; cancelar conserva los registros.
- Datos largos: ajuste en contexto e indicadores; tabla con desplazamiento independiente.
- Móvil: menú lateral bajo demanda y tabla desplazable con indicación visible.
- Accesibilidad: controles semánticos, nombres accesibles, enlace de salto, foco visible, captura/restauración del foco e inert en diálogos, tabs con flechas, avisos de estado y tabla de datos del gráfico.

No hay espera de red ni autenticación en esta fase; no se simulan spinners, fallos de API o autorización que el sistema todavía no produce.

## Evidencia de verificación

| Comprobación | Evidencia y alcance |
| --- | --- |
| Compilación | npm.cmd run build; build de producción aprobado dentro de los presupuestos del repositorio. Bundle inicial con Angular 22: 454.41 kB, por debajo del aviso de 500 kB. |
| Pruebas automáticas | npm.cmd run test:ci; 17 pruebas aprobadas en Chrome Headless. Cubren reglas, validación, historial, recuperación, snapshot y CSV. |
| Registro | Formulario vacío rechazado; solicitud completa registrada con ID, responsable e indicadores. |
| Seguimiento | Cambios de estado, prioridad y responsable y notas visibles en el historial. |
| Resolución | Sin nota se rechaza; con nota se conserva el estado y el historial tras recargar. |
| Bandeja | Búsqueda mediante escritura conserva foco y filtra; estado vacío, limpieza, paginación y cinco columnas del tablero comprobados. |
| Exportación | CSV filtrado descargado y leído; conserva el ticket resuelto y ocho eventos del recorrido. |
| Restablecimiento | Cancelar mantiene los registros; confirmar restaura los 18 escenarios iniciales. |
| Recuperación | Ticket inexistente con retorno a la bandeja; snapshot dañado señalizado sin sobrescribir y recuperado mediante restablecimiento explícito. |
| Vistas | Mis asignaciones, actividad y equipo abiertos durante el recorrido. |
| Adaptación | Resumen y bandeja comprobados a 1440, 390 y 320 CSS px. Sin desbordamiento de página; la tabla conserva desplazamiento horizontal propio. |
| Diálogos y teclado | Registro y detalle comprobados a 320 CSS px; tabs con flechas, Escape e inert/restauración del fondo verificados. |
| Ejecución y red | Sin pageerror ni solicitudes HTTP externas durante el recorrido funcional comprobado. |
| Revisión visual | Capturas locales inspeccionadas de resumen de escritorio, resumen móvil y detalle. Se corrigieron tipografía, contraste y desbordamientos detectados. |
| Contraste parcial | Comprobación propia del texto HTML visible del resumen: sin pares de color bajo los umbrales evaluados tras las correcciones. No cubre todos los estados, contenido SVG, iconos ni el resto de WCAG. |

Los artefactos temporales están en `output/playwright/`, ignorado por Git. No se agregaron credenciales, datos institucionales ni una dependencia de Playwright a la aplicación.

La comprobación de contraste de texto es parcial y no equivale a una auditoría WCAG completa. No se ha probado con lector de pantalla, usuarios reales, concurrencia multiusuario ni un backend. No se afirma una certificación de accesibilidad ni una mejora cuantificada de velocidad.

## Fases y siguiente paso

1. **Frontend local implementado y verificado:** registro → asignación → investigación → resolución → historial, con vistas y exportación.
2. **Backend pendiente:** acordar identidad y permisos, taxonomía y SLA; definir API, persistencia central y autoridad de las transiciones.
3. **Integración pendiente:** transporte HTTP, carga/error/reintento, concurrencia y conflictos de edición, generación de ID y reloj del servidor, auditoría verificable y pruebas de contrato.
4. **Capacidades posteriores:** adjuntos con controles de acceso y tratamiento seguro, notificaciones reales, búsqueda a escala y política de retención.

Antes de usar datos reales: el servidor debe determinar actor, fechas, permisos y cambios admitidos; el navegador no puede ser la fuente de autoridad. No hay un backend ni una autenticación real implementados en esta entrega.

## Perfiles aplicados

Se leyeron completos AI Dev Workspace 0.1.0 y Angular Cybersecurity Frontend Engineer 0.1.0, y las referencias de entregables y patrones de validación, desde la revisión `2c2f4a31917e77fa43dbc2587ed7eed12926935c` de [herramientas-de-IA](https://github.com/Aquatimez1991/herramientas-de-IA/tree/2c2f4a31917e77fa43dbc2587ed7eed12926935c). Se aplicaron como perfiles de trabajo; no se instalaron como servicios autónomos.
