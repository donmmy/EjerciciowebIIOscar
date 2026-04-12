import User from "../models/user.model.js";
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign } from '../utils/handleJwt.js';
import { handleHttpError } from '../utils/handleError.js';

//get all users
export const getAllUsers = async (req, res) => {
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
        handleHttpError(res, error);
    }
}

//get user by id
export const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return handleHttpError(res, 'User not found', 404);
        }
        res.json(user);
    } catch (error) {
        handleHttpError(res, error);
    }
}

//POST register user
export const registerCtrl = async (req, res) => {
  try {
    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 409);
      return;
    }
    //verificar nif
    const existingNif = await User.findOne({ nif: req.body.nif });
    if (existingNif) {
      handleHttpError(res, 'NIF_ALREADY_EXISTS', 409);
      return;
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
    handleHttpError(res, 'ERROR_REGISTER_USER');
  }
};

//POST login user
export const loginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario incluyendo el password
    const user = await User.findOne({ email }).select('password name role email');
    
    if (!user) {
      handleHttpError(res, 'USER_NOT_EXISTS', 404);
      return;
    }
    
    // Comparar contraseñas
    const hashPassword = user.password;
    const check = await compare(password, hashPassword);
    
    if (!check) {
      handleHttpError(res, 'INVALID_PASSWORD', 401);
      return;
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
    handleHttpError(res, 'ERROR_LOGIN_USER');
  }
};

//PUT /api/user/validation
export const validateEmailCtrl = async (req, res) => {
    try {
        const { code } = req.body;
        const user = req.user; // Obtener usuario inyectado por authMiddleware

        // Verificar si quedan intentos
        if (user.verificationAttempts <= 0) {
            return handleHttpError(res, 'TOO_MANY_REQUESTS', 429);
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

            return handleHttpError(res, `CÓDIGO_INVÁLIDO. Intentos restantes: ${user.verificationAttempts}`, 400);
        }

    } catch (error) {
        console.error(error);
        handleHttpError(res, 'ERROR_VALIDATING_EMAIL');
    }
};