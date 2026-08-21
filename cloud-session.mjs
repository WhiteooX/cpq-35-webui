const SUPABASE_HOST = /^(?:https:\/\/[^/]+\.supabase\.co|https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?)$/i;

export function inspectCloudConfig(value) {
  const url = typeof value?.url === 'string' ? value.url.trim().replace(/\/$/, '') : '';
  const key = typeof value?.anonKey === 'string' ? value.anonKey.trim() : '';
  if (!url || !key) return { valid: false, url, key, reason: '远程服务尚未配置' };
  if (!SUPABASE_HOST.test(url)) return { valid: false, url, key, reason: '远程服务地址格式无效' };
  if (!(key.startsWith('sb_publishable_') || key.startsWith('eyJ'))) {
    return { valid: false, url, key, reason: '必须使用 Supabase publishable key 或旧版 anon key' };
  }
  return { valid: true, url, key, reason: '' };
}

function rpcError(response, text) {
  if (text) {
    try {
      const parsed = JSON.parse(text);
      return new Error(parsed.message || parsed.error_description || parsed.error || `HTTP ${response.status}`);
    } catch (error) {
      if (!(error instanceof SyntaxError)) return error;
    }
  }
  return new Error(text || `HTTP ${response.status}`);
}

export async function callCloudRpc(config, name, body = {}, options = {}) {
  const inspected = inspectCloudConfig(config);
  if (!inspected.valid) throw new Error(inspected.reason);
  if (!/^[a-z][a-z0-9_]*$/.test(name)) throw new Error('RPC 名称无效');

  const fetchImpl = options.fetchImpl || globalThis.fetch;
  if (typeof fetchImpl !== 'function') throw new Error('当前浏览器不支持网络请求');
  const timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 12000;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const headers = { 'Content-Type': 'application/json', apikey: inspected.key };
  // Legacy anon keys are JWTs and can also act as the anonymous bearer token.
  // New sb_publishable keys must be sent as apikey, not treated as a JWT.
  if (inspected.key.startsWith('eyJ')) headers.Authorization = `Bearer ${inspected.key}`;

  try {
    const response = await fetchImpl(`${inspected.url}/rest/v1/rpc/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal
    });
    const text = await response.text();
    if (!response.ok) throw rpcError(response, text);
    const data = text ? JSON.parse(text) : null;
    if (data && data.error) throw new Error(data.error);
    return data;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('远程服务连接超时');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function probeCloudService(config, options = {}) {
  const data = await callCloudRpc(config, 'cpq_service_status', {}, options);
  if (data?.status !== 'ok' || data?.schemaVersion !== 6 || !data?.features?.includes('measureProgressCounts')) {
    throw new Error('远程数据库版本不匹配，请重新运行 supabase-setup.sql');
  }
  return data;
}
