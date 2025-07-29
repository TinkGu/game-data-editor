import { Portal } from 'app/components';
import { samesAtom } from 'app/utils/ability-services';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityItem } from '../ability-item';
import { Ability } from '../state';
import { showTagPreview } from '../tag-preview';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function SameItem({ value }: { value: [Ability, number] }) {
  return (
    <div className={cx('same-card')}>
      <AbilityItem ability={value[0]} />
      <div className={cx('card-header')}>
        <div className={cx('rights')}>
          <div className={cx('result')}>
            相似度：<span className={cx('score')}>{value[1]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SamesPannel({ onDestory }: { onDestory: () => void }) {
  const { sames, base } = useAtomView(samesAtom);

  return (
    <div className={cx('page-same-pannel')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn')}>共{sames.length}条</div>
          <div className={cx('btn')} onClick={showTagPreview}>
            标签说明
          </div>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            退出
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <div className={cx('base-content')}>
          <AbilityItem ability={base!} onClick={onDestory} />
        </div>
        <div className={cx('scroll-list')}>
          <div className={cx('section')}>相似条目</div>
          {sames.map((item) => (
            <SameItem value={item} key={item[0].id} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function showSames() {
  return Portal.show({
    content: (onDestory) => {
      return <SamesPannel onDestory={onDestory} />;
    },
  });
}
