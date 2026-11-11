/**
 * API de démonstration pour les captures d'écran.
 * N'est pas importée par le build Angular (hors src/).
 * Données ivoiriennes, noms de pharmacies en MAJUSCULES.
 */
import http from 'node:http';
import { URL } from 'node:url';

const PORT = Number(process.env.PORT || 8080);

let seq = 100;

const assurances = [
  { id: 1, name: 'MUGEFCI', description: 'Mutuelle générale des fonctionnaires de Côte d’Ivoire' },
  { id: 2, name: 'CNPS', description: 'Caisse nationale de prévoyance sociale' },
  { id: 3, name: 'NSIA', description: 'Assurance santé NSIA' }
];

const pharmacies = [
  pharmacy(1, 'PHARMACIE DU PLATEAU', 'Dr Awa Koné', 'Cocody', 'Abidjan', '5.3364,-4.0267', 'ACTIF', [1, 2], 4.6, 18),
  pharmacy(2, 'PHARMACIE DE LA PAIX', 'Dr Yao N’Guessan', 'Marcory', 'Abidjan', '5.3012,-3.9861', 'ACTIF', [1], 4.2, 9),
  pharmacy(3, 'PHARMACIE SAINT JEAN', 'Dr Mariam Bamba', 'Yopougon', 'Abidjan', '5.3451,-4.0812', 'ACTIF', [2, 3], 4.8, 27),
  pharmacy(4, 'PHARMACIE DU MARCHE', 'Dr Kouamé Serge', 'Treichville', 'Abidjan', '5.2978,-4.0124', 'INACTIF', [1], 3.4, 4),
  pharmacy(5, 'PHARMACIE LES OSCARS', 'Dr Fatou Diallo', 'Cocody', 'Abidjan', '5.3598,-3.9987', 'ACTIF', [3], 4.1, 11),
  pharmacy(6, 'PHARMACIE DE L’INDENIE', 'Dr Jean-Baptiste Assi', 'Abobo', 'Abidjan', '5.4211,-4.0215', 'ACTIF', [1, 3], 3.9, 7),
  pharmacy(7, 'PHARMACIE NOTRE DAME', 'Dr Clarisse Kouadio', 'Bouaké', 'Bouaké', '7.6900,-5.0300', 'ACTIF', [2], 4.5, 14),
  pharmacy(8, 'PHARMACIE CENTRALE', 'Dr Ibrahim Touré', 'San-Pédro', 'San-Pédro', '4.7485,-6.6363', 'INACTIF', [], 0, 0)
];

const zones = [
  { id: 1, name: 'Cocody', type: 'COMMUNE', region: 'Abidjan', departement: 'Abidjan', isActive: true },
  { id: 2, name: 'Yopougon', type: 'COMMUNE', region: 'Abidjan', departement: 'Abidjan', isActive: true },
  { id: 3, name: 'Marcory', type: 'COMMUNE', region: 'Abidjan', departement: 'Abidjan', isActive: true },
  { id: 4, name: 'Bouaké', type: 'VILLE', region: 'Gbêkê', departement: 'Bouaké', isActive: true },
  { id: 5, name: 'San-Pédro', type: 'VILLE', region: 'San-Pédro', departement: 'San-Pédro', isActive: false }
];

const emergencies = [
  { id: 1, name: 'SAMU', number: '185', category: 'medical', description: 'Urgences médicales', color: '#236B40', icon: 'medical' },
  { id: 2, name: 'Pompiers', number: '180', category: 'fire', description: 'Incendie et secours', color: '#F57C00', icon: 'fire' },
  { id: 3, name: 'Police secours', number: '110', category: 'police', description: 'Police nationale', color: '#0F2644', icon: 'police' },
  { id: 4, name: 'CNTS', number: '+2252721222020', category: 'bloodBank', description: 'Centre national de transfusion sanguine', color: '#C56A12', icon: 'blood' }
];

const clients = [
  { id: 1, email: 'aya.kone@example.ci', phone: '+2250708123456', firstName: 'Aya', lastName: 'Koné', providerType: 'EMAIL', isActive: true, latitude: 5.34, longitude: -4.02, createdAt: '2026-10-02T08:12:00Z' },
  { id: 2, email: 'koffi.yao@gmail.com', phone: '+2250501987654', firstName: 'Koffi', lastName: 'Yao', providerType: 'GOOGLE', isActive: true, createdAt: '2026-09-18T14:40:00Z' },
  { id: 3, email: 'adama.traore@example.ci', phone: '+2250102456789', firstName: 'Adama', lastName: 'Traoré', providerType: 'FACEBOOK', isActive: false, createdAt: '2026-08-01T11:00:00Z' }
];

const users = [
  { id: 1, email: 'yann.kouassi@pharmaciegarde.ci', firstName: 'Yann', lastName: 'Kouassi', role: 'ADMIN' },
  { id: 2, email: 'ama.bamba@pharmaciegarde.ci', firstName: 'Ama', lastName: 'Bamba', role: 'OPERATOR' }
];

