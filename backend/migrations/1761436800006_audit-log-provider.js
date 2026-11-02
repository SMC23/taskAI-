/**
 * La capa de IA soporta varios proveedores:
 *   - provider: qué proveedor atendió la llamada (anthropic, gemini...).
 *     Las filas existentes se marcan como 'anthropic', el único proveedor hasta ahora.
 *   - estimated_cost_usd pasa a admitir NULL: si el modelo no tiene precio conocido
 *     se registra null en lugar de inventar un coste.
 */

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.addColumn('ai_audit_log', {
    provider: { type: 'varchar(50)', notNull: true, default: 'anthropic' },
  });
  // El default solo sirve para rellenar las filas existentes: a partir de ahora es obligatorio
  pgm.alterColumn('ai_audit_log', 'provider', { default: null });

  pgm.alterColumn('ai_audit_log', 'estimated_cost_usd', { notNull: false, default: null });

  pgm.createIndex('ai_audit_log', ['provider', 'model']);
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropIndex('ai_audit_log', ['provider', 'model']);
  pgm.sql('UPDATE ai_audit_log SET estimated_cost_usd = 0 WHERE estimated_cost_usd IS NULL');
  pgm.alterColumn('ai_audit_log', 'estimated_cost_usd', { notNull: true, default: 0 });
  pgm.dropColumn('ai_audit_log', 'provider');
};
