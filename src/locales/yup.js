export default (instancei18n) => {
  const object = {
    string: {
      url: () => (`${instancei18n.t('errors.incorrect')}`),
    },
    mixed: {
      notOneOf: () => (`${instancei18n.t('errors.wasAddedBefore')}`),
    },
  };
  return object;
};
