import * as yup from 'yup';

const validatedUrl = (url, urlList) => {
  const schema = yup.string().url().required()
    .notOneOf(urlList);
  return schema.validate(url, { abortEarly: false });
};

export default validatedUrl;