const periods = [
  { id: 1, startDate: '2026-11-09', endDate: '2026-11-16', status: 'ACTIVE', createdAt: '2026-11-08T09:00:00Z', duties: [] },
  { id: 2, startDate: '2026-11-16', endDate: '2026-11-23', status: 'DRAFT', createdAt: '2026-11-10T09:00:00Z', duties: [] }
];

const dutyFiles = [
  { id: 11, name: 'Affiche Cocody', fileName: 'affiche-cocody.jpg', status: 'PROCESSED', dutyPeriodId: 1, createdAt: '2026-11-08T10:00:00Z', processedDate: '2026-11-08T10:05:00Z' },
  { id: 12, name: 'Affiche Yopougon', fileName: 'affiche-yopougon.jpg', status: 'PENDING', dutyPeriodId: 1, createdAt: '2026-11-08T10:20:00Z' },
  { id: 13, name: 'Liste Excel semaine', fileName: 'gardes-s46.xlsx', status: 'FAILED', dutyPeriodId: 1, createdAt: '2026-11-08T11:00:00Z' }
];

const duties = [
  dutyRow(21, 1, 1, 'PHARMACIE DU PLATEAU', 'Cocody', 'ACTIVE'),
  dutyRow(22, 1, 3, 'PHARMACIE SAINT JEAN', 'Yopougon', 'ACTIVE'),
  dutyRow(23, 1, 2, 'PHARMACIE DE LA PAIX', 'Marcory', 'TO_VERIFY'),
  dutyRow(24, 1, 5, 'PHARMACIE LES OSCARS', 'Cocody', 'DISABLED')
];

const reviews = {
  1: [
    { id: 1, pharmacyId: 1, clientId: 1, clientName: 'Aya Koné', rating: 5, comment: 'Accueil excellent, ouverte toute la nuit.', createdAt: '2026-11-01T19:12:00Z' },
    { id: 2, pharmacyId: 1, clientId: 2, clientName: 'Koffi Yao', rating: 4, comment: 'Un peu d’attente mais stock complet.', createdAt: '2026-10-22T08:40:00Z' }
  ]
};

function pharmacy(id, name, pharmacistName, commune, city, location, statut, assuranceIds, averageRating, totalReviews) {
  return {
    id, name, pharmacistName,
    phone1: '+225272020' + String(1000 + id),
    phone2: '',
    email: name.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@pharmacie.ci',
    horaires: 'Lun–Sam 08:00–22:00, dimanche et gardes selon planning',
    city, commune, district: commune,
    description: 'Officine de garde à ' + commune + '.',
    photo: '',
    statut, location, assuranceIds,
    assurances: assurances.filter(a => assuranceIds.includes(a.id)),
    averageRating, totalReviews
  };
}

function dutyRow(id, periodId, pharmacyId, pharmacyName, zone, status) {
  const period = periods.find(p => p.id === periodId);
  return {
    id,
    pharmacyId,
    pharmacyName,
    pharmacyZone: zone,
    pharmacyCommune: zone,
    dutyPeriodId: periodId,
    startDate: period?.startDate,
    endDate: period?.endDate,
    status,
    isCurrent: status === 'ACTIVE',
    dutyFileId: 11,
    dutyFileName: 'affiche-cocody.jpg',
    name: pharmacyName,
    fileName: 'affiche-cocody.jpg',
    createdAt: '2026-11-08T10:05:00Z'
  };
}

function pageOf(url, items) {
  if (!url.searchParams.has('page') && !url.searchParams.has('size')) return items;
  const page = Number(url.searchParams.get('page') ?? 0);
  const size = Number(url.searchParams.get('size') ?? 20);
  const start = Math.max(0, page) * size;
  return {
    content: items.slice(start, start + size),
    page,
    size,
    totalElements: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / Math.max(size, 1)))
  };
}

function listed(url, items, whitelist, searchFields) {
  const queried = ['page', 'size', 'search', 'sort', 'limit'].some(key => url.searchParams.has(key));
  if (!queried) {
    return { page: items };
  }
  const sort = url.searchParams.get('sort');
  if (sort) {
    const field = sort.split(',')[0];
    if (!whitelist.includes(field)) {
      return { error: apiError(400, 'BAD_REQUEST', `Tri non autorisé : ${field}`, url.pathname) };
    }
  }
  let rows = items.slice();
  const search = (url.searchParams.get('search') || '').trim().toLowerCase();
  if (search) {
    rows = rows.filter(item => searchFields.some(field => String(item[field] ?? '').toLowerCase().includes(search)));
  }
  if (sort) {
    const [field, direction] = sort.split(',');
    const factor = direction === 'desc' ? -1 : 1;
    rows.sort((left, right) => String(left[field] ?? '').localeCompare(String(right[field] ?? ''), 'fr', { numeric: true }) * factor);
  }
  const limit = url.searchParams.get('limit');
  const page = Number(url.searchParams.get('page') ?? 0);
  const size = Number(limit ?? url.searchParams.get('size') ?? 20);
  const start = Math.max(0, page) * size;
  return {
    page: {
      content: rows.slice(start, start + size),
      page,
      size,
      totalElements: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / Math.max(size, 1)))
    }
  };
}

