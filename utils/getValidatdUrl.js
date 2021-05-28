import * as yup from 'yup';

const getValidatedUrl = (url, urlList, instancei18n) => {
  yup.setLocale({
    string: {
      matches: `${instancei18n.t('errors.incorrect')}`,
    },
  });
  const schema = yup.string()
    .matches(/(https?:\/\/)?([\w\W])*(rss)+([\w\W])*/)
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
