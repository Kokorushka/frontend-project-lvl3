import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';
import watch from './watch.js';
import { getParsedXml, getValidatedUrl } from '../utils';
import ru from './locales/ru.js';

const addIdtoPosts = (posts, urlId) => {
  const indexedPosts = posts.map((item) => {
    const postId = _.uniqueId();
    const newItem = {
      ...item,
      urlId,
      postId,
    };
    return newItem;
  });
  return indexedPosts;
};
const updatePosts = (state, proxy, delay = 5000) => {
  setTimeout(function request() {
    state.inputForm.urls.forEach(({ url, urlId }) => {
      // try {
      axios.get(`${proxy}${encodeURIComponent(url)}`)
        .then((resp) => {
          const { posts } = getParsedXml(resp);
          const titleList = state.posts.map(({ title }) => title);
          const newPosts = posts.filter(({ title }) => !_.includes(titleList, title));
          const preparedPosts = addIdtoPosts(newPosts, urlId);
          state.posts = [...preparedPosts, ...state.posts];
        })
      // }
        .catch((error) => {
          state.errors = i18n.t('errors.couldnotUpdate');
          throw error;
        });
    });
    setTimeout(request, delay);
  }, delay);
};

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
      urls: [],
    },
    modal: {
      open: null,
      postId: [],
    },
    titles: [],
    posts: [],
    errors: '',
  };

  const proxy = 'https://hexlet-allorigins.herokuapp.com/get?url=';
  const watchedState = watch(state);
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.errors = i18n.t('loading');
    const data = new FormData(form);
    const newFeed = data.get('rssUrl');
    form.reset();
    const { urls } = watchedState.inputForm;
    const preparedUrl = urls.map(({ url }) => url);
    const errors = getValidatedUrl(newFeed, preparedUrl);
    if (_.isEmpty(errors)) {
      const urlId = _.uniqueId();
      watchedState.inputForm.urls = [...watchedState.inputForm.urls, { url: newFeed, urlId }];
      // form.reset();
      // try {
      axios.get(`${proxy}${encodeURIComponent(newFeed)}`)
        .then((resp) => {
          const { feedTitle, feedDescription, posts } = getParsedXml(resp);
          watchedState.titles.push([{ feedTitle, feedDescription, urlId }]);
          const indexedPosts = addIdtoPosts(posts, urlId);
          watchedState.posts = [...watchedState.posts, ...indexedPosts];
          watchedState.errors = i18n.t('success');
          watchedState.inputForm.status = 'valid';
          // form.reset();
        })
      // }
        .catch((er) => {
          // console.log(er);
          watchedState.errors = i18n.t('errors.network');
          throw er;
        });
    } else {
      watchedState.inputForm.status = 'invalid';
      watchedState.errors = errors;
    }
  });
  updatePosts(watchedState, proxy);
};

export default app;
