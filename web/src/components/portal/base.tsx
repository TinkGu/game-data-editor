import React from 'react';

export type PortalFcChildren = (onDestroy: () => void) => React.ReactNode;
export type PortalChildren = React.ReactNode | PortalFcChildren;

const noop = () => null;

export interface BasePortalProps {
  children?: PortalChildren;
  /** 销毁时触发 */
  onDestroy?: () => void;
}

/**
 * 浮层主体内容
 */
export class BasePortal extends React.PureComponent<BasePortalProps> {
  render() {
    const { children = null, onDestroy = noop } = this.props;
    return typeof children === 'function' ? (children as PortalFcChildren)(onDestroy) : children;
  }
}