const jobs = new Map();

function demoPreview(id, file) {
  const alt = (pharmacyId, name, city, commune, score) => ({ pharmacyId, name, city, commune, phone: '', score });
  const lines = [
    { lineIndex: 0, zone: 'Cocody', pharmacyName: 'PHARMACIE DU PLATEAU', normalizedName: 'PHARMACIE DU PLATEAU', pharmacistName: 'Dr Awa Koné', phoneNumbers: '+2252720201001', location: 'Plateau', matchStatus: 'MATCHED', confidence: 0.97, suggestedPharmacyId: 1, suggestedPharmacyName: 'PHARMACIE DU PLATEAU', suggestedCity: 'Abidjan', dutyAlreadyExists: false, alternatives: [alt(1, 'PHARMACIE DU PLATEAU', 'Abidjan', 'Cocody', 0.97), alt(5, 'PHARMACIE LES OSCARS', 'Abidjan', 'Cocody', 0.61)] },
    { lineIndex: 1, zone: 'Marcory', pharmacyName: 'PHARMACIE DE LA PAI', normalizedName: 'PHARMACIE DE LA PAIX', pharmacistName: 'Dr Yao', phoneNumbers: '', location: '', matchStatus: 'AMBIGUOUS', confidence: 0.86, suggestedPharmacyId: 2, suggestedPharmacyName: 'PHARMACIE DE LA PAIX', suggestedCity: 'Abidjan', dutyAlreadyExists: false, alternatives: [alt(2, 'PHARMACIE DE LA PAIX', 'Abidjan', 'Marcory', 0.86), alt(4, 'PHARMACIE DU MARCHE', 'Abidjan', 'Treichville', 0.74), alt(6, 'PHARMACIE DE L’INDENIE', 'Abidjan', 'Abobo', 0.58)] },
    { lineIndex: 2, zone: 'Bingerville', pharmacyName: 'PHARMACIE NOUVELLE DE BINGERVILLE', normalizedName: 'PHARMACIE NOUVELLE DE BINGERVILLE', pharmacistName: '', phoneNumbers: '0708091011', location: null, matchStatus: 'NOT_FOUND', confidence: 0.41, suggestedPharmacyId: null, suggestedPharmacyName: null, suggestedCity: null, dutyAlreadyExists: false, alternatives: [alt(6, 'PHARMACIE DE L’INDENIE', 'Abidjan', 'Abobo', 0.58)] }
  ];
  return { dutyFileId: id, dutyPeriodId: file.dutyPeriodId, contentHash: 'demo', alreadyProcessed: false, linesExtracted: lines.length, matched: 1, ambiguous: 1, notFound: 1, duplicates: 0, lines };
}

function apiError(statusCode, status, message, path) {
  return { timestamp: new Date().toISOString(), statusCode, status, error: message, message, path };
}

const loginAttempts = [];

function send(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function parseMultipart(buffer, contentType) {
  const match = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType || '');
  if (!match) return { fields: {}, files: [] };
  const boundary = match[1] || match[2];
  const raw = buffer.toString('latin1');
  const parts = raw.split('--' + boundary).slice(1, -1);
  const fields = {};
  const files = [];
  for (const part of parts) {
    const splitAt = part.indexOf('\r\n\r\n');
    if (splitAt < 0) continue;
    const head = part.slice(0, splitAt);
    let body = part.slice(splitAt + 4);
    if (body.endsWith('\r\n')) body = body.slice(0, -2);
    const nameMatch = /name="([^"]+)"/i.exec(head);
    const fileMatch = /filename="([^"]*)"/i.exec(head);
    if (!nameMatch) continue;
    if (fileMatch && fileMatch[1]) {
      files.push({ field: nameMatch[1], filename: fileMatch[1], size: body.length });
    } else {
      fields[nameMatch[1]] = body;
    }
  }
  return { fields, files };
}

