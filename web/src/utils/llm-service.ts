import axios from 'axios';
import { Atom } from 'use-atom-view';
import { getJsonFile } from './json-service';
import { jsonlocalStore } from './localstorage';

export interface LLMConfig {
  apiKey: string;
  baseURL: string;
  model: string;
}

export interface LLMFile {
  default: string;
  configs: {
    [key: string]: {
      apiKey: string;
      baseURL: string;
      models: string[];
    };
  };
}

export const llmAtom = Atom.of({
  file: {} as LLMFile,
  provider: '',
  config: {} as LLMConfig,
});

const localLlmConfig = jsonlocalStore('game-editor-llm', { provider: '', model: '' });

export async function initLlmConfig() {
  try {
    const localConfig = localLlmConfig.get();
    const file = await getJsonFile({ repo: 'TinkGu/private-cloud', path: 'match3/llm' });
    let provider = file.default;
    if (localConfig.provider) {
      if (file.configs[localConfig.provider]) {
        provider = localConfig.provider;
      }
    }
    const config = file.configs[provider];
    let model = config.models[0];
    if (config.models.includes(localConfig.model)) {
      model = localConfig.model;
    }
    llmAtom.set({
      file,
      provider,
      config: {
        apiKey: config.apiKey,
        baseURL: config.baseURL,
        model,
      },
    });
  } catch (err) {
    console.error(err);
    throw new Error('LLM 配置文件读取失败');
  }
}

export function saveLocalLlmConfig() {
  const { provider, config } = llmAtom.get();
  localLlmConfig.set({ provider, model: config.model });
}

export async function llmRequest({ messages }: { messages: { role: 'user' | 'system'; content: string }[] }) {
  if (!llmAtom.get().config.apiKey) {
    await initLlmConfig();
  }
  const { config } = llmAtom.get();
  const res = await axios.post(
    `${config.baseURL}/v1/chat/completions`,
    {
      model: config.model,
      messages,
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    },
    {
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const content = res.data.choices[0].message.content;
  // 尝试提取JSON
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('无法解析LLM响应，非 JSON 数据。');
  }

  return JSON.parse(jsonMatch[0]);
}
