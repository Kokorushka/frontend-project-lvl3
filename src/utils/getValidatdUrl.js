import * as yup from 'yup';

const getValidatedUrl = (url, urlList, instancei18n) => {
  const schema = yup.string().url(`${instancei18n.t('errors.incorrect')}`)
    .notOneOf(urlList, `${instancei18n.t('errors.wasAddedBefore')}`);
  try {
    schema.validateSync(url, {
      abortEarly: false,
    });
    return {};
  } catch (e) {
    return e.errors;
  }
};

export default getValidatedUrl;
