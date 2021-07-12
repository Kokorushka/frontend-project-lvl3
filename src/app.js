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
const addIdToPosts = (posts, urlId) => {
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
const loadRSS = (rss, watchedState, instancei18n) => {
  const urlId = _.uniqueId();
  axios.get(addProxy(rss))
    .then((resp) => {
      try {
        const {
          title,
          description,
          posts,
        } = parseXML(resp);
        watchedState.form.urls.push({
          url: rss,
          urlId,
          title,
          description,
        });
        const indexedPosts = addIdToPosts(posts, urlId);
        watchedState.posts = [...watchedState.posts, ...indexedPosts];
        watchedState.form.errors = instancei18n.t('success');
        watchedState.form.status = 'valid';
      } catch (err) {
        console.log(err);
        watchedState.form.errors = instancei18n.t('errors.noValidRSS');
        watchedState.form.status = 'invalid';
      }
    })
    .catch(() => {
      watchedState.form.errors = instancei18n.t('errors.network');
      watchedState.form.status = 'invalid';
    });
};

const updatePosts = (watchedState, instancei18n) => {
  const delay = 5000;
  const promises = watchedState.form.urls
    .map(({ url, urlId }) => axios.get(addProxy(url))
      .then((resp) => {
        const { posts } = parseXML(resp);
        const titleList = watchedState.posts.map(({ title }) => title);
        const newPosts = posts.filter(({ title }) => !_.includes(titleList, title));
        const preparedPosts = addIdToPosts(newPosts, urlId);
        watchedState.posts = [...preparedPosts, ...watchedState.posts];
      })
      .catch((e) => {
        console.log(e);
        watchedState.form.errors = instancei18n.t('errors.couldNotUpdate');
      }));
  Promise.all(promises).finally(() => {
    setTimeout(() => updatePosts(watchedState, instancei18n), delay);
  });
};

const app = () => {
  const state = {
    form: {
      status: 'valid',
      urls: [],
      errors: null,
    },
    postId: new Set(null),
    posts: [],
  };

  const instancei18n = i18n.createInstance();
  const elements = {
    form: document.querySelector('form'),
    modal: document.querySelector('.modal'),
    linkButton: document.querySelector('.modal a'),
    buttonsClosingModal: document.querySelectorAll('[data-bs-dismiss="modal"]'),
    feedsContainer: document.getElementById('feeds'),
    listOfFeeds: document.querySelector('.feeds ul'),
    linksContainer: document.getElementById('links'),
    liOfPosts: document.querySelector('#links ul'),
    input: document.querySelector('input'),
    buttonAdd: document.querySelector('button[aria-label="add"]'),
    p: document.querySelector('form p'),
  };
  const watchedState = watch(state, instancei18n, elements);
  instancei18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.form.errors = instancei18n.t('loading');
      watchedState.form.status = 'loading';
      const data = new FormData(elements.form);
      const newFeed = data.get('rssUrl');
      elements.form.reset();
      const { urls } = watchedState.form;
      // console.log(urls);
      const preparedUrls = urls.map(({ url }) => url);
      // console.log(preparedUrls);
      const key = getValidatedUrl(newFeed, preparedUrls);
      if (_.isEmpty(key)) {
        loadRSS(newFeed, watchedState, instancei18n);
      } else {
        watchedState.form.status = 'invalid';
        watchedState.form.errors = instancei18n.t(`errors.${key}`);
      }
    });
    updatePosts(watchedState, instancei18n);
  });
};

export default app;
