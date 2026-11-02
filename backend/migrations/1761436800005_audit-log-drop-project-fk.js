/**
 * La auditoría de IA se escribe ANTES de que exista el proyecto (la llamada a Claude
 * ocurre fuera de la transacción que lo crea) y también cuando la IA falla y el
 * proyecto nunca llega a crearse. Una FK hacia projects lo impediría, así que
 * project_id pasa a ser un uuid de referencia sin FK: el registro queda intacto
 * para siempre, aunque el proyecto se borre o no exista.
 */

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.dropConstraint('ai_audit_log', 'ai_audit_log_project_id_fkey');
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  // Limpia referencias huérfanas para poder restaurar la FK
  pgm.sql('UPDATE ai_audit_log SET project_id = NULL WHERE project_id NOT IN (SELECT id FROM projects)');
  pgm.addConstraint('ai_audit_log', 'ai_audit_log_project_id_fkey', {
    foreignKeys: { columns: 'project_id', references: 'projects', onDelete: 'SET NULL' },
  });
};
