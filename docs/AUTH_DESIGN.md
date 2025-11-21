# Auth Design (Better Auth + GitHub Enterprise)

## 目标与选择
- 需求：Phase 2 进入 `redirecting` 时自动跳转 GitHub(GHE) OAuth，新窗口授权后回主界面；授权完成后主界面启动彩色 Pac-Man + 数据加载，完成后进入 Phase 3。
- 后端：选 Hono（轻量、写法贴近 fetch；有 CORS/cookie 辅助），后续如需大量插件可平滑迁 Fastify。
- 本地默认对接 `github.com`，生产可切换 GitHub Enterprise 域名。
- 会话：最简单的 HttpOnly/SameSite=Lax/secure cookie，前端不接触 access token。

## 与 Better Auth “Other Social Providers” 指南的对齐
- 使用 Generic OAuth 插件：后端 `genericOAuth`，前端 `genericOAuthClient`。
- Provider 配置（手动写授权/Token URL，便于切换 GHE 域名）：  
  ```ts
  // auth.ts
  import { betterAuth } from "better-auth";
  import { genericOAuth } from "better-auth/plugins";

  export const auth = betterAuth({
    plugins: [
      genericOAuth({
        config: [
          {
            providerId: "ghe",
            clientId: process.env.GHE_CLIENT_ID!,
            clientSecret: process.env.GHE_CLIENT_SECRET!,
            authorizationUrl: `${process.env.GHE_BASE_URL}/login/oauth/authorize`,
            tokenUrl: `${process.env.GHE_BASE_URL}/login/oauth/access_token`,
            scopes: ["read:user", "user:email"],
            // 如需用户信息映射，可在换 token 后调用 `${GHE_BASE_URL}/api/v3/user`
          },
        ],
      }),
    ],
  });
  ```
  ```ts
  // auth-client.ts
  import { createAuthClient } from "better-auth/client";
  import { genericOAuthClient } from "better-auth/client/plugins";

  export const authClient = createAuthClient({
    plugins: [genericOAuthClient()],
  });
  ```
- 前端调用（在 Phase 2 自动触发）：`authClient.signIn.oauth2({ providerId: "ghe", callbackURL: "/auth/callback" })`。若需自行开新窗口，可使用返回的授权 URL 或包一层后端 `/auth/github-enterprise/authorize` 接口来统一控制。

## 环境变量
- `GHE_BASE_URL`：GHE 域名（含协议），本地默认 `https://github.com`。
- `GHE_CLIENT_ID`，`GHE_CLIENT_SECRET`：OAuth App。放 ECS Secrets/Task env，不写入镜像。
- `AUTH_REDIRECT_URI`：后端回调地址（如 `https://api.example.com/auth/github-enterprise/callback`）。
- `SESSION_SECRET`：用于签名 state/PKCE 绑定、session cookie。
- `FRONTEND_BASE_URL`：前端基址（用于回跳到 `/auth/callback` 页面）。
- 前端（Vite）：`VITE_API_BASE`、`VITE_GHE_BASE_URL`（可展示）、`VITE_AUTH_CALLBACK_PATH=/auth/callback`。

## Better Auth 配置（GHE 自定义 provider）
- 授权：`${GHE_BASE_URL}/login/oauth/authorize`
- token：`${GHE_BASE_URL}/login/oauth/access_token`
- 用户信息：`${GHE_BASE_URL}/api/v3/user`
- scope：`read:user user:email`（按需追加）
- 默认 base 指向 `github.com`，改 `GHE_BASE_URL` 即切换。

## 后端路由（Hono）
- `GET /auth/github-enterprise/authorize`
  - 生成 `state` + PKCE，写入签名 cookie。
  - 构造 authorize URL，返回 JSON `{ url }` 给前端自动打开新窗口。
- `GET /auth/github-enterprise/callback`
  - 校验 `state`/PKCE，换取 access token。
  - 拉取用户信息；创建服务端 session，设置 HttpOnly cookie（SameSite=Lax，Secure in prod）。
  - 回跳 `${FRONTEND_BASE_URL}${VITE_AUTH_CALLBACK_PATH}`。
- `GET /auth/session`：返回当前用户（用于主窗口轮询/获取用户态）。
- 错误：失败时带 `?error=...` 回前端，或在新窗口显示轻量错误页并 `postMessage` `ok:false`。

## 前端流程（Phase 2/3 对接）
1) Timeline 进入 `redirecting`：调用 `/auth/github-enterprise/authorize`，`window.open(url, '_blank', 'noopener,noreferrer')`；UI 显示 Redirect 卡片。
2) 新窗口完成授权后命中 `/auth/callback` 页面：立即向 `window.opener` `postMessage({ type: 'ghe-auth-complete', ok: true })`（校验 origin）；可备用 `BroadcastChannel('auth')`。
3) 主窗口收到成功事件：将 Redirect 卡片淡出，原地切为 Pac-Man Loading 卡片（if/else 同占位，参见 `docs/ARCADE_DESIGN.md`），并行触发数据加载 API。失败或窗口关闭：保留 redirect 或展示重试提示。
4) 数据加载完成：淡出 Pac-Man 卡片，Timeline 进入 Phase 3。

## 会话与安全
- PKCE + state 必做，绑定到签名 cookie 以防 CSRF。
- 仅在服务器保存 access token/用户态，前端只拿用户对象。
- Cookie 属性：`HttpOnly; Secure; SameSite=Lax; Path=/`。开发时允许非 secure。
- 回调域白名单：仅允许配置内的 FRONTEND_BASE_URL。

## AWS ECS 注意点
- Secrets/Client Secret/Session Secret 通过 Task Definition Secrets 注入。
- ALB 终止 TLS，容器内走 80；健康检查可用 `/healthz`。
- 镜像多环境复用：通过 env 切换 GHE 域名/Client ID/Redirect。
- 如需 Fastify 迁移：使用 `@fastify/cors`、`@fastify/cookie`，路由签名不变。

## TODO
- 接入你提供的 Pac-Man SVG 到 Phase 2 overlay（现用占位动画即可换入）。
- 若需多端同步登录状态，可在 `postMessage` 后再触发 `BroadcastChannel('auth')`，保持多标签一致。
