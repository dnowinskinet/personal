/**
 * The tower, drawn as a cutaway.
 *
 * SVG rather than a canvas renderer: no dependency, theme-aware through `currentColor`, crisp at any
 * size, and it leaves the Gate C renderer decision completely open. R8's visual ceiling is stylized
 * modular 2D, and flat vector shapes are the cheapest honest version of that.
 *
 * Follows R3's fixed-width vertical section — constant building width, ordinary floors on a constant
 * pitch, a double-height showroom at the street hinge, and continuous personnel and freight cores.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import type { FloorDefinition, FloorView } from '../sim/index';
import {
  BUILDING_LEFT,
  BUILDING_RIGHT,
  FREIGHT_CORE,
  INTERIOR_LEFT,
  INTERIOR_RIGHT,
  PERSONNEL_CORE,
  crateMarks,
  staffMarks,
  towerLayout,
  windowMarks,
  type StaffMark,
} from './tower-layout';

interface FloorDraw {
  readonly id: string;
  readonly definition: FloorDefinition;
  readonly name: string;
  readonly levelLabel: string;
  readonly y: number;
  readonly height: number;
  readonly midY: number;
  readonly owned: boolean;
  readonly isStreet: boolean;
  readonly isBelowGround: boolean;
  readonly staffable: boolean;
  readonly staff: number;
  readonly capacity: number;
  readonly sinkLabel: string;
  readonly people: readonly StaffMark[];
  readonly windows: readonly StaffMark[];
  readonly crates: readonly StaffMark[];
  readonly blockedBy: string | null;
  readonly affordable: boolean;
  readonly cost: number;
  readonly canAdd: boolean;
  readonly canRemove: boolean;
  readonly isTunnel: boolean;
  readonly isBedrock: boolean;
}

@Component({
  selector: 'oi-tower',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tower-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TowerViewComponent {
  readonly floors = input.required<readonly FloorView[]>();
  /** Parts currently on the shelf, drawn as crates on the lowest owned basement floor. */
  readonly partsOnHand = input<number>(0);
  /** Staff not yet placed, which decides whether the + controls are live. */
  readonly unplaced = input<number>(0);

  readonly adjust = output<{ floorId: string; delta: number }>();
  readonly purchase = output<FloorDefinition>();

  readonly buildingLeft = BUILDING_LEFT;
  readonly buildingRight = BUILDING_RIGHT;
  readonly buildingWidth = BUILDING_RIGHT - BUILDING_LEFT;
  readonly personnelCore = PERSONNEL_CORE;
  readonly freightCore = FREIGHT_CORE;
  readonly interiorLeft = INTERIOR_LEFT;
  readonly interiorRight = INTERIOR_RIGHT;

  readonly layout = computed(() => towerLayout(this.floors()));
  readonly viewBox = computed(() => `0 0 ${this.layout().width} ${this.layout().height}`);

  /** Y of the deepest floor, for drawing the earth below everything. */
  readonly earthHeight = computed(() => this.layout().height - this.layout().groundY);

  /** Where the ramp meets the building, drawn only once B1 exists. */
  readonly rampVisible = computed(() =>
    this.layout().floors.some((floor) => floor.isBelowGround && floor.view.owned)
  );

  readonly draw = computed<readonly FloorDraw[]>(() => {
    const layout = this.layout();
    const unplaced = this.unplaced();
    const parts = this.partsOnHand();

    // Crates go on the lowest owned basement floor — that is where the stores would be.
    const stores = [...layout.floors]
      .filter((floor) => floor.isBelowGround && floor.view.owned)
      .pop();

    return layout.floors.map((floor) => {
      const { definition } = floor.view;
      const staffable = floor.view.owned && definition.capacity > 0;
      return {
        id: definition.id,
        definition,
        name: definition.name,
        levelLabel: this.levelLabel(definition.level),
        y: floor.y,
        height: floor.height,
        midY: floor.midY,
        owned: floor.view.owned,
        isStreet: floor.isStreet,
        isBelowGround: floor.isBelowGround,
        staffable,
        staff: floor.view.staff,
        capacity: definition.capacity,
        sinkLabel: this.sinkLabel(floor.view.sink),
        people: staffable ? staffMarks(floor, floor.view.staff) : [],
        windows: floor.view.owned && !floor.isBelowGround ? windowMarks(floor) : [],
        crates: stores !== undefined && stores.view.definition.id === definition.id
          ? crateMarks(floor, parts)
          : [],
        blockedBy: floor.view.blockedBy,
        affordable: floor.view.affordable,
        cost: definition.cost,
        canAdd: staffable && floor.view.staff < definition.capacity && unplaced > 0,
        canRemove: staffable && floor.view.staff > 0,
        // Bedrock is where the building stops, not an obstacle you clear. Drawing it as a
        // tunnel implied it could be bought, which is the opposite of what it means.
        isTunnel: definition.obstruction !== null && definition.kind !== 'bedrock',
        isBedrock: definition.kind === 'bedrock',
      };
    });
  });

  add(floorId: string): void {
    this.adjust.emit({ floorId, delta: 1 });
  }

  remove(floorId: string): void {
    this.adjust.emit({ floorId, delta: -1 });
  }

  buy(definition: FloorDefinition): void {
    this.purchase.emit(definition);
  }

  money(value: number): string {
    return value.toLocaleString();
  }

  private levelLabel(level: number): string {
    if (level === 0) {
      return 'ST';
    }
    return level > 0 ? `+${level}` : `B${-level}`;
  }

  private sinkLabel(sink: string | null): string {
    switch (sink) {
      case 'research':
        return 'research';
      case 'production':
        return 'production';
      case 'market':
        return 'market';
      default:
        return '';
    }
  }
}
