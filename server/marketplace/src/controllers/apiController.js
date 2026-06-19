import prisma from '../utils/prisma.js';

export const createApi = async (req, res) => {
  try {
    const { name, description, upstreamUrl, allowedMethods, exampleDocs } = req.body;

    if (!name || !upstreamUrl) {
      return res.status(400).json({ error: 'Name and upstreamUrl are required' });
    }

    const api = await prisma.api.create({
      data: {
        name,
        description,
        upstreamUrl,
        allowedMethods: allowedMethods || ['GET', 'POST', 'PUT', 'DELETE'],
        exampleDocs,
        providerId: req.user.id
      }
    });

    return res.status(201).json({ message: 'API published successfully', api });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getApis = async (req, res) => {
  try {
    const apis = await prisma.api.findMany({
      include: {
        plans: true,
        provider: {
          select: { id: true, email: true }
        }
      }
    });

    // Strip upstreamUrl for non-owners/non-admins
    const sanitizedApis = apis.map(api => {
      const isOwner = req.user && api.providerId === req.user.id;
      const isAdmin = req.user && req.user.role === 'ADMIN';
      if (!isOwner && !isAdmin) {
        const { upstreamUrl: _upstreamUrl, ...sanitized } = api;
        return sanitized;
      }
      return api;
    });

    return res.json({ apis: sanitizedApis });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getApiById = async (req, res) => {
  try {
    const { id } = req.params;
    const api = await prisma.api.findUnique({
      where: { id },
      include: {
        plans: true,
        provider: {
          select: { id: true, email: true }
        }
      }
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    const isOwner = req.user && api.providerId === req.user.id;
    const isAdmin = req.user && req.user.role === 'ADMIN';
    if (!isOwner && !isAdmin) {
      delete api.upstreamUrl;
    }

    return res.json({ api });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createPlan = async (req, res) => {
  try {
    const { apiId } = req.params;
    const { name, requestsPerMin, price } = req.body;

    if (!name || requestsPerMin === undefined || price === undefined) {
      return res.status(400).json({ error: 'Name, requestsPerMin, and price are required' });
    }

    const api = await prisma.api.findUnique({
      where: { id: apiId }
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    // Only provider of the API can create a plan for it
    if (api.providerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to add plan to this API' });
    }

    const plan = await prisma.plan.create({
      data: {
        apiId,
        name,
        requestsPerMin: parseInt(requestsPerMin),
        price: parseFloat(price)
      }
    });

    return res.status(201).json({ message: 'Plan created successfully', plan });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const { apiId, planId } = req.params;
    const { name, requestsPerMin, price } = req.body;

    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: { api: true }
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    if (plan.apiId !== apiId) {
      return res.status(400).json({ error: 'Plan does not belong to this API' });
    }

    if (plan.api.providerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit plans for this API' });
    }

    const updated = await prisma.plan.update({
      where: { id: planId },
      data: {
        name,
        requestsPerMin: parseInt(requestsPerMin),
        price: parseFloat(price)
      }
    });

    return res.json({ message: 'Plan updated successfully', plan: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



export const getAnalyticsSummary = async (req, res) => {
  try {
    const providerApis = await prisma.api.findMany({
      where: { providerId: req.user.id },
      select: { id: true, name: true }
    });

    const apiIds = providerApis.map(api => api.id);

    if (apiIds.length === 0) {
      return res.json({
        totalRequests: 0,
        avgLatency: 0,
        rateLimitsHit: 0,
        successRate: 100.0,
        chartData: []
      });
    }

    const totalRequests = await prisma.apiLog.count({
      where: { apiId: { in: apiIds } }
    });

    const avgLatencyRes = await prisma.apiLog.aggregate({
      where: { apiId: { in: apiIds } },
      _avg: { latencyMs: true }
    });
    const avgLatency = avgLatencyRes._avg.latencyMs ? Math.round(avgLatencyRes._avg.latencyMs * 10) / 10 : 0;

    const rateLimitsHit = await prisma.apiLog.count({
      where: {
        apiId: { in: apiIds },
        statusCode: 429
      }
    });

    const successRequests = await prisma.apiLog.count({
      where: {
        apiId: { in: apiIds },
        statusCode: { lt: 400 }
      }
    });
    const successRate = totalRequests > 0 ? Math.round((successRequests / totalRequests) * 1000) / 10 : 100.0;

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const logs = await prisma.apiLog.findMany({
      where: {
        apiId: { in: apiIds },
        timestamp: { gte: oneDayAgo }
      },
      select: {
        statusCode: true,
        latencyMs: true,
        timestamp: true
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      const d = new Date();
      d.setHours(d.getHours() - i, 0, 0, 0);
      const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      hourlyData[d.getTime()] = { time: hourStr, requests: 0, latencySum: 0, errors: 0, countForLatency: 0 };
    }

    logs.forEach(log => {
      const logDate = new Date(log.timestamp);
      logDate.setMinutes(0, 0, 0);
      const key = logDate.getTime();
      if (hourlyData[key]) {
        hourlyData[key].requests += 1;
        hourlyData[key].latencySum += log.latencyMs;
        hourlyData[key].countForLatency += 1;
        if (log.statusCode === 429 || log.statusCode >= 400) {
          hourlyData[key].errors += 1;
        }
      }
    });

    const chartData = Object.keys(hourlyData)
      .sort()
      .map(key => {
        const item = hourlyData[key];
        return {
          time: item.time,
          requests: item.requests,
          latency: item.countForLatency > 0 ? Math.round(item.latencySum / item.countForLatency) : 0,
          errors: item.errors
        };
      });

    return res.json({
      totalRequests,
      avgLatency,
      rateLimitsHit,
      successRate,
      chartData
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getApiHealth = async (req, res) => {
  try {
    const { id } = req.params;

    const api = await prisma.api.findUnique({
      where: { id }
    });

    if (!api) {
      return res.status(404).json({ error: 'API not found' });
    }

    if (api.providerId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to view health of this API' });
    }

    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const fifteenMinutesAgo = new Date();
    fifteenMinutesAgo.setMinutes(fifteenMinutesAgo.getMinutes() - 15);

    const logs24h = await prisma.apiLog.findMany({
      where: {
        apiId: id,
        timestamp: { gte: oneDayAgo }
      },
      select: {
        statusCode: true,
        latencyMs: true,
        timestamp: true
      }
    });

    const totalRequests = logs24h.length;
    const serverErrors = logs24h.filter(log => log.statusCode >= 500).length;
    const uptime = totalRequests > 0 ? parseFloat(((totalRequests - serverErrors) / totalRequests * 100).toFixed(2)) : 100.00;

    const totalLatency = logs24h.reduce((acc, log) => acc + log.latencyMs, 0);
    const avgLatency = totalRequests > 0 ? Math.round(totalLatency / totalRequests) : 0;

    const recentLogs = logs24h.filter(log => new Date(log.timestamp) >= fifteenMinutesAgo);
    const recentTotal = recentLogs.length;
    const recentErrors = recentLogs.filter(log => log.statusCode >= 500).length;

    let status = 'OPERATIONAL';
    if (api.status === 'INACTIVE') {
      status = 'INACTIVE';
    } else if (recentTotal > 0 && recentErrors > 0) {
      const errorRate = recentErrors / recentTotal;
      if (errorRate > 0.5) {
        status = 'DOWN';
      } else {
        status = 'DEGRADED';
      }
    }

    const hourlyData = {};
    for (let i = 0; i < 24; i++) {
      const d = new Date();
      d.setHours(d.getHours() - i, 0, 0, 0);
      const hourStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      hourlyData[d.getTime()] = { timestamp: hourStr, latencySum: 0, count: 0 };
    }

    logs24h.forEach(log => {
      const logDate = new Date(log.timestamp);
      logDate.setMinutes(0, 0, 0);
      const key = logDate.getTime();
      if (hourlyData[key]) {
        hourlyData[key].latencySum += log.latencyMs;
        hourlyData[key].count += 1;
      }
    });

    const latencyHistory = Object.keys(hourlyData)
      .sort()
      .map(key => {
        const item = hourlyData[key];
        return {
          timestamp: item.timestamp,
          latency: item.count > 0 ? Math.round(item.latencySum / item.count) : 0
        };
      });

    return res.json({
      status,
      uptime,
      avgLatency,
      latencyHistory
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};



