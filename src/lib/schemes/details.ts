export interface SchemeDetailRecord {
  id: string;
  name: string;
  officialUmangUrl: string | null;
  sourceStatus: string;
  sections: Record<string, string[]>;
}

export function sectionLines(record: SchemeDetailRecord | undefined, names: string[], limit: number): string[] {
  if (!record) return [];
  return names.flatMap((name) => record.sections[name] ?? [])
    .flatMap((value) => value.split(/\r?\n/)).map((value) => value.trim()).filter(Boolean).slice(0, limit);
}

export function summaryText(record: SchemeDetailRecord | undefined): string | undefined {
  const source = sectionLines(record, ['Details'], 1)[0];
  if (!source) return undefined;
  const sentences = source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((value) => value.trim()) ?? [source];
  return sentences.slice(0, 2).join(' ');
}
