import { render } from 'react-dom';
import Routes from './routes';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister();
  });
}

render(<Routes />, document.getElementById('root'));
