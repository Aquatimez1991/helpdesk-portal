# Actualización de Angular y dependencias

Fecha de verificación: 27 de octubre de 2026 (America/Lima).

Se actualizó el frontend de Cyberdesk por avisos de seguridad y fin de soporte de Angular 19. Los cambios anteriores de la reconstrucción se conservaron. La entrega se versiona junto al frontend en `dev-v1` y se integra en `main`.

## Versiones finales

| Componente | Antes | Ahora |
| --- | --- | --- |
| Angular Core, Common, Compiler, Forms, Router y Platform Browser | 19.2.6 | 22.2.3 |
| Angular CLI | 19.2.7 | 22.2.4 |
| Compilador de la app | build-angular 19.2.7 | @angular/build 22.2.4 |
| Angular CDK | 19.2.9 | 22.2.4 |
| TypeScript | 5.7.3 | 6.0.3 |
| Zone.js | 0.15.0 | 0.16.3 |
| PrimeIcons | 7.0.0 | 8.0.2 |
| Jasmine Core | 5.6.0 | 6.3.0 |
| Tipos de Jasmine | 5.1.7 | 6.0.0 |
| Tipos de Node | 18.19.86 | 24.19.2 |
| Reporter HTML de Karma/Jasmine | 2.1.0 | 2.3.0 |
| Vite transitivo | Rama antigua del compilador 19 | 8.3.5 |

RxJS 7.8.2 y tslib 2.8.1 se mantienen en sus versiones compatibles vigentes. También se actualizaron las dependencias transitivas corregibles dentro de sus rangos admitidos.

La versión de Node está declarada en package.json conforme a Angular 22: `^22.22.3 || ^24.15.0 || >=26.0.0`. Entorno usado: Windows, Node 24.19.0, npm 11.17.0 y Chrome Headless 156. Los tipos de Node siguen la rama 24 del entorno verificado.

## Migraciones y compatibilidad

1. Se aplicaron las migraciones oficiales por versión mayor: 19 → 20 → 21 → 22, alineando explícitamente los paquetes de cada etapa.
2. Se ejecutó la migración oficial `use-application-builder`. Build, servidor de desarrollo, extracción de traducciones y pruebas usan `@angular/build`; se retiró `@angular-devkit/build-angular` y su cadena de Webpack.
3. La migración de Angular 22 declaró `ChangeDetectionStrategy.Eager` en los componentes para conservar el comportamiento anterior. Se mantuvieron los diagnósticos estrictos del proyecto.
4. Se retiró `@angular/platform-browser-dynamic`, sin usos en la app y ya innecesario para el ejecutor de pruebas de Angular 22. Las pruebas usan BrowserTestingModule.
5. La CLI agregó `istanbul-lib-instrument` como dependencia explícita para el soporte de cobertura de Karma.
6. Se mantuvieron Karma/Jasmine y los escenarios existentes. Jasmine 7 produjo una incompatibilidad con el parche de Zone.js (`Cannot assign to read only property 'describe'`); la combinación final usa Jasmine 6.3.0 y tipos 6.0.0, con las 17 pruebas aprobadas.
7. TypeScript 7 no se instaló: Angular 22 requiere TypeScript 6. Se usan las versiones compatibles verificadas, no simplemente el mayor número publicado.

## Corrección de Vite

El paquete publicado `@angular/build@22.2.4` fija Vite 8.3.0. La auditoría detectó avisos en Vite 8.3.0–8.3.2. El mantenedor publica correcciones desde 8.3.3.

Se agregó un override limitado a ese intervalo:

```json
{
  "overrides": {
    "vite@>=8.3.0 <=8.3.2": "8.3.5"
  }
}
```

El override instala un parche corregido de la misma serie. No sustituye otras ramas de Vite ni modifica sus controles de acceso. Se comprobó con compilación de producción, servidor de desarrollo y recorrido funcional en navegador. Debe revisarse y retirarse cuando la dependencia del compilador ya resuelva una versión corregida por sí misma.

No se usó `npm audit fix --force`, ni se ignoraron conflictos de peers para instalar paquetes. Las correcciones restantes se aplicaron mediante `npm audit fix` dentro de los rangos compatibles.

