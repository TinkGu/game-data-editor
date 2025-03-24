import React from 'react';

const noop = () => null;

type LazyComponent = () => Promise<any>;
export interface AsyncComponentOptions {
  component: LazyComponent; // 主体组件
  loading?: React.FunctionComponent; // loading 渲染的组件
  fallback?: React.FunctionComponent<{ errmsg?: string }>; // 组件加载失败显示的组件
}

/**
 * 异步引入组件
 */
function asyncImport(component: LazyComponent) {
  return component().then((res) => res.default);
}

/**
 * 延迟加载
 */
export default function asyncComponent(options: AsyncComponentOptions) {
  const { loading: Loading = noop, component, fallback: Fallback = noop } = options || {};

  let theAsyncComponent: Promise<React.FunctionComponent>;

  return class PLoader extends React.PureComponent<
    any,
    {
      BodyComponent: React.FunctionComponent;
      isLoading: boolean;
      error: boolean;
      errorInfo: string;
    }
  > {
    constructor(props: any) {
      super(props);
      theAsyncComponent = asyncImport(component);
      this.state = {
        BodyComponent: noop,
        isLoading: true,
        error: false,
        errorInfo: '',
      };
    }

    async componentDidMount() {
      try {
        const BodyComponent = await theAsyncComponent;
        this.setState({
          BodyComponent,
        });
      } catch (err) {
        console.error(err.stack, JSON.stringify(err.message));
        this.setState({
          error: true,
          errorInfo: JSON.stringify(err.message || '哦，出错了！'),
        });
      } finally {
        this.setState({
          isLoading: false,
        });
      }
    }

    static getDerivedStateFromError(err: Error) {
      console.error(err);
      return {
        error: true,
        errorInfo: err?.message || '哦，出错了！',
      };
    }

    render() {
      const { isLoading, BodyComponent, error, errorInfo } = this.state;
      if (isLoading) {
        return <Loading />;
      }

      if (error) {
        return <Fallback errmsg={errorInfo} />;
      }
      return <BodyComponent {...this.props} />;
    }
  };
}
