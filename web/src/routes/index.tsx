import { Switch, Route, Router } from 'react-router-dom';
import { getHistory } from '@tinks/xeno/navigate';
import { routeConfigs } from './router-config';

export default () => (
  <Router history={getHistory()}>
    <Switch>
      {routeConfigs.map((page) => (
        <Route key={page.path} {...page.route} />
      ))}
    </Switch>
  </Router>
);