function dashboard() {
  return {
    overview: {
      totalPharmacies: pharmacies.length,
      totalPeriods: periods.length,
      totalDuties: duties.length,
      totalClients: clients.length,
      totalUsers: users.length,
      totalZones: zones.length
    },
    currentPeriod: {
      periodId: 1,
      startDate: '2026-11-09',
      endDate: '2026-11-16',
      pharmaciesInDuty: duties.filter(d => d.status === 'ACTIVE').length,
      zonesCovered: 3,
      filesUploaded: dutyFiles.length,
      filesProcessed: dutyFiles.filter(f => f.status === 'PROCESSED').length,
      daysRemaining: 5
    },
    pharmacyStats: {
      activePharmacies: pharmacies.filter(p => p.statut === 'ACTIF').length,
      inactivePharmacies: pharmacies.filter(p => p.statut === 'INACTIF').length,
      pharmaciesByZone: { Cocody: 2, Yopougon: 1, Marcory: 1, Abobo: 1 },
      topZones: [
        { zone: 'Cocody', count: 2 },
        { zone: 'Yopougon', count: 1 },
        { zone: 'Marcory', count: 1 },
        { zone: 'Abobo', count: 1 },
        { zone: 'Bouaké', count: 1 }
      ],
      pharmaciesCreatedThisMonth: 2
    },
    fileStats: {
      totalFiles: dutyFiles.length,
      pendingFiles: dutyFiles.filter(f => f.status === 'PENDING').length,
      processingFiles: 0,
      completedFiles: dutyFiles.filter(f => f.status === 'PROCESSED').length,
      failedFiles: dutyFiles.filter(f => f.status === 'FAILED').length,
      successRate: 67,
      totalPharmaciesExtracted: duties.length
    },
    recentActivity: {
      recentPeriods: periods.map(p => ({ id: p.id, startDate: p.startDate, endDate: p.endDate, dutiesCount: duties.filter(d => d.dutyPeriodId === p.id).length })),
      recentFiles: dutyFiles.map(f => ({ id: f.id, fileName: f.fileName, status: f.status === 'PROCESSED' ? 'PROCESSED' : f.status, uploadedAt: f.createdAt })),
      recentPharmacies: pharmacies.slice(0, 5).map(p => ({ id: p.id, name: p.name, zone: p.commune, createdAt: '2026-10-12T09:00:00Z' }))
    },
    alerts: [
      { type: 'FILE_ERROR', level: 'HIGH', message: 'Un fichier Excel n’a pas pu être lu.', count: 1 },
      { type: 'PERIOD_EXPIRING', level: 'MEDIUM', message: 'La période active se termine dans 5 jours.', count: 5 },
      { type: 'PENDING_FILES', level: 'LOW', message: 'Une affiche est encore en attente de traitement.', count: 1 }
    ]
  };
}

