import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';
import watch from './watch.js';
import getParsedXml from '../utils/getParsedXml.js';

const getValidatedUrl = (url, watchedState) => {
  const schema = yup.string()
  .matches(/(https?:\/\/)?([\w])+.([\w]){2,15}\/(rss?.)\/?([\w]+)?/)
  .notOneOf(watchedState.inputForm.urls, 'This url has been added already');

  // const result = schema.isValidSync(url);
  // return result;

  // const validate = (fields) => {
    try {
      schema.validateSync(url, {
        abortEarly: false
      });
      return {};
    } catch (e) {
      // console.log(e);
      // return _.keyBy(e.inner, 'path');
      return e;
    }
  // };
};

const appMessages = {
  errors: {
    network: 'Network Problems. Try again.',
    wasAddedBefore: 'This feed was already added.',
  },
  success: 'Feed was added!',
  loading: 'Posts are loading. Please wait.'
};

const app = () => {
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
    watchedState.errors = appMessages.loading;
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
          watchedState.errors =[];
          watchedState.inputForm.status = 'valid'
          console.log(watchedState);
        })
      } catch (error) {
        watchedState.errors = appMessages.errors.network;
      }
    } else {
      watchedState.errors = errors;
      
    }
  })
};

export default app;