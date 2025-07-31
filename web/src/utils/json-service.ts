import axios from 'axios';
import { Atom } from 'use-atom-view';
import { getGithubToken } from './app-services';

let shaMap = {};

const getSHA = ({ repo, path }: { repo: string; path: string }) => shaMap[`${repo}_${path}`];
const setSHA = ({ repo, path, sha }: { repo: string; path: string; sha: string }) => {
  shaMap[`${repo}_${path}`] = sha;
};

export async function getJsonFile({ repo, path, ext = 'json' }: { repo: string; path: string; ext?: string }) {
  const token = getGithubToken();
  if (!token) return {};
  const res = await axios.get(`https://api.github.com/repos/${repo}/contents/${path}.${ext}`, {
    headers: {
      Authorization: `token ${token}`,
    },
  });
  if (res.data.sha) {
    setSHA({ repo, path, sha: res.data.sha });
  }
  if (res.data.content) {
    const str = new TextDecoder().decode(Uint8Array.from(window.atob(res.data.content), (c) => c.charCodeAt(0)));
    if (ext === 'json') {
      const json = JSON.parse(str);
      console.log(json);
      return json;
    } else {
      return str;
    }
  }
  return res.data;
}

async function postGitFile({ repo, path, content }: { repo: string; path: string; content: any }) {
  const token = getGithubToken();
  if (!token) return;
  console.log(content);
  if (!content || typeof content !== 'object') {
    throw { message: 'content 必须是一个 JSON 安全的对象' };
  }
  const jsonString = JSON.stringify(content, null, 2);
  const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}.json`;
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
  saveAfters: Array<() => void>;

  constructor({ atom, repo, path, format }: { atom: Atom<T>; repo: string; path: string; format?: <S>(x: T) => S }) {
    this.repo = repo;
    this.atom = atom;
    this.path = path;
    this.format = format;
    this.saveAfters = [];
  }

  uuid = () => {
    this.idRef++;
    return this.idRef;
  };

  /** 保存 */
  save = async () => {
    const content = this.atom.get();
    (content as any).id = this.idRef;
    await postGitFile({ repo: this.repo, path: this.path, content });
    this.saveAfters.forEach((f) => f());
  };

  /** 当保存时，触发回调 */
  subscribe = (f: () => void) => {
    this.saveAfters.push(f);
    return () => (this.saveAfters = this.saveAfters.filter((x) => x !== f));
  };

  /** 从远端下载 */
  pull = async () => {
    const data = await getJsonFile({ repo: this.repo, path: this.path });
    this.idRef = data.id || 0;
    this.atom.merge(data);
  };
}
