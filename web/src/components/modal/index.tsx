import { PortalLike, withPortal } from '../portal';
import { BaseModal, ModalProps } from './base-modal';

interface ModalLike extends PortalLike<ModalProps> {
  confirm: (props: ModalProps) => () => void;
  custom: (props: ModalProps) => () => void;
  halfScreen: (props: ModalProps) => () => void;
  showAsync: (props: ModalProps) => Promise<boolean>;
}

/**
 * 对话框
 *
 * 除支持直接渲染 <Modal /> 外
 * 还支持两种命令式调用：
 * - show，马上弹出一个 modal，并返回销毁方法
 * ```typescript
 * const destroy = Modal.show({
 *   title: func, // 关闭时回调
 *   content: (onDestroy) => ReactNode, // 弹窗主体
 *   ...modalProps, // 其它 popup props
 * })
 * ```
 *
 * - create，创建一个对象 x，并返回 x.show，x.destroy 方法
 * ```typescript
 * const modal = Modal.create()
 * modal.show({ onDestroy: func, content: func | ReactNode })
 * modal.destroy()
 * ```
 */
export const Modal = withPortal<ModalProps>(BaseModal, { visible: true }) as ModalLike;
Modal.confirm = (props: ModalProps) => Modal.show({ ...props, type: 'confirm' });
Modal.custom = (props: ModalProps) => Modal.show({ ...props, type: 'custom' });
/** 半屏弹窗 */
Modal.halfScreen = (props: ModalProps) => Modal.show({ ...props, type: 'half-screen' });
/** 返回一个异步的弹窗 */
Modal.showAsync = (props: ModalProps) =>
  new Promise((resolve) => {
    Modal.show({
      ...props,
      onOk: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });

export type { ModalProps };
