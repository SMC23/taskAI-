/**
 * Configuración común: función que actualiza `updated_at` automáticamente.
 * gen_random_uuid() viene incluido en PostgreSQL 13+, no hace falta la extensión pgcrypto.
 */

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  // Trigger function: antes de cada UPDATE pone updated_at = now()
  pgm.createFunction(
    'set_updated_at',
    [],
    { returns: 'trigger', language: 'plpgsql', replace: true },
    `
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    `,
  );
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropFunction('set_updated_at', []);
};
