/**
 * 对事件对象 `e.currentTarget.dataset` 自动做转型处理
 *
 * ```typescript
 * const x = { id: 1 }
 * <div onClick={handleClick} data-row-id={x.id} data-row-id="number"></div>
 *
 * const handleClick = (e) => {
 *   const { rowId } = getDataset(e)
 *   console.log(rowId) // => 1
 * }
 * ```
 *
 * - `data-xx-t="number"` => 转型，例如将 xx 属性自动转为 number 类型
 * - `data-nav-is-new-tab` => 若用于 onNavigate，判断跳转时是否新开 tab
 * - `data-nav-method` => 若用于 onNavigate，判断跳转时的打开类型
 */
export function getDataset(
  e: any,
  options?: {
    /** 使用 `e.target` */
    useTarget?: boolean;
  },
) {
  const dataset = Object.assign({}, options?.useTarget ? e?.target?.dataset : e?.currentTarget?.dataset);
  Object.keys(dataset).forEach((key) => {
    const type = dataset[`${key}T`];
    if (type === 'number') {
      // 保持 undefined
      if (dataset[key] === undefined || dataset[key] === '') {
        dataset[key] = undefined;
        return;
      }
      dataset[key] = parseInt(dataset[key]);
    }
    delete dataset[`${key}T`];
  });
  return dataset;
}
