import { Type } from '@angular/core';
import { InfluenceEmpireRendererComponent } from './influence/renderer/influence-empire-renderer';

export type EmpireId = 'influence';

const EMPIRE_RENDERERS: Readonly<Record<EmpireId, Type<unknown>>> = {
  influence: InfluenceEmpireRendererComponent,
};

export function empireRendererFor(empireId: EmpireId): Type<unknown> {
  return EMPIRE_RENDERERS[empireId];
}
