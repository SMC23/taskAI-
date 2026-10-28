/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.createType('project_status', ['pending', 'active', 'completed']);

  pgm.createTable('projects', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Si se borra el usuario, se borran sus proyectos
    user_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    title: { type: 'varchar(200)', notNull: true },
    // Descripción en lenguaje natural que escribe el usuario y que se envía a la IA
    description: { type: 'text' },
    status: { type: 'project_status', notNull: true, default: 'pending' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Acelera "proyectos de este usuario, los más recientes primero"
  pgm.createIndex('projects', ['user_id', { name: 'created_at', sort: 'DESC' }]);

  pgm.createTrigger('projects', 'projects_set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'set_updated_at',
  });
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropTable('projects');
  pgm.dropType('project_status');
};
