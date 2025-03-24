import axios from 'axios';
import { Atom } from 'use-atom-view';
import { qsParse } from 'xeno/url';

// TODO: 如何防止多端冲突
const token = qsParse(window.location.href)?.token;

let shaMap = {};

const getSHA = ({ repo, path }: { repo: string; path: string }) => shaMap[`${repo}_${path}`];
const setSHA = ({ repo, path, sha }: { repo: string; path: string; sha: string }) => {
  shaMap[`${repo}_${path}`] = sha;
};

async function getJsonFile({ repo, path }: { repo: string; path: string }) {
  if (!token) return {};
  const res = await axios.get(`https://api.github.com/repos/TinkGu/${repo}/contents/${path}.json`, {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  if (res.data.sha) {
    setSHA({ repo, path, sha: res.data.sha });
  }
  if (res.data.content) {
    const str = new TextDecoder().decode(Uint8Array.from(window.atob(res.data.content), (c) => c.charCodeAt(0)));
    const json = JSON.parse(str);
    console.log(json);
    return json;
  }
  return res.data;
}

async function postGitFile({ repo, path, content }: { repo: string; path: string; content: any }) {
  if (!token) return;
  console.log(content);
  if (!content || typeof content !== 'object') {
    throw { message: 'content 必须是一个 JSON 安全的对象' };
  }
  const jsonString = JSON.stringify(content, null, 2);
  const apiUrl = `https://api.github.com/repos/TinkGu/${repo}/contents/${path}.json`;
  let sha = getSHA({ repo, path });
  if (!sha) {
    await getJsonFile({ repo, path });
    sha = getSHA({ repo, path });
  }
  // 更新文件
  const res = await axios.put(
    apiUrl,
    {
      message: 'update',
      // content: Buff.from(jsonString).toString('base64'),
      content: window.btoa(String.fromCharCode(...new TextEncoder().encode(jsonString))),
      sha,
    },
    {
      headers: {
        Authorization: `token ${token}`,
      },
    },
  );
  if (res?.data?.content?.sha) {
    setSHA({ repo, path, sha: res.data.content.sha });
  }
}

export class JsonDb<T> {
  atom: Atom<T>;
  repo: string;
  path: string;
  format?: (x: T) => T;
  idRef = 0;

  constructor({ atom, repo, path, format }: { atom: Atom<T>; repo: string; path: string; format?: <S>(x: T) => S }) {
    this.repo = repo;
    this.atom = atom;
    this.path = path;
    this.format = format;
  }

  uuid = () => {
    this.idRef++;
    return this.idRef;
  };

  /** 保存 */
  save = async () => {
    const content = this.atom.get();
    (content as any).id = this.idRef;
    await postGitFile({ repo: this.repo, path: this.path, content: content });
  };

  /** 从远端下载 */
  pull = async () => {
    const data = await getJsonFile({ repo: this.repo, path: this.path });
    this.idRef = data.id || 0;
    this.atom.merge(data);
  };
}
