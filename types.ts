export enum OutputFormat {
  MARKDOWN = 'Markdown',
  CURSOR_RULES = 'Cursor Rules (.cursorrules)',
  AZURE_DEPLOYMENT = 'Azure Deployment',
  JSDOC = 'JSDoc',
  OPENAPI = 'OpenAPI'
}

export enum DetailLevel {
  BRIEF = 'Tömör',
  DETAILED = 'Részletes',
  INFRASTRUCTURE = 'Infrastruktúra fókuszú'
}

export enum TargetAudience {
  DEVELOPERS = 'Fejlesztők',
  CLOUD_ARCHITECTS = 'Cloud Architectek',
  DEVOPS = 'DevOps Csapat',
  BUSINESS = 'Üzleti döntéshozók'
}

export enum CloudEnvironment {
  NONE = 'Nincs',
  AZURE = 'Azure',
  AWS = 'AWS'
}

export interface GeneratorConfig {
  sourceCode: string;
  additionalContext?: string;
  format: OutputFormat;
  detailLevel: DetailLevel;
  audience: TargetAudience;
  cloudEnv: CloudEnvironment;
}