import Client from "../models/client.model.js";
import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import { AppError } from '../utils/AppError.js';
import { clientValidator, clientUpdateValidator } from '../validators/client.validator.js';

// POST /api/client
export const createClient = async (req, res, next) => {
    try {
        const { name, cif, email, phone, address } = req.body;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Validar que el usuario tiene compañía asignada
        if (!companyId) {
            throw AppError.badRequest('Usuario no tiene compañía asignada');
        }

        // Verificar que no exista cliente con el mismo CIF en esa compañía
        const existingClient = await Client.findOne({ 
            cif, 
            company: companyId,
            deleted: false 
        });
        
        if (existingClient) {
            throw AppError.conflict('Ya existe un cliente con ese CIF en tu compañía');
        }

        const newClient = await Client.create({
            user: userId,
            company: companyId,
            name,
            cif,
            email,
            phone,
            address
        });
        
        res.status(201).json(newClient);
    } catch (error) {
        next(error);
    }
};

// GET /api/client
export const getClients = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, name, sort = 'createdAt' } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Construir filtro
        const filter = { user: userId, company: companyId, deleted: false };
        
        if (name) {
            filter.name = { $regex: name, $options: 'i' }; // búsqueda parcial, case-insensitive
        }

        // Calcular skip para paginación
        const skip = (Number(page) - 1) * Number(limit);

        // Obtener total de documentos y clientes paginados
        const [clients, total] = await Promise.all([
            Client.find(filter)
                .skip(skip)
                .limit(Number(limit))
                .sort({ [sort]: -1 }),
            Client.countDocuments(filter)
        ]);

        res.status(200).json({
            data: clients,
            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                totalItems: total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/client/:id
export const getClientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyId = req.user.company;
        
        const foundClient = await Client.findOne({ 
            _id: id, 
            user: userId, 
            company: companyId,
            deleted: false 
        });
        
        if (!foundClient) {
            throw AppError.notFound("Cliente no encontrado");
        }
        
        res.status(200).json(foundClient);
    } catch (error) {
        next(error);
    }
};

// PUT /api/client/:id
export const updateClient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, cif, email, phone, address } = req.body;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Verificar que el cliente pertenece al usuario/compañía
        const existingClient = await Client.findOne({ 
            _id: id, 
            user: userId, 
            company: companyId,
            deleted: false 
        });

        if (!existingClient) {
            throw AppError.notFound("Cliente no encontrado");
        }

        // Si se está actualizando el CIF, verificar que no exista otro cliente con ese CIF
        if (cif && cif !== existingClient.cif) {
            const duplicateCif = await Client.findOne({ 
                cif, 
                company: companyId,
                _id: { $ne: id },
                deleted: false 
            });
            
            if (duplicateCif) {
                throw AppError.conflict('Ya existe otro cliente con ese CIF en tu compañía');
            }
        }

        const updatedClient = await Client.findOneAndUpdate(
            { _id: id, user: userId, company: companyId, deleted: false },
            { name, cif, email, phone, address },
            { new: true, runValidators: true }
        );

        res.status(200).json(updatedClient);
    } catch (error) {
        next(error);
    }
};

//DELETE /api/client/:id?soft=true
export const deleteClient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { soft } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        const deletedClient = await Client.findOne({ 
            _id: id, 
            user: userId, 
            company: companyId 
        });

        if (!deletedClient) {
            throw AppError.notFound("Cliente no encontrado");
        }

        if (soft !== 'false') {
            // Soft delete (predeterminado)
            await deletedClient.softDelete();
        } else {
            // Hard delete
            await Client.hardDelete(id);
        }

        res.status(200).json({ 
            message: "Cliente eliminado correctamente",
            type: soft === 'true' ? 'archived' : 'deleted'
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/client/archived
export const getArchivedClients = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        const skip = (Number(page) - 1) * Number(limit);

        const [archivedClients, total] = await Promise.all([
            Client.find({ user: userId, company: companyId, deleted: true })
                .skip(skip)
                .limit(Number(limit))
                .sort({ deletedAt: -1 }),
            Client.countDocuments({ user: userId, company: companyId, deleted: true })
        ]);

        res.status(200).json({
            data: archivedClients,
            pagination: {
                currentPage: Number(page),
                limit: Number(limit),
                totalItems: total,
                totalPages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        next(error);
    }
};

// PATCH /api/client/:id/restore
export const restoreClient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyId = req.user.company;

        const archivedClient = await Client.findOne({ 
            _id: id, 
            user: userId, 
            company: companyId,
            deleted: true
        });

        if (!archivedClient) {
            throw AppError.notFound("Cliente archivado no encontrado");
        }
        await archivedClient.restore();
        res.status(200).json({
            message: "Cliente restaurado correctamente",
            data: archivedClient
        });
    } catch (error) {
        next(error);
    }
};