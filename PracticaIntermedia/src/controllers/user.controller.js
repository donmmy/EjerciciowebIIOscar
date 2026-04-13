import User from "../models/user.model.js";
import Company from "../models/company.model.js";
import { encrypt, compare, randomCode } from '../utils/handlePassword.js';
import { tokenSign, longTokenSign, shortTokenSign, verifyToken } from '../utils/handleJwt.js';
import { AppError } from '../utils/AppError.js';
import fs from 'fs';
import path from 'path';

//get all users
export const getAllUsers = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, role, isActive } = req.query;

        // Filtro dinámico
        const filter = {};
        if (role) filter.role = role;
        if (isActive !== undefined) filter.isActive = isActive === 'true';

        const skip = (Number(page) - 1) * Number(limit);
  
        const [users, total] = await Promise.all([
            User.find(filter)
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 }),
            User.countDocuments(filter)
        ]);
  
        res.json({
            data: users,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / Number(limit))
            }
        });
    } catch (error) {
        throw error;
    }
}

//get user by id
export const getUserById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw AppError.notFound('Usuario no encontrado');
        }
        res.json(user);
    } catch (error) {
        next(error);
    }
}

//POST register user
export const registerCtrl = async (req, res, next) => {
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      throw AppError.conflict('Email ya registrado');
    }
    //verificar nif
    const existingNif = await User.findOne({ nif: req.body.nif });
    if (existingNif) {
      throw AppError.conflict('NIF ya registrado');
    }

    //cifrar verificationCode
    const verificationCode = await randomCode();

    // Cifrar contraseña
    const password = await encrypt(req.body.password);
    
    // Crear usuario con password cifrada
    const body = { ...req.body, password, verificationCode };
    const dataUser = await User.create(body);
    
    // Ocultar password en la respuesta
    dataUser.set('password', undefined, { strict: false });
    
    // Generar token
    const data = {
      refreshToken: longTokenSign(dataUser),
      accessToken: shortTokenSign(dataUser),
      user: dataUser
    };
    
    res.status(201).send(data);
  } catch (err) {
    console.log(err);
    next(AppError.internalServerError('Error al registrar usuario'));
  }
};

//PUT /api/user/register - Actualizar datos personales
export const basicRegister = async (req, res, next) => {
  try {
    const { name, lastName, nif } = req.body;
    const user = req.user; // Obtener usuario del token

    // Verificar si el NIF ya existe en otro usuario
    if (nif !== user.nif) {
      const existingNif = await User.findOne({ nif });
      if (existingNif) {
        throw AppError.conflict('NIF ya registrado');
      }
    }

    // Actualizar usuario
    user.name = name;
    user.lastName = lastName;
    user.nif = nif;

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

//PATCH /api/user/company - Asignar compañía
export const userCompany = async (req, res, next) => {
  try {
    const { name, cif, address, isFreelance } = req.body;
    const user = req.user; // Obtener usuario del token

    let companyCif = cif;
    let companyData = { name, address };

    // Si es autónomo, usar NIF como CIF y rellenar datos automáticamente
    if (isFreelance) {
      companyCif = user.nif;
      companyData = {
        name: user.name + ' ' + user.lastName,
        address: user.address || address
      };
    }

    // Buscar si la compañía ya existe
    let company = await Company.findOne({ cif: companyCif });

    if (company) {
      // Compañía existe: usuario se une como guest
      user.company = company._id;
      user.role = 'guest';
    } else {
      // Compañía no existe: crear nueva
      const newCompany = await Company.create({
        owner: user._id,
        cif: companyCif,
        ...companyData,
        isFreelance
      });

      user.company = newCompany._id;
      // El usuario mantiene su role admin si es el owner de una nueva compañía
    }

    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

//POST login user
export const loginCtrl = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario incluyendo el password
    const user = await User.findOne({ email }).select('password name role email');
    
    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }
    
    // Comparar contraseñas
    const hashPassword = user.password;
    const check = await compare(password, hashPassword);
    
    if (!check) {
      throw AppError.unauthorized('Contraseña incorrecta');
    }
    
    // Ocultar password en la respuesta
    user.set('password', undefined, { strict: false });
    
    // Generar token y responder
    const data = {
      token: tokenSign(user),
      user
    };
    
    res.send(data);
  } catch (err) {
    console.log(err);
    next(AppError.internalServerError('Error al iniciar sesión'));
  }
};

//PUT /api/user/validation
export const validateEmailCtrl = async (req, res, next) => {
    try {
        const { code } = req.body;
        const user = req.user; // Obtener usuario inyectado por authMiddleware

        // Verificar si quedan intentos
        if (user.verificationAttempts <= 0) {
            throw AppError.tooManyRequests('Demasiados intentos fallidos, intenta más tarde');
        }

        // Comparar el código
        if (code === user.verificationCode) {
            // Código correcto
            user.status = 'verified';
            // Limpiar el código para que no sea reutilizable
            user.verificationCode = null;
            user.verificationAttempts = 3; // Resetear intentos
            await user.save();

            return res.json({
                message: "Email verificado correctamente",
                status: user.status
            });
        } else {
            // Código incorrecto
            user.verificationAttempts -= 1;
            await user.save();

            throw AppError.badRequest(`Código inválido. Intentos restantes: ${user.verificationAttempts}`);
        }

    } catch (error) {
        console.error(error);
        next(error);
    }
};

//PATCH /api/user/logo - Subir logo de la compañía
export const userLogo = async (req, res, next) => {
  try {
    const user = req.user; // Obtener usuario del token

    // Verificar que el usuario tiene una compañía
    if (!user.company) {
      throw AppError.badRequest('Usuario no tiene compañía asignada');
    }

    // Verificar que se cargó un archivo
    if (!req.file) {
      throw AppError.badRequest('Archivo no cargado');
    }

    // Obtener la compañía del usuario
    const company = await Company.findById(user.company);
    if (!company) {
      throw AppError.notFound('Compañía no encontrada');
    }

    // Eliminar logo anterior si existe
    if (company.logo) {
      const oldFilePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../../uploads', path.basename(company.logo));
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Actualizar URL del logo
    const logoUrl = `/uploads/${req.file.filename}`;
    company.logo = logoUrl;
    await company.save();

    res.json({
      message: 'Logo actualizado correctamente',
      logo: logoUrl,
      company
    });
  } catch (error) {
    // Si hay error, eliminar el archivo cargado
    if (req.file) {
      const filePath = path.join(path.dirname(new URL(import.meta.url).pathname), '../../uploads', req.file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    next(error);
  }
};

//GET /api/user - Obtener usuario autenticado
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('company') // Incluir datos completos de la compañía
      .select('-password');

    if (!user) {
      throw AppError.notFound('Usuario no encontrado');
    }

    // Agregar fullName virtual
    const userWithFullName = user.toObject();
    userWithFullName.fullName = `${user.name} ${user.lastName}`;

    res.json(userWithFullName);
  } catch (error) {
    next(error);
  }
};

//POST /api/user/refresh - Refrescar token
export const refreshTokenCtrl = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw AppError.badRequest('Refresh token no proporcionado');
    }

    // Verificar el refresh token
    const dataToken = verifyToken(refreshToken);
    if (!dataToken || !dataToken.userId) {
      throw AppError.unauthorized('Refresh token inválido o expirado');
    }

    // Buscar el usuario
    const user = await User.findById(dataToken.userId);
    if (!user) {
      throw AppError.unauthorized('Usuario no encontrado');
    }

    // Generar nuevo access token
    const newAccessToken = shortTokenSign(user);

    res.json({
      accessToken: newAccessToken
    });
  } catch (error) {
    next(error);
  }
};

