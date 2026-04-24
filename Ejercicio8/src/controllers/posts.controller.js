import Post from '../models/post.model.js';
import { handleHttpError } from '../utils/handleError.js';

// GET /api/posts — solo publicados
export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find({ published: true })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: posts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_POSTS');
  }
};

// GET /api/posts/admin/all — todos (admin)
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find({})
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: posts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_ALL_POSTS');
  }
};

// GET /api/posts/my — posts del usuario autenticado
export const getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user._id })
      .populate('author', 'name email')
      .sort({ createdAt: -1 });
    res.json({ data: posts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_MY_POSTS');
  }
};

// GET /api/posts/:slug — obtener post por slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const post = await Post.findOne({ slug }).populate('author', 'name email');

    if (!post) {
      return handleHttpError(res, 'POST_NOT_FOUND', 404);
    }

    // Incrementar vistas
    post.views = (post.views || 0) + 1;
    await post.save();

    res.json({ data: post });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_POST');
  }
};

// GET /api/posts/:id — obtener post por ID (solo para admin/autor)
export const getPost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).populate('author', 'name email');

    if (!post) {
      return handleHttpError(res, 'POST_NOT_FOUND', 404);
    }

    res.json({ data: post });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_POST');
  }
};

// POST /api/posts — crear post (author y admin)
export const createPost = async (req, res) => {
  try {
    const body = {
      ...req.body,
      author: req.user._id
    };

    const post = await Post.create(body);
    const populated = await post.populate('author', 'name email');
    res.status(201).json({ data: populated });
  } catch (err) {
    handleHttpError(res, 'ERROR_CREATE_POST');
  }
};

// PUT /api/posts/:id — actualizar post (solo el autor o admin)
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return handleHttpError(res, 'POST_NOT_FOUND', 404);
    }

    // Verificar que el usuario es el autor o admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    const updated = await Post.findByIdAndUpdate(id, req.body, { new: true }).populate('author', 'name email');
    res.json({ data: updated });
  } catch (err) {
    handleHttpError(res, 'ERROR_UPDATE_POST');
  }
};

// DELETE /api/posts/:id — eliminar post (solo autor o admin)
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return handleHttpError(res, 'POST_NOT_FOUND', 404);
    }

    // Verificar que el usuario es el autor o admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    await Post.findByIdAndDelete(id);
    res.json({ message: 'Post eliminado exitosamente' });
  } catch (err) {
    handleHttpError(res, 'ERROR_DELETE_POST');
  }
};

// PUT /api/posts/:id/publish — publicar/despublicar post
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id);

    if (!post) {
      return handleHttpError(res, 'POST_NOT_FOUND', 404);
    }

    // Verificar que el usuario es el autor o admin
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    post.published = !post.published;
    await post.save();

    res.json({ data: post });
  } catch (err) {
    handleHttpError(res, 'ERROR_TOGGLE_PUBLISH');
  }
};
