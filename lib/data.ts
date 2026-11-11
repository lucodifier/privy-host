export type Environment = "production" | "staging" | "development";
export type CredentialType = "Secret" | "API Key" | "Database" | "Config" | "Certificate";

export type Project = {
  slug: string;
  name: string;
  description: string;
  environments: Environment[];
  credentials: number;
  owner: string;
  updatedAt: string;
};

export type Credential = {
  id: string;
  key: string;
  description: string;
  project: string;
  environment: Environment;
  type: CredentialType;
  updatedAt: string;
  updatedBy: string;
  favorite: boolean;
};

export type AccessAction = "viewed" | "copied" | "rotated" | "created" | "updated";

export type AccessEvent = {
  id: string;
  key: string;
  project: string;
  environment: Environment;
  action: AccessAction;
  actor: string;
  at: string;
  source: string;
};

export const projects: Project[] = [
  {
    slug: "payments-api",
    name: "payments-api",
    description: "Serviço de pagamentos e cobrança recorrente",
    environments: ["production", "staging", "development"],
    credentials: 42,
    owner: "ana.ribeiro",
    updatedAt: "há 4 min",
  },
  {
    slug: "data-pipeline",
    name: "data-pipeline",
    description: "Ingestão e transformação de eventos",
    environments: ["production", "development"],
    credentials: 31,
    owner: "marcos.lima",
    updatedAt: "há 1 h",
  },
  {
    slug: "web-console",
    name: "web-console",
    description: "Aplicação web do console do cliente",
    environments: ["production", "staging", "development"],
    credentials: 28,
    owner: "julia.santos",
    updatedAt: "há 3 h",
  },
  {
    slug: "infra-core",
    name: "infra-core",
    description: "Credenciais de cloud, DNS e observabilidade",
    environments: ["production", "staging", "development"],
    credentials: 28,
    owner: "rafael.souza",
    updatedAt: "ontem, 18:42",
  },
  {
    slug: "mobile-app",
    name: "mobile-app",
    description: "Builds e serviços do app iOS/Android",
    environments: ["production", "staging"],
    credentials: 19,
    owner: "carla.mendes",
    updatedAt: "há 2 dias",
  },
];

export const credentials: Credential[] = [
  {
    id: "cred_01",
    key: "STRIPE_SECRET_KEY",
    description: "Chave secreta da conta Stripe (live)",
    project: "payments-api",
    environment: "production",
    type: "Secret",
    updatedAt: "há 4 min",
    updatedBy: "ana.ribeiro",
    favorite: true,
  },
  {
    id: "cred_02",
    key: "DATABASE_URL",
    description: "Conexão primária do Postgres",
    project: "payments-api",
    environment: "production",
    type: "Database",
    updatedAt: "há 26 min",
    updatedBy: "ana.ribeiro",
    favorite: true,
  },
  {
    id: "cred_03",
    key: "JWT_SIGNING_KEY",
    description: "Assinatura de tokens de sessão",
    project: "payments-api",
    environment: "staging",
    type: "Secret",
    updatedAt: "há 1 h",
    updatedBy: "marcos.lima",
    favorite: false,
  },
  {
    id: "cred_04",
    key: "REDIS_URL",
    description: "Cache de idempotência",
    project: "payments-api",
    environment: "production",
    type: "Config",
    updatedAt: "há 2 h",
    updatedBy: "rafael.souza",
    favorite: false,
  },
  {
    id: "cred_05",
    key: "SENTRY_DSN",
    description: "Monitoramento de erros do frontend",
    project: "web-console",
    environment: "production",
    type: "Config",
    updatedAt: "há 3 h",
    updatedBy: "julia.santos",
    favorite: false,
  },
  {
    id: "cred_06",
    key: "CLERK_SECRET_KEY",
    description: "Autenticação de usuários do console",
    project: "web-console",
    environment: "production",
    type: "API Key",
    updatedAt: "há 5 h",
    updatedBy: "julia.santos",
    favorite: true,
  },
  {
    id: "cred_07",
    key: "NEXT_PUBLIC_API_URL",
    description: "Endpoint público da API",
    project: "web-console",
    environment: "staging",
    type: "Config",
    updatedAt: "ontem, 17:05",
    updatedBy: "carla.mendes",
    favorite: false,
  },
  {
    id: "cred_08",
    key: "AWS_S3_BUCKET",
    description: "Bucket de uploads de documentos",
    project: "web-console",
    environment: "development",
    type: "Config",
    updatedAt: "ontem, 14:20",
    updatedBy: "rafael.souza",
    favorite: false,
  },
  {
    id: "cred_09",
    key: "FIREBASE_SERVICE_ACCOUNT",
    description: "Push notifications e analytics",
    project: "mobile-app",
    environment: "production",
    type: "Certificate",
    updatedAt: "ontem, 11:32",
    updatedBy: "carla.mendes",
    favorite: false,
  },
  {
    id: "cred_10",
    key: "GOOGLE_MAPS_API_KEY",
    description: "Geocodificação de endereços",
    project: "mobile-app",
    environment: "production",
    type: "API Key",
    updatedAt: "ontem, 09:14",
    updatedBy: "carla.mendes",
    favorite: false,
  },
  {
    id: "cred_11",
    key: "EXPO_ACCESS_TOKEN",
    description: "Publicação de builds EAS",
    project: "mobile-app",
    environment: "staging",
    type: "Secret",
    updatedAt: "há 2 dias",
    updatedBy: "marcos.lima",
    favorite: false,
  },
  {
    id: "cred_12",
    key: "SNOWFLAKE_PRIVATE_KEY",
    description: "Autenticação key-pair do warehouse",
    project: "data-pipeline",
    environment: "production",
    type: "Certificate",
    updatedAt: "há 2 dias",
    updatedBy: "marcos.lima",
    favorite: true,
  },
  {
    id: "cred_13",
    key: "KAFKA_SASL_PASSWORD",
    description: "Consumo de eventos de billing",
    project: "data-pipeline",
    environment: "production",
    type: "Secret",
    updatedAt: "há 2 dias",
    updatedBy: "ana.ribeiro",
    favorite: false,
  },
  {
    id: "cred_14",
    key: "DBT_CLOUD_API_TOKEN",
    description: "Execução de jobs de transformação",
    project: "data-pipeline",
    environment: "development",
    type: "API Key",
    updatedAt: "há 3 dias",
    updatedBy: "marcos.lima",
    favorite: false,
  },
  {
    id: "cred_15",
    key: "CLOUDFLARE_API_TOKEN",
    description: "DNS e regras de borda",
    project: "infra-core",
    environment: "production",
    type: "API Key",
    updatedAt: "há 3 dias",
    updatedBy: "rafael.souza",
    favorite: false,
  },
  {
    id: "cred_16",
    key: "TERRAFORM_BACKEND_KEY",
    description: "State remoto de infraestrutura",
    project: "infra-core",
    environment: "production",
    type: "Secret",
    updatedAt: "há 4 dias",
    updatedBy: "rafael.souza",
    favorite: false,
  },
  {
    id: "cred_17",
    key: "SMTP_PASSWORD",
    description: "Envio de e-mails transacionais",
    project: "infra-core",
    environment: "staging",
    type: "Secret",
    updatedAt: "há 5 dias",
    updatedBy: "julia.santos",
    favorite: false,
  },
  {
    id: "cred_18",
    key: "GRAFANA_ADMIN_PASSWORD",
    description: "Acesso administrativo aos dashboards",
    project: "infra-core",
    environment: "development",
    type: "Secret",
    updatedAt: "há 6 dias",
    updatedBy: "rafael.souza",
    favorite: false,
  },
];

