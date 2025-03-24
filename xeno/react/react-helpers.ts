import React from 'react';

/**
 * 计算有多少个被渲染的节点。<br/>
 *
 * React 自带的 `React.Children.count` 会把 null 等值当成合法的组件，本方法的区别在于，过滤了实际上不会渲染的节点
 */
export function countReactValidChildren(children: React.ReactNode) {
  let count = 0;
  React.Children.forEach(children, (x) => {
    if (x !== undefined && x !== null && x !== false && x !== true) {
      count = count + 1;
    }
  });
  return count;
}
