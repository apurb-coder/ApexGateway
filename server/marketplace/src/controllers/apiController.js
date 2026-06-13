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
        const { upstreamUrl, ...sanitized } = api;
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
