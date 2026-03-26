export const Either = {
  left: value => ({
    isLeft: () => true,
    isRight: () => false,
    fold: (f, _) => f(value),
    map: _ => Either.left(value),
    flatMap: _ => Either.left(value),
    mapLeft: f => Either.left(f(value)),
    getOrElse: defaultValue => defaultValue,
  }),

  right: value => ({
    isLeft: () => false,
    isRight: () => true,
    fold: (_, g) => g(value),
    map: f => Either.right(f(value)),
    flatMap: f => f(value),
    mapLeft: f => Either.left(f(value)),
    getOrElse: _ => value,
  }),

  fromNullable: value => (value != null ? Either.right(value) : Either.left(null)),

  tryCatch: async f => {
    try {
      const result = await f();
      return Either.right(result);
    } catch (e) {
      return Either.left(e);
    }
  },
};
