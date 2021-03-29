import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';
import watch from './watch.js';
import { getParsedXml, getValidatedUrl } from '../utils';
import ru from './locales/ru.js';

// const getValidatedUrl = (url, watchedState) => {
//   yup.setLocale({
//     string: {
//       matches: `${i18n.t('errors.incorrect')}`,
//     },
//   });
//   const schema = yup.string()
//     .matches(/(https?:\/\/)?([\w])+.([\w]){2,15}\/(rss?.)\/?([\w]+)?/)
//     .notOneOf(watchedState.inputForm.urls, `${i18n.t('errors.wasAddedBefore')}`);

//   // const result = schema.isValidSync(url);
//   // return result;

//   // const validate = (fields) => {
//   try {
//     schema.validateSync(url, {
//       abortEarly: false,
//     });
//     return {};
//   } catch (e) {
//     // console.log(e);
//     // return _.keyBy(e.inner, 'path');
//     return e.errors;
//   }
//   // };
// };

const app = () => {
  i18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then((resp) => resp);

  const state = {
    inputForm: {
      status: 'valid',
      feeds: [],
      urls: [],
    },
    titles: [],
    posts: [],
    errors: '',
  };

  const watchedState = watch(state);
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.errors = i18n.t('loading');
    const data = new FormData(form);
    const newFeed = data.get('rssUrl');
    form.reset();
    const errors = getValidatedUrl(newFeed, watchedState);
    if (_.isEmpty(errors)) {
      watchedState.inputForm.urls.push(newFeed);
      try {
        axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(newFeed)}`)
          .then((resp) => {
            const [title, items] = getParsedXml(resp);
            const feedId = _.uniqueId();
            watchedState.titles.push([title, feedId]);
            watchedState.posts.push([items, feedId]);
            watchedState.errors = i18n.t('success');
            watchedState.inputForm.status = 'valid';
            console.log(watchedState);
          });
      } catch (error) {
        watchedState.errors = i18n.t('errors.network');
      }
    } else {
      watchedState.inputForm.status = 'invalid';
      watchedState.errors = errors;
    }
  });
};

export default app;
