import { Ticket, TicketKind, Priority, TicketStatus, PRIORITY_HOURS } from './ticket.model';

// Demostración sintética. .example es un dominio reservado y no se consulta.
export function createDemoTickets(now = Date.now()): Ticket[] {
  const rows: [string, TicketKind, string, Priority, TicketStatus, string, number, string, string][] = [
    ['Campaña de phishing dirigida al área de Finanzas', 'Incidente', 'Phishing', 'Crítica', 'En análisis', 'ana', 2.5, 'María López', 'Correo corporativo · Finanzas'],
    ['Actividad inusual en cuenta privilegiada', 'Incidente', 'Identidad y accesos', 'Crítica', 'Nueva', 'diego', 4.8, 'Jorge Salas', 'AD · cuenta svc-backup'],
    ['Solicitud de acceso VPN para proveedor externo', 'Solicitud', 'Identidad y accesos', 'Alta', 'En análisis', 'lucia', 8, 'Patricia Ríos', 'VPN corporativa'],
    ['Vulnerabilidad detectada en servidor de aplicaciones', 'Incidente', 'Vulnerabilidades', 'Alta', 'En espera', 'carlos', 15, 'Luis Paredes', 'SRV-APP-02'],
    ['Revisión de reglas de firewall de producción', 'Solicitud', 'Redes y perímetro', 'Media', 'Nueva', '', 5, 'Roberto Díaz', 'Firewall · segmento de producción'],
    ['Alerta de malware en estación de trabajo', 'Incidente', 'Malware', 'Alta', 'En análisis', 'ana', 10, 'Elena Castro', 'WKST-DEMO-042'],
    ['Evaluación de seguridad de nueva aplicación', 'Solicitud', 'Consultoría de seguridad', 'Media', 'En espera', 'carlos', 30, 'Gabriel Ruiz', 'Portal de proveedores'],
    ['Habilitación de segundo factor de autenticación', 'Solicitud', 'Identidad y accesos', 'Baja', 'Nueva', 'lucia', 22, 'Sofía León', 'Cuenta corporativa de demostración'],
    ['Posible exposición de información en carpeta compartida', 'Incidente', 'Protección de datos', 'Alta', 'En análisis', 'diego', 6, 'Andrés Núñez', 'Repositorio compartido · DEMO'],
    ['Análisis de correo sospechoso reportado por usuario', 'Incidente', 'Phishing', 'Media', 'En análisis', 'ana', 20, 'Valeria Paz', 'Buzón de usuario · DEMO'],
    ['Revocación de accesos por baja de colaborador', 'Solicitud', 'Identidad y accesos', 'Alta', 'Resuelta', 'lucia', 32, 'Recursos Humanos', 'Directorio corporativo'],
    ['Validación de certificado del portal interno', 'Solicitud', 'Redes y perímetro', 'Baja', 'Cerrada', 'carlos', 54, 'Mesa de tecnología', 'intranet.example'],
    ['Bloqueo de dominio reportado como sospechoso', 'Incidente', 'Phishing', 'Alta', 'Resuelta', 'ana', 60, 'María López', 'Gateway de correo'],
    ['Revisión de permisos sobre repositorio de código', 'Solicitud', 'Identidad y accesos', 'Media', 'Cerrada', 'lucia', 80, 'Equipo de desarrollo', 'Repositorio de demostración'],
    ['Contención de ejecución de archivo no autorizado', 'Incidente', 'Malware', 'Alta', 'Resuelta', 'diego', 100, 'Operaciones', 'WKST-DEMO-017'],
    ['Análisis de escaneo de puertos en red interna', 'Incidente', 'Redes y perímetro', 'Media', 'Cerrada', 'carlos', 120, 'Centro de monitoreo', 'Segmento de laboratorio'],
    ['Asesoría para clasificación de información', 'Solicitud', 'Protección de datos', 'Baja', 'Resuelta', 'ana', 142, 'Equipo legal', 'Documentación de demostración'],
    ['Actualización de política de acceso remoto', 'Solicitud', 'Consultoría de seguridad', 'Media', 'Cerrada', 'lucia', 152, 'Operaciones', 'Política de laboratorio'],
  ];
  return rows.map((r, i) => {
    const [title, kind, category, priority, status, assigneeId, age, requester, asset] = r;
    const createdAt = new Date(now - age * 3600000).toISOString();
    const closed = status === 'Resuelta' || status === 'Cerrada';
    const updatedAt = new Date(now - Math.max(0.1, age - (closed ? 6 : 1)) * 3600000).toISOString();
    const id = `CYB-${1048 - i}`;
    const events = [{ id: `${id}-1`, at: createdAt, actor: requester, action: 'Ticket registrado', detail: `${kind} de ${category.toLowerCase()} registrado con prioridad ${priority.toLowerCase()}.` }];
    if (status !== 'Nueva') events.push({ id: `${id}-2`, at: updatedAt, actor: 'Equipo de ciberseguridad', action: closed ? 'Atención finalizada' : 'Estado actualizado', detail: closed ? 'Caso ficticio atendido. Validación y acciones de cierre registradas para demostración.' : `El ticket pasó a ${status.toLowerCase()} para su seguimiento.` });
    return {
      id, title, kind, category, priority, status, assigneeId, requester, asset,
      requesterEmail: `solicitante${i + 1}@organizacion.example`,
      description: i === 0
        ? 'El área de Finanzas reportó correos que suplantan a un proveedor y solicitan actualizar datos bancarios. Se requiere analizar las cabeceras, identificar destinatarios y coordinar las acciones de contención. Este es un escenario ficticio de demostración.'
        : `${title}. El solicitante requiere evaluación y seguimiento del equipo de ciberseguridad sobre el activo indicado. Los datos de este caso son ficticios y se utilizan únicamente para demostrar el flujo de atención.`,
      evidence: i === 0 ? 'Indicador de demostración: actualizacion-pagos.example\nSe reportan cabeceras de correo pendientes de validar. No se adjuntan archivos reales.' : '',
      createdAt, updatedAt, dueAt: new Date(Date.parse(createdAt) + PRIORITY_HOURS[priority] * 3600000).toISOString(),
      resolvedAt: closed ? updatedAt : null, events,
    };
  });
}
