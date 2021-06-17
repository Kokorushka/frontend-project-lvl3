import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';
import watch from './watch.js';
import { parseXML, getValidatedUrl } from './utils';
import ru from './locales/ru.js';

const proxy = 'https://hexlet-allorigins.herokuapp.com';
const addProxy = (url) => {
  const urlWithProxy = new URL('/get', proxy);
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};
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
const updatePosts = (state, instancei18n, delay = 5000) => {
  setTimeout(function request() {
    state.inputForm.urls.forEach(({ url, urlId }) => {
      axios.get(addProxy(url))
        .then((resp) => {
          const { posts } = parseXML(resp);
          const titleList = state.posts.map(({ title }) => title);
          const newPosts = posts.filter(({ title }) => !_.includes(titleList, title));
          const preparedPosts = addIdtoPosts(newPosts, urlId);
          state.posts = [...preparedPosts, ...state.posts];
        })
        .catch(() => {
          state.errors = instancei18n.t('errors.couldnotUpdate');
        });
    });
    setTimeout(request, delay);
  }, delay);
};

const app = () => {
  const instancei18n = i18n.createInstance();
  instancei18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then((resp) => resp);

  const input = document.querySelector('input[name="rssUrl"]');
  console.log(input);
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

  const watchedState = watch(state, instancei18n);
  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.errors = instancei18n.t('loading');
    const data = new FormData(form);
    const newFeed = data.get('rssUrl');
    form.reset();
    const { urls } = watchedState.inputForm;
    const preparedUrl = urls.map(({ url }) => url);
    const errors = getValidatedUrl(newFeed, preparedUrl, instancei18n);
    if (_.isEmpty(errors)) {
      const urlId = _.uniqueId();
      watchedState.inputForm.urls = [...watchedState.inputForm.urls, { url: newFeed, urlId }];
      axios.get(addProxy(newFeed))
        .then((resp) => {
          try {
            const {
              feedTitle,
              feedDescription,
              posts,
            } = parseXML(resp, instancei18n, watchedState);
            watchedState.titles.push([{ feedTitle, feedDescription, urlId }]);
            const indexedPosts = addIdtoPosts(posts, urlId);
            watchedState.posts = [...watchedState.posts, ...indexedPosts];
            watchedState.errors = instancei18n.t('success');
            watchedState.inputForm.status = 'valid';
            input.setAttribute('readonly');
          } catch (err) {
            watchedState.errors = instancei18n.t('errors.noValidRSS');
          }
        })
        .catch(() => {
          watchedState.errors = instancei18n.t('errors.network');
        });
    } else {
      watchedState.inputForm.status = 'invalid';
      watchedState.errors = errors;
    }
  });
  updatePosts(watchedState, instancei18n);
};

export default app;
