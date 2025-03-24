import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { BasePortal, BasePortalProps, PortalChildren } from './base';

const noop = () => null;

export interface PortalProps extends BasePortalProps {
  /** children 的别名，仅在命令式调用下有效 */
  content?: PortalChildren;
  rootId?: string;
}

function createContainer() {
  if (!document) return null;
  return document.createElement('div');
}

/**
 * 渲染组件至 root，参数见 BasePortal.propTypes
 */
export function Portal(props: PortalProps) {
  const target = useRef<HTMLElement | null>(null);
  if (!target.current) {
    target.current = createContainer();
  }

  useEffect(() => {
    const rootDom = document.body;
    if (rootDom && target.current) {
      rootDom.appendChild(target.current);
    }
    return () => {
      if (target.current) {
        target.current.remove && target.current.remove();
        target.current = null;
      }
    };
  }, []);

  if (!target.current) {
    return null;
  }

  return ReactDOM.createPortal(<BasePortal {...props} />, target.current);
}

/**
 * 命令式地展示一个 portal，返回销毁方法，参数见 BasePortal.propTypes
 * @param {ReactNode} content
 * @param {function} onDestroy
 * @returns {function} destroy
 */
Portal.show = (props: PortalProps) => {
  props = props || {};
  props.children = props.content;
  let div: HTMLElement | null = createContainer();

  const rootDom = props.rootId ? document.getElementById(props.rootId) : document.body;
  const destroy = () => {
    typeof props.onDestroy === 'function' && props.onDestroy();
    if (div) {
      ReactDOM.unmountComponentAtNode(div);
      try {
        div.remove && div.remove();
      } catch (err) {
        console.error('portal remove error', err);
      }
    }
    div = null;
  };

  if (!div) return destroy;
  if (!rootDom) return destroy;

  ReactDOM.render(<BasePortal {...props} onDestroy={destroy} />, rootDom.appendChild(div));
  return destroy;
};

export const hyperPortalCreate =
  <T extends PortalProps>(showFunc: (props: T) => () => void) =>
  () => {
    let _destroy: (() => void) | null = null;
    const destroy = () => {
      if (typeof _destroy === 'function') {
        _destroy();
        _destroy = null;
      }
    };

    const show = (props: T) => {
      destroy();
      _destroy = showFunc(props || {});
    };

    return {
      show,
      destroy,
    };
  };

/**
 * 命令式地创建一个 portal 对象，返回 show 和 destroy 两个方法
 */
Portal.create = hyperPortalCreate(Portal.show);

/** 自动注入的 props */
type InjectedProps = {
  onDestroy: () => void;
};

/** 被包裹的组件自身的 props */
type OwnProps<T> = Omit<T, keyof InjectedProps>;

/** withPortal 返回的对象 */
export interface PortalLike<T> {
  (props: OwnProps<T> & PortalProps): JSX.Element;
  show: (props: OwnProps<T> & PortalProps) => () => void;
  create: () => {
    show: (props: OwnProps<T> & PortalProps) => void;
    destroy: () => void;
  };
}

/**
 * 将任意一个组件转为 portal 形式，同时支持 jsx 声明式、命令式两种调用方式
 */
export function withPortal<U>(Component: React.ComponentType<OwnProps<U>>, defaultShowProps: U = {} as U): PortalLike<U> {
  function WithPortal(props: OwnProps<U> & PortalProps) {
    return <Portal onDestroy={props.onDestroy || noop}>{(onDestroy) => <Component onDestroy={onDestroy} {...props} />}</Portal>;
  }

  WithPortal.show = (props: OwnProps<U> & PortalProps) => {
    props = Object.assign({}, defaultShowProps, props);
    props.children = props.children || props.content;

    return Portal.show({
      onDestroy: props.onDestroy,
      content: (onDestroy) => <Component {...props} onDestroy={onDestroy} />,
    });
  };

  WithPortal.create = hyperPortalCreate(WithPortal.show);
  return WithPortal;
}
