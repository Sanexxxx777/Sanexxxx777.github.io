export type Bi = { ru: string; en: string };
export type Status = "prod" | "research" | "client" | "saas" | "open" | "pet";

export type Meta = { k: Bi; v: Bi | string };

export type Project = {
  id: string;
  kicker: Bi;       // // category line
  title: string;    // brand name (kept across langs)
  desc: Bi;
  tags: string[];
  meta: [Meta, Meta];
  status: Status;
  year: string;
};

export type Subsystem = {
  code: string;
  title: Bi;
  desc: Bi;
  tags: string[];
};

export type Release = {
  ver: string;
  when: Bi;
  title: Bi;
  body: Bi;
  kind: "prod" | "infra" | "perf" | "research";
};

export type StackRow = { name: string; pct: number; lvl?: string };
export type StackGroup = { head: Bi; rows: StackRow[] };

export type Principle = { tag: Bi; num: string; h: Bi; p: Bi };