## Auditoría comprobada

| Alcance | Críticas | Altas | Moderadas | Bajas | Total |
| --- | --- | --- | --- | --- | --- |
| Árbol inicial, incluido desarrollo | 5 | 37 | 25 | 5 | 72 |
| Árbol final, incluido desarrollo | 0 | 0 | 0 | 0 | 0 |
| Producción final, con --omit=dev | 0 | 0 | 0 | 0 | 0 |

Son entradas señaladas por npm audit en el árbol de dependencias, no un conteo de fallos explotables comprobados en la app. El resultado se refiere a los avisos conocidos disponibles durante la consulta; no equivale a una prueba de penetración.

Informes completos locales, ignorados por Git:

- `output/dependency-update/audit-before.json`.
- `output/dependency-update/audit-after-angular22.json`: estado intermedio que motivó las correcciones transitivas.
- `output/dependency-update/audit-after.json`.
- `output/dependency-update/audit-prod-after.json`.

## Verificación funcional y técnica

| Comprobación | Resultado |
| --- | --- |
| npm.cmd ci --no-audit --no-fund | Instalación limpia reproducible desde el archivo de bloqueo definitivo. |
| npm.cmd run build | Aprobado. Bundle inicial de 454.41 kB, dentro del aviso de 500 kB. |
| npm.cmd run test:ci | 17 de 17 pruebas aprobadas en Chrome Headless. |
| npm.cmd ls --depth=0 | Árbol directo sin conflictos de dependencias. |
| PrimeIcons 8 | Las 41 clases de iconos usadas por la app siguen disponibles. |
| Registro y validación | Ticket completo creado; formulario vacío rechazado sin generar registros. |
| Seguimiento | Cambios de estado, prioridad, responsable y notas visibles en la trazabilidad. |
| Resolución y recarga | Resolución documentada; estado e historial conservados al recargar. |
| Bandeja | Búsqueda con foco conservado, exportación CSV, vacío, filtros, paginación y tablero comprobados. |
| Restablecimiento | Cancelar conserva los datos; confirmar restaura los escenarios iniciales. |
| Vistas y adaptación | Mis asignaciones, actividad y equipo operativos; resumen y bandeja comprobados a 1440, 390 y 320 CSS px. |
| Ejecución y red | Sin pageerror ni peticiones HTTP externas durante el recorrido del frontend. |
| git diff --check | Sin errores de whitespace. |

El resultado del recorrido está en `output/dependency-update/browser-smoke.txt`; las capturas están en `output/playwright/`. Son evidencias locales de escenarios ficticios. La actualización no incorpora backend ni autenticación real.

Karma conserva algunas dependencias con avisos de obsolescencia de npm. No producen avisos de seguridad en la auditoría final. La migración opcional a Vitest no fue necesaria para este cambio.

## Comandos de mantenimiento

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd run test:ci
npm.cmd run audit
npm.cmd run audit:prod
```

La copia previa de los archivos está en `output/dependency-update/before/`, ignorada por Git. Las verificaciones se ejecutaron en el entorno local. La entrega de las ramas y el merge corresponde al flujo `dev-v1` → `main`.

## Fuentes primarias

- [Soporte y procedimiento de actualización de Angular](https://angular.dev/reference/releases).
- [Compatibilidad de Node, TypeScript y RxJS](https://angular.dev/reference/versions).
- [Guía oficial de actualización](https://angular.dev/update-guide).
- [Migración oficial del sistema de compilación](https://angular.dev/tools/cli/build-system-migration).
- [Aviso de Vite GHSA-rq7h-c2jc-7f22 y versiones corregidas](https://github.com/vitejs/vite/security/advisories/GHSA-rq7h-c2jc-7f22).
- [Aviso de Vite GHSA-9jrq-w75r-8gcw y versiones corregidas](https://github.com/vitejs/vite/security/advisories/GHSA-9jrq-w75r-8gcw).

Las versiones concretas y sus requisitos se contrastaron con los metadatos publicados en el registro npm.
