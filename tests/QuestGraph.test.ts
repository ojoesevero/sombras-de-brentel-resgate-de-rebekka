import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { QuestGraph } from '../src/core/QuestGraph';

describe('QuestGraph Unit Tests (TypeScript - Experimental)', () => {
  let graph: QuestGraph;

  beforeEach(() => {
    graph = new QuestGraph({
      test_quest_01: { id: 'test_quest_01', title: 'Missão Teste 1', description: 'Teste', status: 'active' },
      test_quest_02: { id: 'test_quest_02', title: 'Missão Teste 2', description: 'Teste', status: 'locked' }
    });
  });

  it('deve identificar o status inicial das missões', () => {
    assert.equal(graph.getStatus('test_quest_01'), 'active');
    assert.equal(graph.getStatus('test_quest_02'), 'locked');
    assert.equal(graph.isActive('test_quest_01'), true);
    assert.equal(graph.isCompleted('test_quest_01'), false);
  });

  it('deve avançar o status da missão para concluído', () => {
    graph.advance('test_quest_01', 'completed');
    assert.equal(graph.isCompleted('test_quest_01'), true);
    assert.equal(graph.getStatus('test_quest_01'), 'completed');
  });

  it('deve resetar todas as missões bloqueando-as e ativando a primeira', () => {
    graph.advance('test_quest_01', 'completed');
    graph.advance('test_quest_02', 'completed');

    graph.reset();

    assert.equal(graph.getStatus('test_quest_01'), 'active');
    assert.equal(graph.getStatus('test_quest_02'), 'locked');
  });

  it('deve serializar e desserializar o grafo de missões corretamente', () => {
    graph.advance('test_quest_01', 'completed');
    const serialized = graph.serialize();

    const newGraph = new QuestGraph();
    newGraph.deserialize(serialized);

    assert.equal(newGraph.isCompleted('test_quest_01'), true);
    assert.equal(newGraph.getStatus('test_quest_02'), 'locked');
  });
});
