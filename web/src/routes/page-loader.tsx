import { navigate, NavigateOpts, QueryObject } from '@tinks/xeno/navigate';
import asyncComponent, { AsyncComponentOptions } from './async-component';

type PageOptions = AsyncComponentOptions & {
  path: string;
  name?: string;
  exact?: boolean;
};

/** 根据页面配置，返回一个 inline component */
function renderPage(options: PageOptions) {
  const Page = asyncComponent(options);
  return (props: any) => {
    if (options.path.startsWith('editor')) {
      return <Page {...props} />;
    } else {
      return (
        <div className="game-app-root">
          <Page {...props} />
        </div>
      );
    }
  };
}

const BASE_PATH = import.meta.env.BASE_URL;

/** 路由配置函数 */
export function page<Query extends QueryObject = any>(options: PageOptions) {
  const { path, exact = true } = options;
  const finalPath = `${BASE_PATH}${path}`;

  function innerNavigate(query?: Partial<Query>, opts?: Omit<NavigateOpts, 'query' | 'url'>) {
    const q: any = query || {};
    if (opts?.isNewTab) {
      q.isNewTab = 1;
    }
    navigate({
      url: finalPath,
      query: q,
      ...opts,
    });
  }

  return {
    path: finalPath,
    name: options.name,
    navigate: innerNavigate,
    route: {
      exact,
      path: finalPath,
      render: renderPage(options),
    },
  };
}
