import Podcast from '../models/podcast.model.js';
import { handleHttpError } from '../utils/handleError.js';

// GET /api/podcasts — solo publicados
export const getPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ published: true }).populate('author', 'name email');
    res.json({ data: podcasts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCASTS');
  }
};

// GET /api/podcasts/admin/all — todos (admin)
export const getAllPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({}).populate('author', 'name email');
    res.json({ data: podcasts });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_ALL_PODCASTS');
  }
};

// GET /api/podcasts/:id
export const getPodcast = async (req, res) => {
  try {
    const { id } = req.params;
    const podcast = await Podcast.findById(id).populate('author', 'name email');

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_GET_PODCAST');
  }
};

// POST /api/podcasts
export const createPodcast = async (req, res) => {
  try {
    const body = {
      ...req.body,
      author: req.user._id
    };

    const podcast = await Podcast.create(body);
    res.status(201).json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_CREATE_PODCAST');
  }
};

// PUT /api/podcasts/:id — solo el autor puede actualizar
export const updatePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    // Verificar que el usuario es el autor
    if (podcast.author.toString() !== req.user._id.toString()) {
      return handleHttpError(res, 'NOT_ALLOWED', 403);
    }

    const updated = await Podcast.findByIdAndUpdate(id, req.body, { new: true });
    res.json({ data: updated });
  } catch (err) {
    handleHttpError(res, 'ERROR_UPDATE_PODCAST');
  }
};

// DELETE /api/podcasts/:id — solo admin
export const deletePodcast = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findByIdAndDelete(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    res.json({ message: 'Podcast eliminado', data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_DELETE_PODCAST');
  }
};

// PATCH /api/podcasts/:id/publish — admin publica/despublica
export const togglePublish = async (req, res) => {
  try {
    const { id } = req.params;

    const podcast = await Podcast.findById(id);

    if (!podcast) {
      return handleHttpError(res, 'PODCAST_NOT_FOUND', 404);
    }

    podcast.published = !podcast.published;
    await podcast.save();

    res.json({ data: podcast });
  } catch (err) {
    handleHttpError(res, 'ERROR_TOGGLE_PUBLISH');
  }
};
