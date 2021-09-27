import axios from 'axios';
import _ from 'lodash';
import i18n from 'i18next';
import * as yup from 'yup';
import watch from './watch.js';
import {
  parseXML,
  validatedUrl,
} from './utils';
import yupLocale from './locales/yup.js';
import ru from './locales/ru.js';

const proxy = 'https://hexlet-allorigins.herokuapp.com';
const addProxy = (url) => {
  const urlWithProxy = new URL('/get', proxy);
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};
const addIdToPosts = (posts, urlId) => posts
  .map((item) => ({ ...item, channelId: urlId, id: _.uniqueId() }));
const loadRSS = (rss, watchedState) => {
  axios.get(addProxy(rss))
    .then((resp) => {
      const xml = resp.data.contents;
      const urlId = _.uniqueId();
      try {
        const {
          title,
          description,
          posts,
        } = parseXML(xml);
        watchedState.feeds.push({
          url: rss,
          urlId,
          title,
          description,
        });
        const indexedPosts = addIdToPosts(posts, urlId);
        // console.log(indexedPosts);
        watchedState.posts = [...watchedState.posts, ...indexedPosts];
        watchedState.loadingProcess.status = 'success';
        watchedState.loadingProcess.error = 'success';
      } catch (err) {
        console.log(err);
        watchedState.loadingProcess.error = 'noValidRSS';
        watchedState.loadingProcess.status = 'fail';
      }
    })
    .catch(() => {
      watchedState.loadingProcess.error = 'network';
      watchedState.loadingProcess.status = 'fail';
    });
};

const updatePosts = (watchedState, instancei18n) => {
  const delay = 5000;
  const promises = watchedState.feeds.map(({ url, urlId }) => axios.get(addProxy(url))
    .then((resp) => {
      const xml = resp.data.contents;
      const { posts } = parseXML(xml);
      const oldPosts = watchedState.posts;
      const diff = _.differenceWith(posts, oldPosts, (a, b) => a.title === b.title);
      // console.log(diff);
      const preparedPosts = addIdToPosts(diff, urlId);
      // console.log(preparedPosts);
      watchedState.posts = [...preparedPosts, ...oldPosts];
    })
    .catch((e) => {
      console.log(e);
      watchedState.loadingProcess.error = 'couldNotUpdate';
    }));
  Promise.all(promises).finally(() => {
    setTimeout(() => updatePosts(watchedState, instancei18n), delay);
  });
};

const app = () => {
  const state = {
    form: {
      status: null,
      // urls: [],
      error: null,
    },
    feeds: [],
    viewedPosts: new Set(),
    posts: [],
    loadingProcess: {
      status: 'filling',
      error: null,
    },
    modal: {
      currentId: null,
    },
  };
  yup.setLocale(yupLocale());
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
  // console.log(document.querySelectorAll('.links > li'));
  const watchedState = watch(state, instancei18n, elements);
  return instancei18n.init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
    },
  }).then(() => {
    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      watchedState.form.status = null;
      watchedState.form.error = null;
      watchedState.loadingProcess.status = null;
      watchedState.loadingProcess.status = 'loading';
      watchedState.loadingProcess.error = 'loading';
      const data = new FormData(elements.form);
      const newFeed = data.get('rssUrl');
      // elements.form.reset();
      elements.input.value = '';
      const {
        feeds,
      } = watchedState;
      const preparedUrls = feeds.map(({
        url,
      }) => url);
      validatedUrl(newFeed, preparedUrls)
        .then(() => {
          loadRSS(newFeed, watchedState);
          watchedState.form.error = null;
          watchedState.form.status = 'valid';
        })
        .catch((err) => {
          watchedState.form.status = 'invalid';
          const error = err.errors[0];
          watchedState.form.error = error;
          watchedState.loadingProcess.error = null;
          watchedState.loadingProcess.status = 'fail';
        });
    });
    updatePosts(watchedState, instancei18n);
  })
    .then(() => {
      document.addEventListener('click', (e) => {
        const { bsToggle, id } = e.target.dataset;
        if (bsToggle !== 'modal') {
          return;
        }
        const currentItem = watchedState.posts.find((post) => post.id === id);
        if (!currentItem) {
          return;
        }
        watchedState.modal.currentId = id;
        watchedState.viewedPosts.add(id);
      });
    });
};

export default app;
