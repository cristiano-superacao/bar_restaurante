import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  const hdr = req.headers['authorization'] || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    req.user = {
      ...payload,
      companyId: payload.companyId ?? payload.company_id ?? null,
    };
    return next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

export function requireRole(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role) return res.status(401).json({ error: 'Unauthorized' });
    if (allowed.length === 0 || allowed.includes(role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

export function getCompanyScope(req) {
  const role = req.user?.role;
  const isSuperadmin = role === 'superadmin';
  const raw = isSuperadmin
    ? (req.query.companyId || req.headers['x-company-id'] || null)
    : (req.user?.companyId || null);
  const companyId = raw === null || raw === undefined || raw === '' ? null : Number(raw);
  return { isSuperadmin, companyId: Number.isFinite(companyId) ? companyId : null };
}

export function requireCompanyContext(req, res, next) {
  const { isSuperadmin, companyId } = getCompanyScope(req);
  if (!companyId) return res.status(400).json({ error: 'companyId é obrigatório para este recurso' });
  req.companyId = companyId;
  req.isSuperadmin = isSuperadmin;
  return next();
}
