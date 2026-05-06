import Proyecto from "../models/proyecto.model.js";
import Client from "../models/client.model.js";
import { AppError } from '../utils/AppError.js';
import { proyectoValidator, proyectoUpdateValidator } from '../validators/proyecto.validator.js';

// POST /api/project
export const createProyecto = async (req, res, next) => {
    try {
        const { name, projectCode, description, address, client, status, budget, startDate, endDate } = req.body;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Validar que el usuario tiene compañía asignada
        if (!companyId) {
            throw AppError.badRequest('Usuario no tiene compañía asignada');
        }

        // Validar que el cliente existe y pertenece a la misma compañía
        const clientExists = await Client.findOne({
            _id: client,
            company: companyId,
            deleted: false
        });

        if (!clientExists) {
            throw AppError.badRequest('El cliente no existe o no pertenece a tu compañía');
        }

        // Verificar que no exista proyecto con el mismo código en esa compañía
        const existingProyecto = await Proyecto.findOne({
            projectCode,
            company: companyId,
            deleted: false
        });

        if (existingProyecto) {
            throw AppError.conflict('Ya existe un proyecto con ese código en tu compañía');
        }

        const newProyecto = await Proyecto.create({
            user: userId,
            company: companyId,
            name,
            projectCode,
            description,
            address,
            client,
            status: status || 'activo',
            budget,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined
        });

        // Populate client info
        await newProyecto.populate('client');

        res.status(201).json(newProyecto);
    } catch (error) {
        next(error);
    }
};

// GET /api/project
export const getProyectos = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, name, client, status, active = 'true', sort = '-createdAt' } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Construir filtro
        const filter = { user: userId, company: companyId, deleted: false };

        // Filtro por nombre (búsqueda parcial, case-insensitive)
        if (name) {
            filter.name = { $regex: name, $options: 'i' };
        }

        // Filtro por cliente
        if (client) {
            filter.client = client;
        }

        // Filtro por estado
        if (status) {
            filter.status = status;
        }

        // Filtro por activo (excluye completados/suspendidos) - solo si no se especificó un status
        if (active === 'true' && !status) {
            filter.status = { $in: ['activo', 'completado'] };
        }

        // Calcular skip para paginación
        const skip = (Number(page) - 1) * Number(limit);

        // Procesar sort: permite formato "-createdAt" o "createdAt"
        const sortObject = {};
        if (sort) {
            const sortField = sort.startsWith('-') ? sort.slice(1) : sort;
            const sortOrder = sort.startsWith('-') ? -1 : 1;
            sortObject[sortField] = sortOrder;
        }

        // Obtener total de documentos y proyectos paginados
        const [proyectos, total] = await Promise.all([
            Proyecto.find(filter)
                .populate('client')
                .skip(skip)
                .limit(Number(limit))
                .sort(sortObject),
            Proyecto.countDocuments(filter)
        ]);

        res.status(200).json({
            data: proyectos,
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

// GET /api/project/:id
export const getProyectoById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyId = req.user.company;

        const foundProyecto = await Proyecto.findOne({
            _id: id,
            user: userId,
            company: companyId,
            deleted: false
        }).populate('client');

        if (!foundProyecto) {
            throw AppError.notFound("Proyecto no encontrado");
        }

        res.status(200).json(foundProyecto);
    } catch (error) {
        next(error);
    }
};

// PUT /api/project/:id
export const updateProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, projectCode, description, address, client, status, budget, startDate, endDate } = req.body;
        const userId = req.user._id;
        const companyId = req.user.company;

        // Verificar que el proyecto pertenece al usuario/compañía
        const existingProyecto = await Proyecto.findOne({
            _id: id,
            user: userId,
            company: companyId,
            deleted: false
        });

        if (!existingProyecto) {
            throw AppError.notFound("Proyecto no encontrado");
        }

        // Si se está actualizando el cliente, validar que exista y pertenezca a la compañía
        if (client && client !== existingProyecto.client.toString()) {
            const clientExists = await Client.findOne({
                _id: client,
                company: companyId,
                deleted: false
            });

            if (!clientExists) {
                throw AppError.badRequest('El cliente no existe o no pertenece a tu compañía');
            }
        }

        // Si se está actualizando el código de proyecto, verificar que no exista otro con ese código
        if (projectCode && projectCode !== existingProyecto.projectCode) {
            const duplicateCode = await Proyecto.findOne({
                projectCode,
                company: companyId,
                _id: { $ne: id },
                deleted: false
            });

            if (duplicateCode) {
                throw AppError.conflict('Ya existe otro proyecto con ese código en tu compañía');
            }
        }

        const updateData = {
            ...(name && { name }),
            ...(projectCode && { projectCode }),
            ...(description !== undefined && { description }),
            ...(address && { address }),
            ...(client && { client }),
            ...(status && { status }),
            ...(budget !== undefined && { budget }),
            ...(startDate && { startDate: new Date(startDate) }),
            ...(endDate && { endDate: new Date(endDate) })
        };

        const updatedProyecto = await Proyecto.findOneAndUpdate(
            { _id: id, user: userId, company: companyId, deleted: false },
            updateData,
            { new: true, runValidators: true }
        ).populate('client');

        res.status(200).json(updatedProyecto);
    } catch (error) {
        next(error);
    }
};

// DELETE /api/project/:id?soft=true
export const deleteProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { soft = 'true' } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        const deletedProyecto = await Proyecto.findOne({
            _id: id,
            user: userId,
            company: companyId
        });

        if (!deletedProyecto) {
            throw AppError.notFound("Proyecto no encontrado");
        }

        if (soft) {
            // Soft delete
            await deletedProyecto.softDeleteById(id);
        } else {
            // Hard delete
            await deletedProyecto.hardDeleteById(id);
        }

        res.status(200).json({
            message: "Proyecto eliminado correctamente",
            type: soft === 'true' ? 'archived' : 'deleted'
        });
    } catch (error) {
        next(error);
    }
};

// GET /api/project/archived
export const getArchivedProyectos = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const userId = req.user._id;
        const companyId = req.user.company;

        const skip = (Number(page) - 1) * Number(limit);

        const [archivedProyectos, total] = await Promise.all([
            Proyecto.find({ user: userId, company: companyId, deleted: true })
                .populate('client')
                .skip(skip)
                .limit(Number(limit))
                .sort({ deletedAt: -1 }),
            Proyecto.countDocuments({ user: userId, company: companyId, deleted: true })
        ]);

        res.status(200).json({
            data: archivedProyectos,
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

// PATCH /api/project/:id/restore
export const restoreProyecto = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const companyId = req.user.company;

        const archivedProyecto = await Proyecto.findOne({
            _id: id,
            user: userId,
            company: companyId,
            deleted: true
        });

        if (!archivedProyecto) {
            throw AppError.notFound("Proyecto archivado no encontrado");
        }

        archivedProyecto.deleted = false;
        await archivedProyecto.save();

        await archivedProyecto.populate('client');

        res.status(200).json({
            message: "Proyecto restaurado correctamente",
            data: archivedProyecto
        });
    } catch (error) {
        next(error);
    }
};
