import { InjectionToken } from '@angular/core';
import { GRIFT_OS_COPY } from '../content/game-copy';
import { EmpireRendererRegistration } from '../host/empire-renderer-contract';
import {
  InfluenceEmpireRendererComponent,
  InfluenceEmpireRendererView,
} from './influence/renderer/influence-empire-renderer';

export type EmpireId = 'influence';

const EMPIRE_RENDERERS: Readonly<Record<EmpireId, EmpireRendererRegistration>> = {
  influence: {
    id: 'influence',
    component: InfluenceEmpireRendererComponent,
    createInputs: (hostView, dispatch) => {
      const view: InfluenceEmpireRendererView = {
        ...hostView,
        copy: GRIFT_OS_COPY,
      };

      return { view, dispatch };
    },
  },
};

export function empireRendererFor(empireId: EmpireId): EmpireRendererRegistration {
  return EMPIRE_RENDERERS[empireId];
}

export const ACTIVE_EMPIRE_RENDERER = new InjectionToken<EmpireRendererRegistration>(
  'ACTIVE_EMPIRE_RENDERER',
  { factory: () => empireRendererFor('influence') }
);
