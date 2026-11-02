import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// La auditoría se simula: estos tests no necesitan PostgreSQL
vi.mock('../../src/models/aiAuditModel.js', () => ({ create: vi.fn().mockResolvedValue({}) }));

const aiAuditModel = await import('../../src/models/aiAuditModel.js');
const { generate } = await import('../../src/services/ai/taskGenerator.js');
const { setProviderForTesting } = await import('../../src/services/ai/providers/index.js');
const { aiTruncated } = await import('../../src/services/ai/errors.js');

const INPUT = {
  title: 'Lanzar mi portafolio',
  description: 'Quiero crear un portafolio web profesional para aplicar a pasantías.',
  userId: '11111111-1111-1111-1111-111111111111',
  projectId: '22222222-2222-2222-2222-222222222222',
};

const USAGE = { promptTokens: 400, completionTokens: 600 };

const VALID_TASKS = {
  tasks: [
    { title: 'Definir el alcance del portafolio', description: 'Elegir los proyectos a mostrar y el público objetivo.', priority: 'high' },
    { title: 'Diseñar la estructura y el estilo', description: 'Crear wireframes de inicio, proyectos y contacto.', priority: 'high' },
    { title: 'Publicar en un hosting', description: 'Desplegar en Vercel o Netlify con dominio propio.', priority: 'medium' },
  ],
};

/** Proveedor falso que cumple el contrato común. */
function fakeProvider(behavior) {
  return {
    name: 'fake',
    getModel: () => 'fake-model-1',
    generateStructured: vi.fn(async () => behavior()),
  };
}

const lastAudit = () => aiAuditModel.create.mock.calls.at(-1)[0];

describe('taskGenerator con un proveedor falso', () => {
  beforeEach(() => aiAuditModel.create.mockClear());
  afterEach(() => setProviderForTesting(null));

  it('JSON válido: devuelve las tareas en orden y audita success', async () => {
    const provider = fakeProvider(() => ({ text: JSON.stringify(VALID_TASKS), usage: USAGE, model: 'fake-model-1' }));
    setProviderForTesting(provider);

    const tasks = await generate(INPUT);

    expect(tasks).toHaveLength(3);
    expect(tasks.map((t) => t.orderIndex)).toEqual([0, 1, 2]);
    expect(tasks[0]).toMatchObject({ title: 'Definir el alcance del portafolio', priority: 'high' });

    // El proveedor recibe el contrato común: prompts + JSON Schema
    const call = provider.generateStructured.mock.calls[0][0];
    expect(call.systemPrompt).toContain('project manager');
    expect(call.userPrompt).toContain('<descripcion>Quiero crear');
    expect(call.jsonSchema.properties.tasks.type).toBe('array');

    expect(lastAudit()).toMatchObject({
      status: 'success',
      provider: 'fake',
      model: 'fake-model-1',
      projectId: INPUT.projectId,
      promptTokens: 400,
      completionTokens: 600,
      estimatedCostUsd: null, // modelo sin precio en pricing.js → null, nunca inventado
      errorMessage: null,
    });
  });

  it('JSON roto: 502 AI_INVALID_RESPONSE y audita error con tokens', async () => {
    setProviderForTesting(fakeProvider(() => ({ text: '{"tasks": [ {"title": "Algo"', usage: USAGE, model: 'fake-model-1' })));

    await expect(generate(INPUT)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_INVALID_RESPONSE',
      message: 'La IA devolvió una respuesta inválida: no es JSON válido',
    });
    expect(lastAudit()).toMatchObject({ status: 'error', provider: 'fake', promptTokens: 400, completionTokens: 600 });
    expect(lastAudit().errorMessage).toContain('JSON');
  });

  it('schema inválido: 502 con la lista de errores por campo', async () => {
    const bad = { tasks: [{ title: 'X', description: 'corta', priority: 'urgente' }] };
    setProviderForTesting(fakeProvider(() => ({ text: JSON.stringify(bad), usage: USAGE, model: 'fake-model-1' })));

    const err = await generate(INPUT).catch((e) => e);

    expect(err).toMatchObject({ statusCode: 502, code: 'AI_INVALID_RESPONSE' });
    expect(err.details.map((d) => d.field)).toEqual(
      expect.arrayContaining(['tasks.0.title', 'tasks.0.description', 'tasks.0.priority', 'tasks']),
    );
    expect(lastAudit()).toMatchObject({ status: 'error', promptTokens: 400 });
  });

  it('respuesta cortada: el proveedor lanza aiTruncated y se audita con sus tokens', async () => {
    setProviderForTesting(
      fakeProvider(() => {
        throw aiTruncated({ usage: { promptTokens: 400, completionTokens: 2048 }, model: 'fake-model-1' });
      }),
    );

    await expect(generate(INPUT)).rejects.toMatchObject({
      statusCode: 502,
      code: 'AI_INVALID_RESPONSE',
      message: 'La IA devolvió una respuesta inválida: la respuesta se cortó por exceder el límite de tokens',
    });
    expect(lastAudit()).toMatchObject({ status: 'error', completionTokens: 2048 });
  });

  it('un error inesperado del proveedor se convierte en AI_ERROR y también se audita', async () => {
    setProviderForTesting(
      fakeProvider(() => {
        throw new TypeError('algo explotó');
      }),
    );

    await expect(generate(INPUT)).rejects.toMatchObject({ statusCode: 500, code: 'AI_ERROR' });
    expect(lastAudit()).toMatchObject({ status: 'error', errorMessage: 'algo explotó' });
  });

  it('si la auditoría falla, no oculta el resultado de la IA', async () => {
    setProviderForTesting(fakeProvider(() => ({ text: JSON.stringify(VALID_TASKS), usage: USAGE, model: 'fake-model-1' })));
    aiAuditModel.create.mockRejectedValueOnce(new Error('BD caída'));
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    await expect(generate(INPUT)).resolves.toHaveLength(3);
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