export const accessEvents: AccessEvent[] = [
  {
    id: "acc_01",
    key: "STRIPE_SECRET_KEY",
    project: "payments-api",
    environment: "production",
    action: "rotated",
    actor: "ana.ribeiro",
    at: "há 4 min",
    source: "CLI",
  },
  {
    id: "acc_02",
    key: "DATABASE_URL",
    project: "payments-api",
    environment: "production",
    action: "viewed",
    actor: "marcos.lima",
    at: "há 12 min",
    source: "Web",
  },
  {
    id: "acc_03",
    key: "CLERK_SECRET_KEY",
    project: "web-console",
    environment: "production",
    action: "copied",
    actor: "julia.santos",
    at: "há 38 min",
    source: "Web",
  },
  {
    id: "acc_04",
    key: "KAFKA_SASL_PASSWORD",
    project: "data-pipeline",
    environment: "production",
    action: "viewed",
    actor: "ana.ribeiro",
    at: "há 1 h",
    source: "CLI",
  },
  {
    id: "acc_05",
    key: "SENTRY_DSN",
    project: "web-console",
    environment: "production",
    action: "updated",
    actor: "julia.santos",
    at: "há 3 h",
    source: "Web",
  },
  {
    id: "acc_06",
    key: "GOOGLE_MAPS_API_KEY",
    project: "mobile-app",
    environment: "production",
    action: "created",
    actor: "carla.mendes",
    at: "ontem, 09:14",
    source: "Web",
  },
  {
    id: "acc_07",
    key: "SNOWFLAKE_PRIVATE_KEY",
    project: "data-pipeline",
    environment: "production",
    action: "rotated",
    actor: "marcos.lima",
    at: "ontem, 21:07",
    source: "CLI",
  },
  {
    id: "acc_08",
    key: "TERRAFORM_BACKEND_KEY",
    project: "infra-core",
    environment: "production",
    action: "viewed",
    actor: "rafael.souza",
    at: "ontem, 18:42",
    source: "Web",
  },
  {
    id: "acc_09",
    key: "EXPO_ACCESS_TOKEN",
    project: "mobile-app",
    environment: "staging",
    action: "copied",
    actor: "marcos.lima",
    at: "há 2 dias",
    source: "CLI",
  },
  {
    id: "acc_10",
    key: "SMTP_PASSWORD",
    project: "infra-core",
    environment: "staging",
    action: "updated",
    actor: "julia.santos",
    at: "há 2 dias",
    source: "Web",
  },
];

export const environmentLabels: Record<Environment, string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
};

export const actionLabels: Record<AccessAction, string> = {
  viewed: "Visualizou",
  copied: "Copiou",
  rotated: "Rotacionou",
  created: "Criou",
  updated: "Atualizou",
};

export const currentUser = {
  name: "Ana Ribeiro",
  email: "ana.ribeiro@privault.dev",
  role: "Admin",
  workspace: "agroplay",
};
