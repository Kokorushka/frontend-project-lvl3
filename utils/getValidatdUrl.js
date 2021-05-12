import * as yup from 'yup';
import i18n from 'i18next';

const getValidatedUrl = (url, urlList) => {
  yup.setLocale({
    string: {
      matches: `${i18n.t('errors.incorrect')}`,
    },
  });
  const schema = yup.string()
    .matches(/(https?:\/\/)?([\w\W])*(rss)+([\w\W])*/)
    .notOneOf(urlList, `${i18n.t('errors.wasAddedBefore')}`);
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
