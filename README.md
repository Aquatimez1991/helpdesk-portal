# Cyberdesk — ticketera de ciberseguridad

Reconstrucción del antiguo Helpdesk Portal como espacio de trabajo para un equipo de ciberseguridad. Esta fase implementa únicamente el frontend Angular: registra, prioriza, asigna y sigue incidentes y solicitudes con historial por ticket.

## Ejecutar

Requiere una versión de Node compatible con Angular 22: `^22.22.3`, `^24.15.0` o `>=26.0.0`. Entorno verificado: Node 24.19.0 y npm 11.17.0.

```powershell
npm.cmd ci
npm.cmd start
```

Abrir http://localhost:4200. No se requiere iniciar sesión: Ana Torres es una identidad ficticia de demostración.

```powershell
npm.cmd run build
npm.cmd run test:ci
npm.cmd run audit
npm.cmd run audit:prod
```

Las pruebas usan Chrome Headless. Si no se detecta Chrome en Windows:

```powershell
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm.cmd run test:ci
```

El build estático queda en `dist/helpdesk-portal/browser`. El servidor que lo aloje debe redirigir las rutas de la aplicación a `index.html`.

## Qué incluye

- Resumen operativo con totales y gráficos calculados desde los tickets locales.
- Bandeja unificada con búsqueda, filtros, ordenación, paginación y tablero por estado.
- Registro de incidentes y solicitudes, categorías, prioridades, solicitante, responsable, activo e indicadores.
- Detalle con contexto, notas, cambios de estado, reasignación, resolución y reapertura.
- Trazabilidad local de los cambios, con actor de demostración y fecha.
- Mis asignaciones, actividad del equipo y distribución de trabajo.
- Exportación CSV de resultados o del espacio completo, incluido el historial.
- Persistencia en el navegador, recuperación ante errores de almacenamiento y restablecimiento con confirmación.
- Diseño adaptable, navegación por teclado, gestión de foco y diálogos con Angular CDK.

## Alcance de los datos

Los 18 tickets iniciales y los cuatro analistas son ficticios. La interfaz identifica el modo de demostración. Se guardan hasta 500 tickets y 1000 eventos por ticket en `localStorage`, bajo `cyberdesk.demo.v1`.

Los objetivos de atención son ilustrativos; no constituyen un SLA aprobado. Las fechas de pantalla y el nombre de la exportación usan la zona de Lima. El CSV conserva las marcas de tiempo de los registros en UTC.

Los datos no se comparten entre navegadores. El historial local puede alterarse desde las herramientas del navegador y no constituye una auditoría verificable. No introducir información institucional sensible.

## Arquitectura y continuidad

Consulta [docs/FRONTEND.md](docs/FRONTEND.md) para las decisiones técnicas, el modelo, las reglas de seguimiento, las evidencias y la siguiente fase.

Angular está actualizado a 22.2.3, con CLI/build/CDK 22.2.4 y TypeScript 6.0.3. El informe de migración y seguridad está en [docs/ACTUALIZACION-DEPENDENCIAS.md](docs/ACTUALIZACION-DEPENDENCIAS.md).

Se aplicaron los perfiles [AI Dev Workspace](https://github.com/Aquatimez1991/herramientas-de-IA/blob/2c2f4a31917e77fa43dbc2587ed7eed12926935c/agentes/ai-dev-workspace/AGENTE.md) y [Angular Cybersecurity Frontend Engineer](https://github.com/Aquatimez1991/herramientas-de-IA/blob/2c2f4a31917e77fa43dbc2587ed7eed12926935c/agentes/angular-cybersecurity-frontend-engineer/AGENTE.md), junto con sus referencias pertinentes.

El backend, la identidad real, la autorización, los archivos adjuntos y las notificaciones externas corresponden a una fase posterior.
