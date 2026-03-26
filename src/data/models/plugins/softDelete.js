import mongoose from 'mongoose';

export const softDeletePlugin = (schema, options = {}) => {
  const { fieldName = 'deletedAt', overrideMethods = false } = options;

  schema.add({
    [fieldName]: {
      type: Date,
      default: null,
    },
  });

  schema.methods.softDelete = async function () {
    this[fieldName] = new Date();
    return this.save();
  };

  schema.methods.restore = async function () {
    this[fieldName] = null;
    return this.save();
  };

  schema.methods.isDeleted = function () {
    return this[fieldName] !== null && this[fieldName] !== undefined;
  };

  schema.query.withDeleted = function () {
    return this;
  };

  schema.query.onlyDeleted = function () {
    return this.where({ [fieldName]: { $ne: null } });
  };

  schema.query.onlyNotDeleted = function () {
    return this.where({ [fieldName]: null });
  };

  const originalFind = schema.statics.find;
  schema.statics.find = function (...args) {
    return originalFind.apply(this, args).where({ [fieldName]: null });
  };

  const originalFindOne = schema.statics.findOne;
  schema.statics.findOne = function (...args) {
    return originalFind.apply(this, args).where({ [fieldName]: null });
  };

  const originalFindById = schema.statics.findById;
  schema.statics.findById = function (...args) {
    return originalFind.apply(this, args).where({ [fieldName]: null });
  };

  if (overrideMethods) {
    schema.statics.findWithDeleted = function (...args) {
      return originalFind.apply(this, args);
    };

    schema.statics.findOneWithDeleted = function (...args) {
      return originalFind.apply(this, args);
    };

    schema.statics.findByIdWithDeleted = function (...args) {
      return originalFind.apply(this, args);
    };
  }

  schema.statics.restore = async function (id) {
    return this.findByIdAndUpdate(id, { [fieldName]: null }, { new: true });
  };

  schema.statics.hardDelete = async function (id) {
    return this.findByIdAndDelete(id);
  };

  schema.statics.countDocuments = function (filter = {}) {
    const Model = this;
    return mongoose.Model.countDocuments.call(Model, { ...filter, [fieldName]: null });
  };
};

export default softDeletePlugin;
