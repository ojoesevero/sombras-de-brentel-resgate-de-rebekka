import { QuestsDataMap, QuestNode } from '../types/game.types';

export type QuestStatusType = 'locked' | 'active' | 'completed' | 'failed';

/**
 * [INFRAESTRUTURA EXPERIMENTAL]
 * Grafo de missões em TypeScript.
 * Mantido desacoplado do fluxo executável da fundação mínima.
 */
export class QuestGraph {
  public quests: QuestsDataMap;

  constructor(initialQuests: QuestsDataMap = {}) {
    this.quests = JSON.parse(JSON.stringify(initialQuests));
  }

  public loadQuests(questsData: QuestsDataMap): void {
    this.quests = JSON.parse(JSON.stringify(questsData));
  }

  public getQuest(questId: string): QuestNode | null {
    return this.quests[questId] || null;
  }

  public getStatus(questId: string): QuestStatusType {
    return this.quests[questId]?.status || 'locked';
  }

  public isCompleted(questId: string): boolean {
    return this.getStatus(questId) === 'completed';
  }

  public isActive(questId: string): boolean {
    return this.getStatus(questId) === 'active';
  }

  public setStatus(questId: string, status: QuestStatusType): boolean {
    if (!this.quests[questId]) {
      this.quests[questId] = {
        id: questId,
        title: questId,
        description: 'Descrição provisória',
        status
      };
      return true;
    }
    this.quests[questId].status = status;
    return true;
  }

  public advance(questId: string, nextStatus: QuestStatusType): boolean {
    return this.setStatus(questId, nextStatus);
  }

  public serialize(): QuestsDataMap {
    return JSON.parse(JSON.stringify(this.quests));
  }

  public deserialize(data: QuestsDataMap | null | undefined): void {
    if (data && typeof data === 'object') {
      this.quests = JSON.parse(JSON.stringify(data));
    }
  }

  public reset(): void {
    for (const key of Object.keys(this.quests)) {
      this.quests[key].status = 'locked';
    }
    const firstKey = Object.keys(this.quests)[0];
    if (firstKey) {
      this.quests[firstKey].status = 'active';
    }
  }
}
