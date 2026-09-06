/**
 * Definições e Contratos de Tipos do Projeto Sombras de Brentel.
 * Todas as tipagens são estritas, sem uso de any ou casts arbitrários.
 */

/**
 * Constantes de calibração provisória de balanceamento.
 * Não representam números canônicos finais.
 */
export interface ProvisionalBalance {
  readonly BASE_HP: number;
  readonly BASE_ATTACK: number;
  readonly BASE_DEFENSE: number;
  readonly BASE_RESOURCE: number;
  readonly MAX_RESOURCE: number;
  readonly RESOURCE_COST_SKILL: number;
  readonly DAMAGE_VARIANCE: number;
  readonly RESOURCE_GAIN_ON_HIT: number;
  readonly RESOURCE_GAIN_ON_ATTACK: number;
}

export const PROVISIONAL_BALANCE: ProvisionalBalance = {
  BASE_HP: 120,
  BASE_ATTACK: 18,
  BASE_DEFENSE: 8,
  BASE_RESOURCE: 0,
  MAX_RESOURCE: 100,
  RESOURCE_COST_SKILL: 50,
  DAMAGE_VARIANCE: 0.1,
  RESOURCE_GAIN_ON_HIT: 15,
  RESOURCE_GAIN_ON_ATTACK: 10
} as const;

/**
 * Configuração de instanciação de Combatente.
 */
export interface CombatantConfig {
  id: string;
  name: string;
  maxHp?: number;
  hp?: number;
  attack?: number;
  defense?: number;
  resource?: number;
  maxResource?: number;
  isPlayer?: boolean;
}

/**
 * Snapshot serializável do estado do combatente.
 */
export interface CombatantState {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  resource: number;
  maxResource: number;
  isPlayer: boolean;
}

export interface AttackResult {
  damage: number;
  targetDied: boolean;
}

export interface SkillResult {
  success: boolean;
  damage: number;
  targetDied: boolean;
  reason?: string;
}

/**
 * Máquina de estados finita do combate em turnos.
 */
export type BattleStateType =
  | 'NOT_STARTED'
  | 'PLAYER_TURN'
  | 'ENEMY_TURN'
  | 'EXECUTING_ACTION'
  | 'VICTORY'
  | 'DEFEAT'
  | 'FLED';

export const BattleState: Record<BattleStateType, BattleStateType> = {
  NOT_STARTED: 'NOT_STARTED',
  PLAYER_TURN: 'PLAYER_TURN',
  ENEMY_TURN: 'ENEMY_TURN',
  EXECUTING_ACTION: 'EXECUTING_ACTION',
  VICTORY: 'VICTORY',
  DEFEAT: 'DEFEAT',
  FLED: 'FLED'
} as const;

export type TurnAction = 'attack' | 'skill' | 'defend' | 'flee' | 'item';

export interface TurnActionPayload {
  targetIndex?: number;
  itemId?: string;
}

export interface TurnActionResult {
  success: boolean;
  action?: TurnAction | 'flee_failed';
  target?: string;
  damage?: number;
  targetDied?: boolean;
  resourceGained?: number;
  itemId?: string;
  battleState?: BattleStateType;
  reason?: string;
}

export interface EnemyActionLog {
  enemyName: string;
  damage: number;
  playerHpRemaining: number;
}

/**
 * Dados para transporte entre cenas de exploração e combate.
 */
export interface SceneTransitionData {
  playerData?: CombatantState | null;
  spawnPoint?: { x: number; y: number };
}

/**
 * Ações lógicas do InputService.
 */
export type InputAction =
  | 'UP'
  | 'DOWN'
  | 'LEFT'
  | 'RIGHT'
  | 'CONFIRM'
  | 'CANCEL'
  | 'MENU'
  | 'ACTION_1'
  | 'ACTION_2';

export interface InputKeyEvent {
  action?: InputAction;
  key: string;
  code: string;
}

export type EventCallback<T = unknown> = (payload?: T) => void;

/**
 * Contratos de estruturas de dados JSON desacopladas.
 */
export interface TestItemDefinition {
  id: string;
  name: string;
  type: 'consumable' | 'equipment';
  value: number;
  healHp?: number;
  addResource?: number;
  description: string;
}

export type ItemsDataMap = Record<string, TestItemDefinition>;

export interface TrainingTargetDefinition {
  id: string;
  name: string;
  maxHp: number;
  hp: number;
  attack: number;
  defense: number;
  exp: number;
  gold: number;
}

export type EnemiesDataMap = Record<string, TrainingTargetDefinition>;

export interface DialogueNode {
  speaker: string;
  text: string;
}

export type DialoguesDataMap = Record<string, DialogueNode[]>;

export interface QuestNode {
  id: string;
  title: string;
  description: string;
  status: 'locked' | 'active' | 'completed' | 'failed';
}

export type QuestsDataMap = Record<string, QuestNode>;

export interface MapPortalDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  targetScene: string;
}

export interface MapSceneConfig {
  bounds: { width: number; height: number };
  spawn: { x: number; y: number };
  portals: MapPortalDefinition[];
}

export type MapsDataMap = Record<string, MapSceneConfig>;

/**
 * Contrato para o driver de persistência.
 */
export interface IStorageDriver {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface SavePayload<T = unknown> {
  data: T;
  savedAt: string;
}
