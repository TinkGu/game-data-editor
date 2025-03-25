import { page } from './page-loader';

export const RouteEditorAbility = page({
  path: '',
  name: '特性',
  component: () => import('../pages/ability'),
});

export const routeConfigs = [RouteEditorAbility];
