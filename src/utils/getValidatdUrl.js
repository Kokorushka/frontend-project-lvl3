import * as yup from 'yup';
import yupLocale from '../locales/yup.js';

const getValidatedUrl = (url, urlList) => {
  yup.setLocale(yupLocale());
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
