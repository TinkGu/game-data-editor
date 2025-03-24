/**
 * 根据错误类型，返回合理的错误信息。相比直接抛出 error.message，其优化点在于
 * - 对 axios 网络请求进行优化，防止统一抛出 Network Error
 * - 适配 antd 表单验证
 * - 自动遍历 error.message、error.msg 属性，查找错误信息
 */
export function getErrorMsg(error: any, defaultMsg?: string): string {
  const msg = defaultMsg || '出错了，请稍候重试';
  if (error?.isAxiosError) {
    const res = error?.response?.data;
    return res?.message || res?.msg || msg;
  }

  if (error?.errorFields) {
    return error?.message || '请验证表单项是否输入正确';
  }

  return error?.message || error?.msg || msg;
}