//POST /api/user/logout - Cerrar sesión
export const logoutCtrl = async (req, res, next) => {
  try {
    // En este caso, simplemente retornamos un ACK
    // En una implementación real, podrías invalidar el token en la BD
    // por ejemplo, agregándolo a una lista negra o eliminando el refreshToken almacenado
    const user = req.user; // Obtener usuario del token
    user.refreshToken = null; // Eliminar refresh token del usuario
    await user.save();
    res.json({
      message: 'Sesión cerrada correctamente'
    });
  } catch (error) {
    next(error);
  }
};

//delete user
export const deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            throw AppError.notFound('Usuario no encontrado');
        }
        if(!user.softDelete) {
            await user.softDelete();
            res.json({ message: 'Usuario eliminado correctamente' });
        }else{
          await user.hardDelete();
          res.json({ message: 'Usuario eliminado permanentemente' });
        }
    } catch (error) {
        next(error);
    }
}

//put /api/user/password - Cambiar contraseña
export const changePassword = async (req, res, next) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = req.user; // Obtener usuario del token 
        if (!user) {
            throw AppError.notFound('Usuario no encontrado');
        }
        // Verificar contraseña actual        
        const check = await compare(currentPassword, user.password);
        if (!check) {
            throw AppError.unauthorized('Contraseña actual incorrecta');
        }
        // Cifrar nueva contraseña
        user.password = await encrypt(newPassword);
        await user.save();
        res.json({ message: 'Contraseña cambiada correctamente' });
    } catch (error) {
        next(error);
    }
}

//POST /api/user/invitar - Invitar usuario a la compañía (solo admin)
export const inviteUser = async (req, res, next) => {
    try {
        const { email } = req.body;
        const user = req.user; // Obtener usuario del token
        if (!user) {
            throw AppError.notFound('Usuario no encontrado');
        }
        if (!user.company) {
            throw AppError.badRequest('Usuario no tiene compañía asignada');
        }
        if (user.role !== 'admin') {
            throw AppError.forbidden('Solo administradores pueden invitar usuarios');
        }
        // Verificar si el email ya existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw AppError.conflict('Email ya registrado');
        }
        // Crear usuario invitado con rol guest
        const invitedUser = await User.create({
            email,
            company: user.company,
            role: 'guest',
            status: 'pending'
        });
        res.json({ message: 'Usuario invitado correctamente', user: invitedUser });
    } catch (error) {
        next(error);
    }
}