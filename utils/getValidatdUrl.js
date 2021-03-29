import * as yup from 'yup';
import i18n from 'i18next';

const getValidatedUrl = (url, watchedState) => {
  yup.setLocale({
    string: {
      matches: `${i18n.t('errors.incorrect')}`,
    },
  });
  const schema = yup.string()
    .matches(/(https?:\/\/)?([\w\W])*(rss)+([\w\W])*/)
    // (/(https?:\/\/)?([\w])+.([\w]){2,15}\/(rss?.)\/?([\w]+)?/)
    .notOneOf(watchedState.inputForm.urls, `${i18n.t('errors.wasAddedBefore')}`);

  // const result = schema.isValidSync(url);
  // return result;

  // const validate = (fields) => {
  try {
    schema.validateSync(url, {
      abortEarly: false,
    });
    return {};
  } catch (e) {
    // console.log(e);
    // return _.keyBy(e.inner, 'path');
    return e.errors;
  }
  // };
};

export default getValidatedUrl;
