import React from 'react';
import { getErrorMsg } from '@tinks/xeno';
import cx from 'classnames';
import { Popup } from '../popup';
import './styles.scss';

const prefix = 'g-toast';
let lastCleaner: (() => void) | null;
let lastTimer: NodeJS.Timeout;

export interface ToastProps {
  /**
   * 消息文本，可以传入字符串，一组字符串（多行）
   * @type string | string[] | React.ReactNode
   */
  message: string | string[] | React.ReactNode;
  /**
   * 持续显示时间，毫秒，
   * @default 3000
   */
  wait?: number;
  /**
   * 是否展示蒙层
   * @default false
   */
  mask?: boolean;
  /**
   * 消息显示位置
   * @default 'center'
   */
  position?: 'top' | 'center';
  /**
   * 是否自动换行，默认换行
   * @default true
   */
  autoBreakLine?: boolean;
}

const clearToast = () => {
  if (!lastCleaner) {
    return;
  }

  clearTimeout(lastTimer);
  lastCleaner();
  lastCleaner = null;
};

/**
 * 通用 toast 组件
 * 默认换行，如果设置 message 不换行，可以通过设置 `autoBreakLine=false`；如果多条 message 多行展示，请传入数组
 */
export function toast({ message, wait = 3000, mask = false, position = 'center', autoBreakLine = true }: ToastProps) {
  clearToast();
  const msgCls = autoBreakLine ? '' : `${prefix}-msg-nowrap`;
  const destroy = Popup.show({
    mask,
    nonePointerEvents: true,
    wrapperClassName: `${prefix}-wrapper`,
    className: cx(prefix, position === 'top' && `${prefix}-top`),
    content: () => {
      if (typeof message === 'string') {
        return <p className={msgCls}>{message}</p>;
      }

      if (Array.isArray(message)) {
        return (message as string[]).map((txt, i) => (
          <p key={i} className={msgCls}>
            {txt}
          </p>
        ));
      }

      return message || null;
    },
  });

  lastTimer = setTimeout(destroy, wait);
  lastCleaner = destroy;

  return clearToast;
}

toast.info = (message: ToastProps['message']) => toast({ message });
toast.error = (err: any, defaultMsg?: ToastProps['message']) => toast({ message: getErrorMsg(err) || defaultMsg || '出错了' });
