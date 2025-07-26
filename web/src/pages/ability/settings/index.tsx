import { useEffect } from 'react';
import { getDataset } from '@tinks/xeno';
import { useDebounceFn } from '@tinks/xeno/react';
import { Modal, Portal, toast } from 'app/components';
import { initLlmConfig, llmAtom, saveLocalLlmConfig } from 'app/utils/llm-service';
import classnames from 'classnames/bind';
import { useAtomView } from 'use-atom-view';
import { setStatsModeMemo, store } from '../state';
import styles from './styles.module.scss';

const cx = classnames.bind(styles);

function SettingItem({ label, value, onClick }: { label: string; value: string; onClick: () => void }) {
  return (
    <div className={cx('setting-item')} onClick={onClick}>
      <div className={cx('label')}>{label}</div>
      <div className={cx('value')}>{value}</div>
    </div>
  );
}

function SettingsPannel({ onDestory }: { onDestory: () => void }) {
  const { filterType, showStats } = useAtomView(store);
  const { provider, config } = useAtomView(llmAtom);

  const handleChangeFilterType = useDebounceFn(() => {
    let close = () => {};
    const handleSelect = async (e: any) => {
      const { type } = getDataset(e);
      store.merge({ filterType: type as 'some' | 'every' });
      close();
    };

    close = Modal.show({
      type: 'half-screen',
      maskClosable: true,
      content: () => (
        <div className={cx('modal')}>
          <div className={cx('selects')}>
            <div className={cx('select-option')} onClick={handleSelect} data-type="some">
              含有
              <span className={cx('tip')}>条目只要含有任意一条选中的标签就可以</span>
            </div>
            <div className={cx('select-option')} onClick={handleSelect} data-type="every">
              重叠
              <span className={cx('tip')}>条目必须完全含有选中的标签</span>
            </div>
          </div>
        </div>
      ),
    });
  });

  const handleChangeStatsMode = useDebounceFn(() => {
    setStatsModeMemo(!showStats);
  });

  const handleChangeLlm = useDebounceFn(() => {
    const { file } = llmAtom.get();
    if (!file?.default) {
      toast.info('请先在远端配置好 LLM 服务');
      return;
    }

    let closeProvider = () => {};
    const handleSelectProvider = async (e: any) => {
      const { llm } = getDataset(e);
      let closeInner = () => {};
      const handleSelectModel = async (e: any) => {
        const { model: _model } = getDataset(e);
        const _config = file?.configs[llm];
        llmAtom.merge({
          provider: llm,
          config: {
            ..._config,
            model: _model,
          },
        });
        saveLocalLlmConfig();
        closeInner();
        closeProvider();
      };

      closeInner = Modal.show({
        type: 'half-screen',
        maskClosable: true,
        content: () => (
          <div className={cx('modal')}>
            <div className={cx('selects-title')}>选择模型</div>
            <div className={cx('selects')}>
              {file?.configs[llm]?.models?.map((model) => (
                <div className={cx('select-option')} onClick={handleSelectModel} data-model={model} key={model}>
                  {model}
                </div>
              ))}
            </div>
          </div>
        ),
      });
    };
    closeProvider = Modal.show({
      type: 'half-screen',
      maskClosable: true,
      content: () => (
        <div className={cx('modal')}>
          <div className={cx('selects-title')}>选择 LLM 提供商</div>
          <div className={cx('selects')}>
            {Object.keys(file?.configs || {}).map((llm) => (
              <div className={cx('select-option')} onClick={handleSelectProvider} data-llm={llm} key={llm}>
                {llm}
              </div>
            ))}
          </div>
        </div>
      ),
    });
  });

  useEffect(() => {
    initLlmConfig();
  }, []);

  return (
    <div className={cx('settings')}>
      <div className={cx('header')}>
        <div className={cx('actions')}>
          <div className={cx('btn', 'close')} onClick={onDestory}>
            关闭
          </div>
        </div>
      </div>
      <div className={cx('content')}>
        <SettingItem label="标签筛选模式" value={filterType === 'some' ? '含有' : '重叠'} onClick={handleChangeFilterType} />
        <SettingItem label="统计" value={showStats ? '开' : '关'} onClick={handleChangeStatsMode} />
        <div className={cx('section')}>LLM</div>
        <SettingItem label="提供商" value={provider || '空'} onClick={handleChangeLlm} />
        <SettingItem label="model" value={config.model || '空'} onClick={handleChangeLlm} />
      </div>
    </div>
  );
}

export function showSettings() {
  return Portal.show({
    content: (onDestory) => {
      return <SettingsPannel onDestory={onDestory} />;
    },
  });
}
