import * as yup from 'yup';
import yupLocale from '../locales/yup.js';

const getValidatedUrl = (url, urlList, instancei18n) => {
  yup.setLocale(yupLocale(instancei18n));
  const schema = yup.string().url()
    .notOneOf(urlList);
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
