/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.createType('ai_call_status', ['success', 'error']);

  pgm.createTable('ai_audit_log', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    // SET NULL: si el usuario borra un proyecto, el registro de coste se conserva
    project_id: { type: 'uuid', references: 'projects', onDelete: 'SET NULL' },
    // Modelo usado: necesario para calcular el coste, ya que cada modelo tiene otro precio
    model: { type: 'varchar(100)', notNull: true },
    prompt_tokens: { type: 'integer', notNull: true, default: 0 },
    completion_tokens: { type: 'integer', notNull: true, default: 0 },
    total_tokens: { type: 'integer', notNull: true, default: 0 },
    estimated_cost_usd: { type: 'decimal(10,6)', notNull: true, default: 0 },
    latency_ms: { type: 'integer' },
    status: { type: 'ai_call_status', notNull: true },
    error_message: { type: 'text' },
    // Sin updated_at: un registro de auditoría no se modifica nunca
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Acelera el dashboard de consumo: "llamadas de este usuario, las más recientes primero"
  pgm.createIndex('ai_audit_log', ['user_id', { name: 'created_at', sort: 'DESC' }]);
  pgm.createIndex('ai_audit_log', 'project_id');
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropTable('ai_audit_log');
  pgm.dropType('ai_call_status');
};
