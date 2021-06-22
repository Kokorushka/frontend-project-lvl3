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
const updatePosts = (watchedState, instancei18n) => {
  const delay = 5000;
  const promises = watchedState.inputForm.urls
    .map(({ url, urlId }) => axios.get(addProxy(url))
      .then((resp) => {
        const { posts } = parseXML(resp);
        const titleList = watchedState.posts.map(({ title }) => title);
        const newPosts = posts.filter(({ title }) => !_.includes(titleList, title));
        const preparedPosts = addIdtoPosts(newPosts, urlId);
        watchedState.posts = [...preparedPosts, ...watchedState.posts];
      })
      .catch(() => {
        watchedState.errors = instancei18n.t('errors.couldnotUpdate');
      }));
  Promise.all(promises).finally(() => {
    setTimeout(() => updatePosts(watchedState, instancei18n), delay);
  });
};

const app = () => {
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
      watchedState.errors = instancei18n.t('loading');
      watchedState.inputForm.status = 'loading';
      const data = new FormData(elements.form);
      const newFeed = data.get('rssUrl');
      elements.form.reset();
      const { urls } = watchedState.inputForm;
      const preparedUrls = urls.map(({ url }) => url);
      const errors = getValidatedUrl(newFeed, preparedUrls, instancei18n);
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
              } = parseXML(resp);
              watchedState.titles.push([{ feedTitle, feedDescription, urlId }]);
              const indexedPosts = addIdtoPosts(posts, urlId);
              watchedState.posts = [...watchedState.posts, ...indexedPosts];
              watchedState.errors = instancei18n.t('success');
              watchedState.inputForm.status = 'valid';
            } catch (err) {
              console.log(err);
              watchedState.errors = instancei18n.t('errors.noValidRSS');
              watchedState.inputForm.status = 'invalid';
            }
          })
          .catch(() => {
            watchedState.errors = instancei18n.t('errors.network');
            watchedState.inputForm.status = 'invalid';
          });
      } else {
        watchedState.inputForm.status = 'invalid';
        watchedState.errors = errors;
      }
    });
    updatePosts(watchedState, instancei18n);
  });
};

export default app;
