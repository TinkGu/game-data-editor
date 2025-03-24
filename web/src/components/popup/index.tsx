import React from 'react';
import cx from 'classnames';
import { withPortal } from '../portal';
import './styles.scss';

const prefix = 'g-popup';
const noop = () => null;
const empty = {};

export interface PopupProps {
  /** 关闭浮层回调 */
  onDestroy?: () => void;
  /**
   * 浮层包裹的主体内容，仅在以 JSX 形式调用 Popup 时有效
   * @type `React.ReactNode | ((onDestroy: () => void) => React.ReactNode)`
   */
  children?: React.ReactNode | ((onDestroy: () => void) => React.ReactNode);
  /** 最外层样式，相当于覆盖 :global g-popup */
  wrapperClassName?: string;
  /** 浮层主体样式，相当于覆盖 :global g-popup-inner */
  className?: string;
  /**
   * 是否展示背景蒙层
   * @default true
   */
  mask?: boolean;
  /**
   * 点击蒙层是否可以关闭
   * @default false
   */
  maskClosable?: boolean;
  style?: React.CSSProperties | undefined;
  /**
   * 是否点击穿透
   * @default false
   */
  nonePointerEvents?: boolean;
}

/** 通用 Popup */
export function BasePopup({
  onDestroy,
  wrapperClassName = '',
  className = '',
  mask = true,
  maskClosable = false,
  children = null,
  nonePointerEvents,
  style = empty,
}: PopupProps) {
  return (
    <div className={cx(prefix, wrapperClassName, { [`${prefix}-pass`]: nonePointerEvents })}>
      {!!mask && <div className={cx(`${prefix}-mask`)} onClick={maskClosable ? onDestroy : noop}></div>}
      <div className={cx(`${prefix}-inner`, className)} style={style}>
        {typeof children === 'function' ? children(onDestroy!) : children}
      </div>
    </div>
  );
}

/**
 * 除支持直接渲染 <Popup /> 外
 * 还支持两种命令式调用：
 * - show，马上弹出一个 popup，并返回销毁方法
 * ```
 * const destroy = Popup.show({
 *   onDestroy: func, // 关闭时回调
 *   content: (onDestroy: func) => ReactNode, // 弹窗主体
 *   ...popupProps, // 其它 popup props
 * })
 * ```
 *
 * - create，创建一个对象 x，并返回 x.show，x.destroy 方法
 * ```
 * const popup = Popup.create()
 * popup.show({ onDestroy: func, content: func | ReactNode })
 * popup.destroy()
 * ```
 */
export const Popup = withPortal<PopupProps>(BasePopup);