function syncPeriodDuties(period) {
  if (!period) return period;
  return { ...period, duties: dutyFiles.filter(f => f.dutyPeriodId === period.id) };
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, {});
    return;
  }
  const url = new URL(req.url || '/', 'http://localhost');
  const path = url.pathname.replace(/\/$/, '') || '/';
  const method = req.method || 'GET';
  const writing = method !== 'GET' && method !== 'HEAD';
  if (writing && path !== '/api/auth/login' && !(req.headers.authorization || '').startsWith('Bearer ')) {
    send(res, 401, apiError(401, 'UNAUTHORIZED', 'Authentification requise', path));
    return;
  }

  try {
    if (method === 'POST' && path === '/api/auth/login') {
      const now = Date.now();
      while (loginAttempts.length && now - loginAttempts[0] > 60000) loginAttempts.shift();
      if (loginAttempts.length >= 10) {
        send(res, 429, apiError(429, 'TOO_MANY_REQUESTS', 'Trop de tentatives de connexion. Réessayez dans une minute.', path));
        return;
      }
      loginAttempts.push(now);
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      send(res, 200, {
        id: 1,
        email: body.email || 'yann.kouassi@pharmaciegarde.ci',
        firstName: 'Yann',
        lastName: 'Kouassi',
        role: 'ADMIN',
        token: 'demo-token-non-secret',
        tokenType: 'Bearer',
        expiresInSeconds: 86400
      });
      return;
    }

    if (path === '/api/dashboard/stats' && method === 'GET') return send(res, 200, dashboard());
    if (path === '/api/reports/chart/pharmacy-status-pie') {
      const active = pharmacies.filter(p => p.statut === 'ACTIF').length;
      const inactive = pharmacies.length - active;
      return send(res, 200, { labels: ['Actives', 'Inactives'], values: [active, inactive], total: pharmacies.length, colors: ['#236B40', '#C56A12'] });
    }
    if (path === '/api/reports/chart/pharmacy-creation-trend-line') {
      return send(res, 200, { labels: ['Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov'], values: [2, 3, 1, 4, 2, 3] });
    }
    if (path === '/api/reports/chart/top-zones-bar') {
      return send(res, 200, { labels: ['Cocody', 'Yopougon', 'Marcory', 'Abobo', 'Bouaké'], values: [2, 1, 1, 1, 1], totalZones: 5 });
    }
    if (path === '/api/reports/chart/cumulative-trend-area') {
      return send(res, 200, {
        labels: ['Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov'],
        series: [
          { name: 'Pharmacies', data: [8, 11, 12, 16, 18, 21], color: '#236B40' },
          { name: 'Gardes', data: [20, 24, 22, 30, 28, 34], color: '#F57C00' }
        ]
      });
    }

    if (path === '/api/pharmacies/search' && method === 'GET') {
      const q = (url.searchParams.get('q') || '').trim().toLowerCase();
      const city = (url.searchParams.get('city') || '').trim().toLowerCase();
      const hits = pharmacies
        .filter(item => (!q || `${item.name} ${item.phone1 || ''} ${item.commune || ''}`.toLowerCase().includes(q)) && (!city || String(item.city || '').toLowerCase().includes(city)))
        .map(item => ({ id: item.id, name: item.name, city: item.city, commune: item.commune, district: item.district, phone: item.phone1, score: q && item.name.toLowerCase().includes(q) ? 0.92 : 0.55 }));
      const page = Number(url.searchParams.get('page') ?? 0);
      const size = Math.min(Number(url.searchParams.get('limit') ?? 20), 50);
      return send(res, 200, { content: hits.slice(page * size, page * size + size), page, size, totalElements: hits.length, totalPages: Math.max(1, Math.ceil(hits.length / Math.max(size, 1))) });
    }
    if (path === '/api/pharmacies' && method === 'GET') {
      const result = listed(url, pharmacies, ['id', 'name', 'city', 'commune', 'statut'], ['name', 'city', 'commune', 'district', 'phone1']);
      if (result.error) return send(res, 400, result.error);
      return send(res, 200, result.page);
    }
    if (path === '/api/pharmacies' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const created = { ...body, id: ++seq, name: String(body.name || '').toUpperCase(), assurances: assurances.filter(a => (body.assuranceIds || []).includes(a.id)) };
      pharmacies.push(created);
      return send(res, 201, created);
    }
    const pharmacyMatch = path.match(/^\/api\/pharmacies\/(\d+)$/);
    if (pharmacyMatch) {
      const id = Number(pharmacyMatch[1]);
      const index = pharmacies.findIndex(p => p.id === id);
      if (index < 0) return send(res, 404, { message: 'Pharmacie introuvable' });
      if (method === 'GET') return send(res, 200, pharmacies[index]);
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        pharmacies[index] = { ...pharmacies[index], ...body, id, name: String(body.name || pharmacies[index].name).toUpperCase() };
        return send(res, 200, pharmacies[index]);
      }
      if (method === 'DELETE') {
        pharmacies.splice(index, 1);
        return send(res, 204, {});
      }
    }

    if (path === '/api/assurances' && method === 'GET') return send(res, 200, pageOf(url, assurances));
    if (path === '/api/assurances' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const created = { id: ++seq, ...body };
      assurances.push(created);
      return send(res, 201, created);
    }
    const assuranceMatch = path.match(/^\/api\/assurances\/(\d+)$/);
    if (assuranceMatch) {
      const id = Number(assuranceMatch[1]);
      const index = assurances.findIndex(a => a.id === id);
      if (index < 0) return send(res, 404, { message: 'Introuvable' });
      if (method === 'GET') return send(res, 200, assurances[index]);
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        assurances[index] = { ...assurances[index], ...body, id };
        return send(res, 200, assurances[index]);
      }
      if (method === 'DELETE') {
        assurances.splice(index, 1);
        return send(res, 204, {});
      }
    }

    if (path === '/api/emergency-numbers' && method === 'GET') return send(res, 200, pageOf(url, emergencies));
    if (path === '/api/emergency-numbers' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      emergencies.push({ id: ++seq, ...body });
      return send(res, 201, emergencies.at(-1));
    }
    const emergencyMatch = path.match(/^\/api\/emergency-numbers\/(\d+)$/);
    if (emergencyMatch) {
      const id = Number(emergencyMatch[1]);
      const index = emergencies.findIndex(e => e.id === id);
      if (index < 0) return send(res, 404, {});
      if (method === 'GET') return send(res, 200, emergencies[index]);
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        emergencies[index] = { ...emergencies[index], ...body, id };
        return send(res, 200, emergencies[index]);
      }
      if (method === 'DELETE') {
        emergencies.splice(index, 1);
        return send(res, 204, {});
      }
    }

    if (path === '/api/zones' && method === 'GET') return send(res, 200, pageOf(url, zones));
    if (path === '/api/zones/active' && method === 'GET') return send(res, 200, zones.filter(z => z.isActive));
    if (path === '/api/zones' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      zones.push({ id: ++seq, ...body });
      return send(res, 201, zones.at(-1));
    }
    const zoneType = path.match(/^\/api\/zones\/type\/(.+)$/);
    if (zoneType && method === 'GET') return send(res, 200, zones.filter(z => z.type === decodeURIComponent(zoneType[1])));
    const zoneRegion = path.match(/^\/api\/zones\/region\/(.+)$/);
    if (zoneRegion && method === 'GET') return send(res, 200, zones.filter(z => z.region === decodeURIComponent(zoneRegion[1])));
    const zoneId = path.match(/^\/api\/zones\/(\d+)$/);
    if (zoneId) {
      const id = Number(zoneId[1]);
      const index = zones.findIndex(z => z.id === id);
      if (index < 0) return send(res, 404, {});
      if (method === 'GET') return send(res, 200, zones[index]);
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        zones[index] = { ...zones[index], ...body, id };
        return send(res, 200, zones[index]);
      }
      if (method === 'DELETE') {
        zones.splice(index, 1);
        return send(res, 204, {});
      }
    }

    if (path === '/api/clients' && method === 'GET') {
      const result = listed(url, clients, ['id', 'phone', 'firstName', 'lastName', 'email'], ['phone', 'firstName', 'lastName', 'email']);
      if (result.error) return send(res, 400, result.error);
      return send(res, 200, result.page);
    }
    const clientAction = path.match(/^\/api\/clients\/(\d+)(?:\/(status|activate|deactivate))?$/);
    if (clientAction) {
      const id = Number(clientAction[1]);
      const client = clients.find(c => c.id === id);
      if (!client) return send(res, 404, {});
      if (method === 'GET') return send(res, 200, client);
      if (method === 'PUT' && clientAction[2] === 'status') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        client.isActive = !!body.isActive;
        return send(res, 200, client);
      }
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        Object.assign(client, body, { id });
        return send(res, 200, client);
      }
      if (method === 'POST' && clientAction[2] === 'activate') {
        client.isActive = true;
        return send(res, 200, client);
      }
      if (method === 'POST' && clientAction[2] === 'deactivate') {
        client.isActive = false;
        return send(res, 200, client);
      }
    }

    if (path === '/api/users' && method === 'GET') {
      const result = listed(url, users, ['id', 'email', 'firstName', 'lastName', 'role'], ['email', 'firstName', 'lastName', 'role']);
      if (result.error) return send(res, 400, result.error);
      return send(res, 200, result.page);
    }
    if (path === '/api/users' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const created = { id: ++seq, email: body.email, firstName: body.firstName, lastName: body.lastName, role: 'OPERATOR' };
      users.push(created);
      return send(res, 201, created);
    }
    const userMatch = path.match(/^\/api\/users\/(\d+)$/);
    if (userMatch) {
      const id = Number(userMatch[1]);
      const index = users.findIndex(u => u.id === id);
      if (index < 0) return send(res, 404, {});
      if (method === 'GET') return send(res, 200, users[index]);
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        users[index] = { ...users[index], ...body, id };
        delete users[index].password;
        return send(res, 200, users[index]);
      }
      if (method === 'DELETE') {
        users.splice(index, 1);
        return send(res, 204, {});
      }
    }

    if (path === '/api/duty-periods' && method === 'GET') {
      const result = listed(url, periods.map(syncPeriodDuties), ['id', 'startDate', 'endDate', 'isCurrent'], ['startDate', 'endDate', 'status']);
      if (result.error) return send(res, 400, result.error);
      return send(res, 200, result.page);
    }
    if (path === '/api/duty-periods/current' && method === 'GET') return send(res, 200, syncPeriodDuties(periods.find(p => p.status === 'ACTIVE')));
    if (path === '/api/duty-periods/current/all' && method === 'GET') return send(res, 200, periods.filter(p => p.status === 'ACTIVE').map(syncPeriodDuties));
    if (path === '/api/duty-periods' && method === 'POST') {
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const created = { id: ++seq, startDate: body.startDate, endDate: body.endDate, status: 'DRAFT', duties: [] };
      periods.push(created);
      return send(res, 201, created);
    }
    const periodAction = path.match(/^\/api\/duty-periods\/(\d+)(?:\/(activate))?$/);
    if (periodAction) {
      const id = Number(periodAction[1]);
      const index = periods.findIndex(p => p.id === id);
      if (index < 0) return send(res, 404, { message: 'Période introuvable' });
      if (method === 'GET') return send(res, 200, syncPeriodDuties(periods[index]));
      if (method === 'PUT') {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        periods[index] = { ...periods[index], ...body, id };
        return send(res, 200, syncPeriodDuties(periods[index]));
      }
      if (method === 'DELETE') {
        periods.splice(index, 1);
        return send(res, 204, {});
      }
      if (method === 'POST' && periodAction[2] === 'activate') {
        periods.forEach(p => { if (p.status === 'ACTIVE') p.status = 'COMPLETED'; });
        periods[index].status = 'ACTIVE';
        return send(res, 200, syncPeriodDuties(periods[index]));
      }
    }

    if (path === '/api/duty-files' && method === 'GET') return send(res, 200, pageOf(url, dutyFiles.map(file => ({
      ...file,
      uploadDate: file.uploadDate || file.createdAt,
      status: file.status === 'PROCESSED' ? 'COMPLETED' : file.status
    }))));
    const filesByPeriod = path.match(/^\/api\/duty-files\/period\/(\d+)$/);
    if (filesByPeriod && method === 'GET') {
      const id = Number(filesByPeriod[1]);
      return send(res, 200, dutyFiles.filter(f => f.dutyPeriodId === id));
    }
    if (path === '/api/duty-files/upload' && method === 'POST') {
      const buffer = await readBody(req);
      const parsed = parseMultipart(buffer, req.headers['content-type']);
      const periodId = Number(parsed.fields.dutyPeriodId || 0) || undefined;
      const created = parsed.files.map(file => ({
        id: ++seq,
        name: file.filename,
        fileName: file.filename,
        status: 'PENDING',
        dutyPeriodId: periodId,
        uploadDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }));
      dutyFiles.push(...created);
      return send(res, 201, created.length === 1 && parsed.files.some(f => f.field === 'file') ? created[0] : created);
    }
    if (path === '/api/duty-files/upload-excel' && method === 'POST') {
      const buffer = await readBody(req);
      const parsed = parseMultipart(buffer, req.headers['content-type']);
      const file = parsed.files[0];
      const created = {
        id: ++seq,
        name: file?.filename || 'excel',
        fileName: file?.filename || 'import.xlsx',
        status: 'PENDING',
        dutyPeriodId: Number(parsed.fields.dutyPeriodId),
        createdAt: new Date().toISOString()
      };
      dutyFiles.push(created);
      return send(res, 201, created);
    }
    const previewAsync = path.match(/^\/api\/duty-files\/(\d+)\/preview-async$/);
    if (previewAsync && method === 'POST') {
      await readBody(req);
      const id = Number(previewAsync[1]);
      const file = dutyFiles.find(item => item.id === id);
      if (!file) return send(res, 404, apiError(404, 'NOT_FOUND', 'Fichier de garde introuvable', path));
      const jobId = `job-${++seq}`;
      jobs.set(jobId, { readyAt: Date.now() + 900, preview: demoPreview(id, file) });
      return send(res, 202, { jobId, status: 'PENDING', message: 'Prévisualisation en file', jobType: 'PREVIEW', result: null, preview: null });
    }
    const jobMatch = path.match(/^\/api\/duty-files\/jobs\/([^/]+)$/);
    if (jobMatch && method === 'GET') {
      const job = jobs.get(jobMatch[1]);
      if (!job) return send(res, 404, apiError(404, 'NOT_FOUND', 'Tâche introuvable', path));
      if (Date.now() < job.readyAt) {
        return send(res, 200, { jobId: jobMatch[1], status: 'RUNNING', message: 'Prévisualisation en cours', jobType: 'PREVIEW', result: null, preview: null });
      }
      return send(res, 200, { jobId: jobMatch[1], status: 'COMPLETED', message: 'Prévisualisation terminée', jobType: 'PREVIEW', result: null, preview: job.preview });
    }
    const previewMatch = path.match(/^\/api\/duty-files\/(\d+)\/preview$/);
    if (previewMatch && method === 'POST') {
      await readBody(req);
      const id = Number(previewMatch[1]);
      const file = dutyFiles.find(item => item.id === id);
      if (!file) return send(res, 404, apiError(404, 'NOT_FOUND', 'Fichier de garde introuvable', path));
      return send(res, 200, demoPreview(id, file));
    }
    const confirmMatch = path.match(/^\/api\/duty-files\/(\d+)\/confirm$/);
    if (confirmMatch && method === 'POST') {
      const id = Number(confirmMatch[1]);
      const file = dutyFiles.find(item => item.id === id);
      if (!file) return send(res, 404, apiError(404, 'NOT_FOUND', 'Fichier de garde introuvable', path));
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      let dutiesCreated = 0, pharmaciesCreated = 0, skipped = 0, duplicates = 0, errors = 0;
      for (const line of body.lines || []) {
        if (line.skip) { skipped++; continue; }
        if (line.createPharmacy && !line.pharmacyId) {
          const phone = String(line.phone || String(line.phoneNumbers || '').split(/[;,]/)[0] || '');
          const digits = phone.replace(/\D/g, '');
          if (digits.length < 8 || !(line.city || line.zone) || !(line.commune || line.zone)) { errors++; continue; }
          const created = {
            id: ++seq,
            name: String(line.pharmacyName || '').toUpperCase(),
            city: line.city || line.zone,
            commune: line.commune || line.zone,
            district: line.commune || line.zone,
            phone1: phone,
            email: '',
            location: line.coordinates || null,
            statut: 'ACTIF',
            pharmacistName: line.pharmacistName || ''
          };
          pharmacies.push(created);
          line.pharmacyId = created.id;
          pharmaciesCreated++;
        }
        if (!line.pharmacyId) { errors++; continue; }
        const exists = duties.some(duty => duty.dutyPeriodId === file.dutyPeriodId && duty.pharmacyId === line.pharmacyId);
        if (exists) { duplicates++; continue; }
        const pharmacy = pharmacies.find(item => item.id === line.pharmacyId);
        duties.push({ id: ++seq, pharmacyId: line.pharmacyId, pharmacyName: pharmacy?.name || line.pharmacyName, pharmacyZone: line.zone, dutyPeriodId: file.dutyPeriodId, status: 'ACTIVE', dutyFileId: file.id, dutyFileName: file.fileName, createdAt: new Date().toISOString() });
        dutiesCreated++;
      }
      file.status = errors && !dutiesCreated ? 'FAILED' : 'COMPLETED';
      return send(res, 200, { dutiesCreated, pharmaciesCreated, skipped, duplicates, errors, lines: [] });
    }
    const processMatch = path.match(/^\/api\/duty-files\/(\d+)\/process$/);
    if (processMatch && method === 'POST') {
      const id = Number(processMatch[1]);
      const file = dutyFiles.find(f => f.id === id);
      if (!file) return send(res, 404, {});
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      file.status = 'PROCESSED';
      file.processedDate = new Date().toISOString();
      const samples = [
        { pharmacyId: 1, pharmacyName: 'PHARMACIE DU PLATEAU', zone: 'Cocody' },
        { pharmacyId: 2, pharmacyName: 'PHARMACIE DE LA PAI', zone: 'Marcory' },
        { pharmacyId: null, pharmacyName: 'PHARMACIE NOUVELLE DE BINGERVILLE', zone: 'Bingerville' }
      ];
      samples.forEach((sample, index) => {
        duties.push({
          id: ++seq,
          pharmacyId: sample.pharmacyId,
          pharmacyName: sample.pharmacyName,
          pharmacyZone: sample.zone,
          pharmacyCommune: sample.zone,
          dutyPeriodId: file.dutyPeriodId,
          startDate: body.startDate,
          endDate: body.endDate,
          status: index === 2 ? 'TO_VERIFY' : 'ACTIVE',
          dutyFileId: file.id,
          dutyFileName: file.fileName,
          name: sample.pharmacyName,
          fileName: file.fileName,
          createdAt: new Date().toISOString()
        });
      });
      return send(res, 200, file);
    }
    const fileId = path.match(/^\/api\/duty-files\/(\d+)$/);
    if (fileId) {
      const id = Number(fileId[1]);
      const index = dutyFiles.findIndex(f => f.id === id);
      if (index < 0) return send(res, 404, {});
      if (method === 'GET') return send(res, 200, dutyFiles[index]);
      if (method === 'DELETE') {
        dutyFiles.splice(index, 1);
        return send(res, 204, {});
      }
    }

    const dutiesByPeriod = path.match(/^\/api\/duties\/period\/(\d+)$/);
    if (dutiesByPeriod && method === 'GET') {
      const id = Number(dutiesByPeriod[1]);
      return send(res, 200, duties.filter(d => d.dutyPeriodId === id));
    }
    const dutyPharmacy = path.match(/^\/api\/duties\/(\d+)\/pharmacy$/);
    if (dutyPharmacy && method === 'PUT') {
      const duty = duties.find(item => item.id === Number(dutyPharmacy[1]));
      if (!duty) return send(res, 404, {});
      const body = JSON.parse((await readBody(req)).toString() || '{}');
      const found = pharmacies.find(item => item.id === Number(body.pharmacyId));
      duty.pharmacyId = Number(body.pharmacyId);
      if (found) duty.pharmacyName = found.name;
      return send(res, 200, duty);
    }
    const dutyToggle = path.match(/^\/api\/duties\/(\d+)\/(disable|enable)$/);
    if (dutyToggle && method === 'PUT') {
      const duty = duties.find(d => d.id === Number(dutyToggle[1]));
      if (!duty) return send(res, 404, {});
      duty.status = dutyToggle[2] === 'disable' ? 'DISABLED' : 'ACTIVE';
      return send(res, 200, {});
    }
    const dutyUpdate = path.match(/^\/api\/duties\/(\d+)$/);
    if (dutyUpdate && method === 'PUT') {
      const duty = duties.find(d => d.id === Number(dutyUpdate[1]));
      if (!duty) return send(res, 404, {});
      const contentType = req.headers['content-type'] || '';
      if (contentType.includes('application/json')) {
        const body = JSON.parse((await readBody(req)).toString() || '{}');
        if (body.pharmacyId) {
          const found = pharmacies.find(p => p.id === Number(body.pharmacyId));
          duty.pharmacyId = Number(body.pharmacyId);
          duty.pharmacyName = found?.name || duty.pharmacyName;
        }
        Object.assign(duty, body);
      }
      return send(res, 200, duty);
    }

    const reviewList = path.match(/^\/api\/client\/pharmacies\/(\d+)\/reviews$/);
    if (reviewList && method === 'GET') {
      return send(res, 200, reviews[Number(reviewList[1])] || []);
    }
    const reviewDelete = path.match(/^\/api\/client\/pharmacies\/admin\/reviews\/(\d+)$/);
    if (reviewDelete && method === 'DELETE') {
      const id = Number(reviewDelete[1]);
      for (const key of Object.keys(reviews)) {
        reviews[key] = reviews[key].filter(r => r.id !== id);
      }
      return send(res, 204, {});
    }

    send(res, 404, { message: 'Route mock introuvable', path });
  } catch (error) {
    send(res, 500, { message: error instanceof Error ? error.message : 'Erreur mock' });
  }
});

server.listen(PORT, () => {
  console.log(`Demo API Pharmacy Guard sur http://localhost:${PORT}/api`);
});
