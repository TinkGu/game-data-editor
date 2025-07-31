import { useEffect, useState, useRef } from 'react';
import { range } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { IconArrow, IconClear, IconDislike, IconFocus, IconInfo, IconSave, IconStar } from 'app/components/icons';
import { searchSames } from 'app/utils/ability-services';
import { setAppTheme } from 'app/utils/app-services';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { AbilityItem, checkAbility, showAbilityEditor } from '../ability-item';
import { showSames } from '../same-pannel';
import { Ability, db, Draft, draftDb, store } from '../state';
import { showTagPreview } from '../tag-preview';
import { TagsBullet } from '../tags-bullet';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

let __todoTagId = 0;

function getTodoTag() {
  if (!__todoTagId) {
    const tagMap = db.atom.get().tagMap;
    const id = Object.keys(tagMap).find((t) => tagMap[t][0] === 'TODO');
    __todoTagId = Number(id);
  }
  return __todoTagId;
}

const todoFilterMap = {
  all: '只看待办',
  onlyTodo: '不看待办',
  onlyNotTodo: '查看全部',
};

// 专注模式下，就像短视频一样，支持手势上滑、下拉，切换到下一个/上一个
function FocusPannel({ onDestory, index }: { onDestory: () => void; index?: number }) {
  const [_current, setCurrent] = useState(index || 0);
  const [sameCount, setSameCount] = useState(0);
  const { items: rawList } = useAtomView(draftDb.atom);
  const [todoFilter, setTodoFilter] = useState('onlyNotTodo');
  const items = rawList.filter((x) => {
    if (todoFilter === 'all') return true;
    const todoTagId = getTodoTag();
    if (todoFilter === 'onlyTodo') return x.tags.includes(todoTagId);
    if (todoFilter === 'onlyNotTodo') return !x.tags.includes(todoTagId);
    return true;
  });
  const current = range(0, items.length, _current);
  const draft = items[current];
  const hasTodo = draft?.tags?.includes(getTodoTag() || 0);

  // 手势相关状
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);
  const minSwipeDistance = 50; // 最小滑动距离

  // 动画相关状态
  const isDraggingRef = useRef(false);
  const [dragOffset, setDragOffset] = useState(0);

  const handleNext = () => {
    if (current >= items.length - 1) return;
    setCurrent(current + 1);
  };

  const handlePrev = () => {
    if (current <= 0) return;
    setCurrent(current - 1);
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.targetTouches[0].clientY;
    isDraggingRef.current = true;
    setDragOffset(0);
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const currentY = e.targetTouches[0].clientY;
    const offset = currentY - touchStartY.current;
    setDragOffset(offset);
  };

  // 触摸结束
  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndY.current = e.changedTouches[0].clientY;
    isDraggingRef.current = false;

    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;

    if (isUpSwipe && current < items.length - 1) {
      // 向上滑动，切换到下一个
      handleNext();
    } else if (isDownSwipe && current > 0) {
      // 向下滑动，切换到上一个
      handlePrev();
    }

    // 重置偏移
    setDragOffset(0);
  };

  const handleDelete = useDebounceFn(() => {
    draftDb.atom.modify((state) => ({
      ...state,
      items: state.items.filter((x) => x.uid !== draft.uid),
    }));
    draftDb.save();
  });

  const handleSave = useDebounceFn(async (a: Ability) => {
    try {
      const item = checkAbility({
        name: a.name,
        desc: a.desc,
        tags: a.tags,
      });
      db.atom.modify((x) => ({
        ...x,
        items: [item, ...x.items],
      }));
      await db.save();
      handleDelete();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleClick = useDebounceFn(() => {
    showAbilityEditor({
      ability: draft,
      onSave: (a) => handleSave(a),
      onDelete: handleDelete,
    });
  });

  const handleSetTodo = useDebounceFn(() => {
    const todoTagId = getTodoTag();
    if (!todoTagId) return toast.info('请先创建 TODO 标签');

    let newDraft = draft;
    if (hasTodo) {
      newDraft = { ...draft, tags: draft.tags.filter((t) => t !== todoTagId) };
    } else {
      newDraft = { ...draft, tags: [...draft.tags, todoTagId] };
    }
    draftDb.atom.modify((state) => ({
      ...state,
      items: state.items.map((x) => (x.uid === draft.uid ? newDraft : x)),
    }));
    draftDb.save();
  });

  const handleShowSame = useDebounceFn((e) => {
    e.stopPropagation();
    showSames();
  });

  const handleTodoFilter = useDebounceFn(() => {
    let next = 'all';
    if (todoFilter === 'all') next = 'onlyTodo';
    if (todoFilter === 'onlyTodo') next = 'onlyNotTodo';
    if (todoFilter === 'onlyNotTodo') next = 'all';
    setCurrent(0);
    setTodoFilter(next);
  });

  useEffect(() => {
    if (!draft) return;
    const sames = searchSames(draft, db.atom.get().items);
    setSameCount(sames.length);
  }, [draft]);

  useEffect(() => {
    return setAppTheme('#1a1a1a');
  }, []);

  // 阻止背景滚动的一个 track
  useEffect(() => {
    store.merge({ isFocusing: true });
    return () => {
      store.merge({ isFocusing: false });
    };
  }, []);

  if (!draft) {
    return (
      <div className={cx('focus-pannel')}>
        <div className={cx('close-box')} onClick={onDestory}>
          退出专注
        </div>
        <div className={cx('empty')}>已经清空啦</div>
      </div>
    );
  }

  return (
    <div className={cx('focus-pannel')} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
      <div className={cx('focus-header')}>
        <div className={cx('header-left')}>
          <div className={cx('capsule')}>
            {current + 1}/{items.length}
          </div>
          <div className={cx('info-btn')} onClick={showTagPreview}>
            <IconInfo className={cx('info-icon')} color="#f0f0f0" />
          </div>
          <div className={cx('filter')} onClick={handleTodoFilter}>
            {todoFilterMap[todoFilter]}
          </div>
        </div>
        <div className={cx('capsule')} onClick={onDestory}>
          退出专注
        </div>
      </div>
      <div className={cx('nav-actions')}>
        <div className={cx('btn', { disabled: current <= 0 })} onClick={handlePrev}>
          <IconArrow direction="left" color="#f0f0f0" />
        </div>
        <div className={cx('btn', { disabled: current >= items.length - 1 })} onClick={handleNext}>
          <IconArrow direction="right" color="#f0f0f0" />
        </div>
      </div>
      <div className={cx('focus-body')} style={{ transform: `translateY(${dragOffset}px)` }}>
        <div className={cx('focus-card', { 'has-same': !!sameCount })} onClick={handleClick}>
          <div className={cx('focus-card-content')}>
            <div className={cx('title')}>{draft.name}</div>
            <div className={cx('desc')}>{draft.desc}</div>
            <div className={cx('tags')}>
              <TagsBullet tags={draft.tags} size="lg" />
            </div>
            {!!sameCount && (
              <div className={cx('same-tip')} onClick={handleShowSame}>
                发现 <span className={cx('same-tip-count')}>{sameCount}</span> 个相似条目
              </div>
            )}
          </div>
        </div>
        <div className={cx('focus-actions')}>
          <div className={cx('action')} onClick={handleDelete}>
            <div className={cx('icon')}>
              <IconDislike />
            </div>
          </div>
          <div className={cx('action')} onClick={() => handleSave(draft)}>
            <div className={cx('icon')}>
              <IconSave />
            </div>
          </div>
          <div className={cx('action')} onClick={handleSetTodo}>
            <IconStar className={cx('icon')} color={hasTodo ? '#c36' : undefined} />
          </div>
        </div>
      </div>
    </div>
  );
}

function showFocusPannel(options?: { index?: number }) {
  const { index } = options || {};
  return Portal.show({
    content: (onDestory) => {
      return <FocusPannel onDestory={onDestory} index={index} />;
    },
  });
}

function DraftItem({ draft }: { draft: Draft }) {
  const handleDelete = useDebounceFn(() => {
    draftDb.atom.modify((state) => ({
      ...state,
      items: state.items.filter((x) => x.uid !== draft.uid),
    }));
    draftDb.save();
  });

  const handleFocusFrom = useDebounceFn(() => {
    const index = draftDb.atom.get().items.findIndex((x) => x.uid === draft.uid);
    showFocusPannel({ index: index === -1 ? 0 : index });
  });

  const handleSave = useDebounceFn(async (a: Ability) => {
    try {
      const item = checkAbility({
        name: a.name,
        desc: a.desc,
        tags: a.tags,
      });
      db.atom.modify((x) => ({
        ...x,
        items: [item, ...x.items],
      }));
      await db.save();
      handleDelete();
    } catch (err) {
      console.error(err);
      toast.error(err);
    }
  });

  const handleClick = useDebounceFn((ability: Ability) => {
    showAbilityEditor({
      ability,
      onSave: (a) => handleSave(a),
      onDelete: handleDelete,
    });
  });

  return (
    <div className={cx('draft-card')}>
      <AbilityItem ability={draft} onClick={handleClick} />
      <div className={cx('card-header')}>
        <div className={cx('card-action')} onClick={handleFocusFrom}>
          <div className={cx('text')}>从此专注</div>
        </div>
        <div className={cx('rights')}>
          <div className={cx('card-action')} onClick={handleDelete}>
            <div className={cx('icon')}>
              <IconDislike />
            </div>
            <div className={cx('text')}>丢弃</div>
          </div>
          <div className={cx('card-action')} onClick={() => handleSave(draft)}>
            <div className={cx('icon')}>
              <IconSave />
            </div>
            <div className={cx('text')}>保存</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DraftsPannel({ onDestory }: { onDestory: () => void }) {
  const [filter, setFilter] = useState('all');
  const { items } = useAtomView(draftDb.atom);
  const todoTagId = getTodoTag();
  const todos = todoTagId ? items.filter((x) => x.tags.includes(Number(todoTagId))) : [];
  const records = filter === 'todo' ? todos : items;

  const handleClear = useDebounceFn(async () => {
    const isOk = await Modal.showAsync({
      type: 'confirm',
      content: '确定清空草稿箱吗',
    });
    if (!isOk) return;
    draftDb.atom.merge({ items: [] });
    draftDb.save();
  });

  const handleFocus = useDebounceFn(() => {
    showFocusPannel();
  });

  const handleFilter = useDebounceFn(() => {
    setFilter(filter === 'all' ? 'todo' : 'all');
  });

  return (
    <div className={cx('page-drafts')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn', 'active')} onClick={handleFocus}>
            <IconFocus className={cx('header-icon')} />
          </div>
          <div className={cx('btn')} onClick={showTagPreview}>
            <IconInfo className={cx('header-icon')} />
          </div>
          <div className={cx('btn', 'danger')} onClick={handleClear}>
            <IconClear className={cx('header-icon')} />
          </div>
          <div className={cx('btn')} onClick={handleFilter}>
            <IconStar className={cx('header-icon', { active: filter === 'todo' })} />
          </div>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            退出
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        {!!records.length && <div className={cx('tip')}>共{records.length}条</div>}
        {!records.length && <div className={cx('empty')}>草稿箱为空</div>}
        {!!records.length && records.map((item) => <DraftItem draft={item} key={item.uid} />)}
      </div>
    </div>
  );
}

export function showDrafts() {
  return Portal.show({
    content: (onDestory) => {
      return <DraftsPannel onDestory={onDestory} />;
    },
  });
}
