import { memo, ReactNode, useCallback, useMemo, useState } from 'react';
import cx from 'classnames';
import { useDebounceImmediateFn } from 'xeno/react';
import { BasePopup, PopupProps } from '../../popup';
import { PortalChildren } from '../../portal/base';
import { getBtnText, TYPE_MAP } from './util';
import { WarningIcon } from './warning-icon';
import './styles.scss';

const prefix = 'g-base-modal';
const halfScreenPrefix = 'g-half-screen-modal';
export interface ModalProps extends PopupProps {
  /** 是否展示 */
  visible?: boolean;
  /**
   * 弹窗外层 class，相当于覆盖 `g-base-modal`
   */
  wrapperClassName?: string;
  /**
   * 弹窗的 class，相当于覆盖 `g-base-modal-wrapper`
   */
  className?: string;
  /**
   * 弹窗标题
   */
  title?: ReactNode;
  /**
   * 弹窗内容，children 别名
   */
  content?: PortalChildren;
  /** 顶部 Icon */
  icon?: ReactNode;
  /**
   * 基础弹窗类型
   */
  type?: 'info' | 'confirm' | 'warning' | 'half-screen' | 'custom';
  /**
   * 确认按钮文案
   */
  okText?: string;
  /**
   * 确定按钮事件
   */
  onOk?: () => any;
  /**
   * 取消按钮文案
   */
  cancelText?: string;
  /**
   * 关闭按钮事件
   */
  onCancel?: () => void;
  /**
   * 主按钮的 disabled 状态
   */
  disabled?: boolean;
  /**
   * 确认按钮的防抖延迟时间，默认 1000
   */
  debounceWait?: number;
  /**
   * 确认按钮的防抖设置, 是否需要首次事件立即执行
   */
  debounceImmediate?: boolean;
}

function BaseModalInner({
  className,
  title,
  visible,
  okText: propOkText,
  cancelText: propCancelText,
  type = 'info',
  disabled,
  debounceWait,
  debounceImmediate = true,
  children,
  onOk,
  onCancel,
  onDestroy,
  mask,
  maskClosable,
  wrapperClassName,
  nonePointerEvents,
  icon,
}: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [okText, cancelText] = useMemo(() => getBtnText(type, propOkText, propCancelText), [type, propOkText, propCancelText]);
  const showBottom = okText || cancelText;
  const isWarning = type === TYPE_MAP.warning;
  const isHalfScreen = type === TYPE_MAP.halfScreen;

  const handleOk = useDebounceImmediateFn(
    async () => {
      if (loading || disabled) {
        return;
      }
      const okResult = onOk?.();
      if (okResult?.then && typeof okResult.then === 'function') {
        setLoading(true);
        await okResult;
        setLoading(false);
      }
      onDestroy?.();
    },
    debounceWait,
    debounceImmediate,
  );

  const handleCancel = useCallback(() => {
    onCancel?.();
    onDestroy?.();
  }, [onCancel, onDestroy]);

  if (!visible) {
    return null;
  }

  return (
    <BasePopup
      wrapperClassName={cx(prefix, wrapperClassName, isHalfScreen && halfScreenPrefix)}
      mask={mask}
      maskClosable={maskClosable}
      onDestroy={onDestroy}
      nonePointerEvents={nonePointerEvents}
    >
      <div className={cx(`${prefix}-wrapper`, className, isHalfScreen && `${halfScreenPrefix}-wrapper`)}>
        <div className={cx(`${prefix}-body`)}>
          {!!isWarning && <WarningIcon />}
          {!!icon && icon}
          {!!title && <div className={`${prefix}-title`}>{title}</div>}
          {!!children && <div className={`${prefix}-content`}>{typeof children === 'function' ? children(onDestroy!) : children}</div>}
        </div>
        {!!showBottom && (
          <div className={`${prefix}-bottom`}>
            {!!cancelText && (
              <div className={`${prefix}-cancel`} onClick={handleCancel}>
                {cancelText}
              </div>
            )}
            {!!okText && !!cancelText && <span className={`${prefix}-split-line`}></span>}
            {!!okText && (
              <div className={cx(`${prefix}-ok`, (loading || disabled) && `${prefix}-ok-no-operate`)} onClick={handleOk}>
                {okText}
              </div>
            )}
          </div>
        )}
      </div>
    </BasePopup>
  );
}

/** 通用对话框 */
export const BaseModal = memo(BaseModalInner);
