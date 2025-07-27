import { getJsonFile } from 'app/utils/json-service';
import { llmRequest } from 'app/utils/llm-service';
import { localStore } from 'app/utils/localstorage';
import { db } from './state';

function getWeight(a: number[], b: number[]) {
  return a.reduce((acc, tag) => acc + (b.includes(tag) ? 1 : 0), 0);
}

function extractExamples({ tags, count = 5 }: { tags: number[]; count?: number }) {
  const { items } = db.atom.get();
  const records = [...items];
  const res = [] as any;
  if (records.length < 0) return res;

  let relateds = [] as any;
  records.forEach((sk) => {
    if (sk.tags.some((tag) => tags.includes(tag))) {
      relateds.push({
        name: sk.name,
        desc: sk.desc,
        tags: [...(sk.tags || [])],
        // 拥有相似的 tag 越多，权重越高
        weight: getWeight(sk.tags, tags),
      });
    }
  });

  if (relateds.length >= count) {
    relateds.sort((a, b) => b.weight - a.weight);
    relateds = relateds.slice(0, count);
  }

  const relatedMax = Math.floor(count * 0.8) || 1;
  let relatedCount = 0;
  // 总共挑选 3 个条目，其中 2 个条目必须包含已选中的 tag，1 个条目不包含已选中的 tag
  while (relatedCount < relatedMax && relateds.length > 0) {
    const randomIndex = Math.floor(Math.random() * relateds.length);
    const item = relateds[randomIndex];
    delete item.weight;
    res.push(relateds[randomIndex]);
    relateds.splice(randomIndex, 1);
    relatedCount++;
  }
  while (res.length < count && records.length > 0) {
    const randomIndex = Math.floor(Math.random() * records.length);
    res.push(records[randomIndex]);
    records.splice(randomIndex, 1);
  }
  return res;
}

export const lsLlmOutputCount = localStore('game-data-editor__llmOutputCount', '5');
export const lsLlmExamplesCount = localStore('game-data-editor__llmExamplesCount', '10');

export async function llmAbility({ tags }: { tags: number[] }) {
  // 从远端下载脚本并执行
  const code = await getJsonFile({ repo: 'TinkGu/private-cloud', path: 'match3/prompts/new-ability', ext: 'js' });
  const fn = new Function('params', code);
  const count = Number(lsLlmOutputCount.get()) || 5;
  const examplesCount = Number(lsLlmExamplesCount.get()) || 10;
  const messages = fn({ tags, count, db, examples: extractExamples({ tags, count: examplesCount }) });
  return llmRequest({ messages });
}

/** 生成条目名称 */
export async function llmAbilityName({ tags, desc }: { tags: number[]; desc: string }) {
  const code = await getJsonFile({ repo: 'TinkGu/private-cloud', path: 'match3/prompts/new-ability-name', ext: 'js' });
  const fn = new Function('params', code);
  const messages = fn({ tags, desc, db });
  return llmRequest({ messages });
}
