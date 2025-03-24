export const DEFAULT_TEXT = {
  INFO_OK_TEXT: '我知道了',
  OK_TEXT: '确定',
  CANCEL_TEXT: '取消',
};

export const TYPE_MAP = {
  info: 'info',
  confirm: 'confirm',
  warning: 'warning',
  halfScreen: 'half-screen',
};

export const getBtnText = (type?: string, propOkText?: string, propCancelText?: string) => {
  let okText;
  let cancelText;
  if (type === TYPE_MAP.info) {
    okText = DEFAULT_TEXT.INFO_OK_TEXT;
  } else if (type === TYPE_MAP.confirm || type === TYPE_MAP.warning) {
    okText = DEFAULT_TEXT.OK_TEXT;
    cancelText = DEFAULT_TEXT.CANCEL_TEXT;
  }
  okText = propOkText || okText;
  cancelText = propCancelText || cancelText;
  return [okText, cancelText];
};
