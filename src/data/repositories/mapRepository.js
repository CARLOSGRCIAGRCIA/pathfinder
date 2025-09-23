import { Either } from '../../business/utils/either/Either.js';
import Map from '../models/Map.js';
import IMapRepository from '../../business/repositories/IMapRepository.js';
import { AppError } from '../../business/utils/errorUtils.js';

const MapRepository = Object.assign({}, IMapRepository, {
    create: async (mapData) => {
        const newMap = new Map(mapData);
        const validationError = newMap.validateSync();
        
        if (validationError) {
            return Either.left(validationError);
        }

        return newMap.save()
            .then(Either.right)
            .catch(Either.left);
    },

    findById: async (id, userId) => {
        return Map.findOne({ _id: id, creator: userId })
            .then(map => map 
                ? Either.right(map) 
                : Either.left(AppError('Map not found or you have no permission to access this map', 404))
            )
            .catch(Either.left);
    },

    update: async (id, mapData, userId) => {
        return Map.findOne({ _id: id, creator: userId })
            .then(map => {
                if (!map) {
                    return Either.left(AppError('Map not found or you have no permission to update this map', 404));
                }
                return Map.findByIdAndUpdate(id, mapData, { new: true, runValidators: true })
                    .then(updatedMap => updatedMap 
                        ? Either.right(updatedMap) 
                        : Either.left(AppError('Map not found', 404))
                    );
            })
            .catch(Either.left);
    },

    delete: async (id, userId) => {
        return Map.findOne({ _id: id, creator: userId })
            .then(map => {
                if (!map) {
                    return Either.left(AppError('Map not found or you have no permission to delete this map', 404));
                }
                return Map.findByIdAndDelete(id)
                    .then(deletedMap => deletedMap 
                        ? Either.right(deletedMap) 
                        : Either.left(AppError('Map not found', 404))
                    );
            })
            .catch(Either.left);
    },

    findAll: async (query = {}, page = 1, limit = 10, userId) => {
        return Promise.all([
            Map.find({ ...query, creator: userId })
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .exec(),
            Map.countDocuments({ ...query, creator: userId })
        ])
        .then(([maps, count]) => Either.right({
            maps,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        }))
        .catch(Either.left);
    }
});

export default MapRepository;