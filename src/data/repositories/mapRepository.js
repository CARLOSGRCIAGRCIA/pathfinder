import { Either } from '../../business/utils/either/Either.js';
import Map from '../models/Map.js';
import IMapRepository from '../../business/repositories/IMapRepository.js';
import { AppError } from '../../business/utils/errorUtils.js';

const MapRepository = Object.assign({}, IMapRepository, {
  create: async mapData => {
    const newMap = new Map(mapData);
    const validationError = newMap.validateSync();

    if (validationError) {
      return Either.left(validationError);
    }

    return newMap.save().then(Either.right).catch(Either.left);
  },

  findById: async (id, userId) => {
    return Map.findOne({
      $or: [
        { _id: id, creator: userId },
        { _id: id, isPublic: true },
      ],
    })
      .then(map =>
        map
          ? Either.right(map)
          : Either.left(
              new AppError('Map not found or you have no permission to access this map', 404)
            )
      )
      .catch(Either.left);
  },

  findByIdStrict: async (id, userId) => {
    return Map.findOne({ _id: id, creator: userId })
      .then(map => (map ? Either.right(map) : Either.left(new AppError('Map not found', 404))))
      .catch(Either.left);
  },

  update: async (id, mapData, userId) => {
    return Map.findOne({ _id: id, creator: userId })
      .then(map => {
        if (!map) {
          return Either.left(
            new AppError('Map not found or you have no permission to update this map', 404)
          );
        }
        return Map.findByIdAndUpdate(id, mapData, { new: true, runValidators: true }).then(
          updatedMap =>
            updatedMap ? Either.right(updatedMap) : Either.left(new AppError('Map not found', 404))
        );
      })
      .catch(Either.left);
  },

  delete: async (id, userId) => {
    return Map.findOne({ _id: id, creator: userId })
      .then(map => {
        if (!map) {
          return Either.left(
            new AppError('Map not found or you have no permission to delete this map', 404)
          );
        }
        return Map.findByIdAndDelete(id).then(deletedMap =>
          deletedMap ? Either.right(deletedMap) : Either.left(new AppError('Map not found', 404))
        );
      })
      .catch(Either.left);
  },

  findAll: async (query = {}, page = 1, limit = 10, userId) => {
    return Promise.all([
      Map.find({ ...query, creator: userId })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: -1 })
        .exec(),
      Map.countDocuments({ ...query, creator: userId }),
    ])
      .then(([maps, count]) =>
        Either.right({
          maps,
          totalPages: Math.ceil(count / limit),
          currentPage: page,
        })
      )
      .catch(Either.left);
  },

  search: async (searchTerm, options = {}) => {
    const {
      page = 1,
      limit = 20,
      creatorId = null,
      isPublic = true,
      tags = [],
      difficulty = null,
    } = options;

    const query = {
      $text: { $search: searchTerm },
    };

    if (creatorId) {
      query.creator = creatorId;
    } else {
      query.isPublic = isPublic;
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (difficulty) {
      query.difficulty = difficulty;
    }

    return Promise.all([
      Map.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .lean()
        .exec(),
      Map.countDocuments(query),
    ])
      .then(([maps, count]) =>
        Either.right({
          maps,
          total: count,
          page,
          pages: Math.ceil(count / limit),
        })
      )
      .catch(Either.left);
  },

  findPublic: async (page = 1, limit = 20, sortBy = 'createdAt') => {
    const validSortFields = ['createdAt', 'viewCount', 'name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder = sortBy === 'viewCount' ? -1 : -1;

    return Promise.all([
      Map.find({ isPublic: true })
        .sort({ [sortField]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .lean()
        .exec(),
      Map.countDocuments({ isPublic: true }),
    ])
      .then(([maps, count]) =>
        Either.right({
          maps,
          total: count,
          page,
          pages: Math.ceil(count / limit),
        })
      )
      .catch(Either.left);
  },

  findByTags: async (tags, page = 1, limit = 20) => {
    return Promise.all([
      Map.find({
        tags: { $in: tags },
        isPublic: true,
      })
        .sort({ viewCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('creator', 'username')
        .lean()
        .exec(),
      Map.countDocuments({ tags: { $in: tags }, isPublic: true }),
    ])
      .then(([maps, count]) =>
        Either.right({
          maps,
          total: count,
          page,
          pages: Math.ceil(count / limit),
        })
      )
      .catch(Either.left);
  },

  findByDifficulty: async (difficulty, page = 1, limit = 20) => {
    return Promise.all([
      Map.find({
        difficulty,
        isPublic: true,
      })
        .sort({ viewCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean()
        .exec(),
      Map.countDocuments({ difficulty, isPublic: true }),
    ])
      .then(([maps, count]) =>
        Either.right({
          maps,
          total: count,
          page,
          pages: Math.ceil(count / limit),
        })
      )
      .catch(Either.left);
  },

  getPopular: async (limit = 10) => {
    return Map.find({ isPublic: true })
      .sort({ viewCount: -1 })
      .limit(limit)
      .populate('creator', 'username')
      .lean()
      .exec()
      .then(maps => Either.right(maps))
      .catch(error => Either.left(error));
  },

  getRecent: async (limit = 10) => {
    return Map.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('creator', 'username')
      .lean()
      .exec()
      .then(maps => Either.right(maps))
      .catch(error => Either.left(error));
  },

  toggleFavorite: async (mapId, userId) => {
    return Map.findOneAndUpdate(
      { _id: mapId, creator: userId },
      [{ $set: { isFavorite: { $not: '$isFavorite' } } }],
      { new: true }
    )
      .then(map => (map ? Either.right(map) : Either.left(new AppError('Map not found', 404))))
      .catch(Either.left);
  },
});

export default MapRepository;
