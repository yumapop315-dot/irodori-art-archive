// まとめサイト風のURLパス生成
export function tagPath(name: string): string {
  return `/tag/${encodeURIComponent(name)}`;
}

export function artistPath(screenName: string): string {
  return `/artist/${encodeURIComponent(screenName)}`;
}
