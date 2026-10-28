/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const up = (pgm) => {
  pgm.createType('task_priority', ['low', 'medium', 'high']);
  pgm.createType('task_status', ['todo', 'in_progress', 'completed']);

  pgm.createTable('tasks', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Si se borra el proyecto, se borran sus tareas
    project_id: { type: 'uuid', notNull: true, references: 'projects', onDelete: 'CASCADE' },
    title: { type: 'varchar(255)', notNull: true },
    description: { type: 'text' },
    priority: { type: 'task_priority', notNull: true, default: 'medium' },
    status: { type: 'task_status', notNull: true, default: 'todo' },
    order_index: { type: 'integer', notNull: true, default: 0, check: 'order_index >= 0' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Acelera "tareas de este proyecto en su orden"
  pgm.createIndex('tasks', ['project_id', 'order_index']);

  pgm.createTrigger('tasks', 'tasks_set_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'set_updated_at',
  });
};

/** @param pgm {import('node-pg-migrate').MigrationBuilder} */
export const down = (pgm) => {
  pgm.dropTable('tasks');
  pgm.dropType('task_status');
  pgm.dropType('task_priority');
};
