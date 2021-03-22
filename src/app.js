import * as yup from 'yup';
import onChange from 'on-change';
import axios from 'axios';
import _ from 'lodash';

const getParsedXml = (response) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(response.data.contents, "application/xml");
  // const feedLink = result.querySelector('link');
  const title = result.querySelector('title').textContent;
  const items = result.querySelectorAll('item');
  const mappedItems = [...items].map((item) => {
    const link = item.querySelector('link').innerHTML;
    const title = item.querySelector('title').textContent;
    return [link, title];
  });
  return [title, mappedItems];
};
const schema = yup.string().matches(/(https?:\/\/)?([\w])+.([\w]){2,15}\/(rss?.)\/?([\w]+)?/);

const appMessages = {
  errors: {
    network: 'Network Problems. Try again.',
     wasAddedBefore: 'This feed was already added.',
  },
  success: 'Feed was added!',
  loading: 'Posts are loading. Please wait.'
};

const getValidatedUrl = (url) => {
 const result = schema.isValidSync(url);
  return result;
};

const app = () => {
  const state = {
    inputForm: {
      status: 'valid',
      feeds: [],
    },
    errors: [],
  };
  const feedsContainer = document.getElementById('feeds');
  const linksContainer = document.getElementById('links');
  const input = document.querySelector('input');
  const watchedState = onChange(state, (path, current, previos) => {
    if (path === 'inputForm.feeds') {
      if (previos.length === 0) {
        const titleFeeds = document.createElement('h2');
        console.log(titleFeeds);
        titleFeeds.textContent = 'Фиды';
        const titlePosts = document.createElement('h2');
        titlePosts.textContent = 'Посты';
        feedsContainer.appendChild(titleFeeds);
        linksContainer.appendChild(titlePosts);
        const listOfFeeds = document.createElement('ul');
        feedsContainer.appendChild(listOfFeeds);
        const liOfPosts = document.createElement('ul');
        linksContainer.appendChild(liOfPosts);
      }
      const listOfFeeds = feedsContainer.querySelector('ul');
      listOfFeeds.classList.add('list-group');
      listOfFeeds.innerHTML = '';
      const liOfPosts = linksContainer.querySelector('ul');
      liOfPosts.classList.add('list-group');
      liOfPosts.innerHTML = '';
      current.forEach((item) => {
       axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(item)}`)
       .then((resp) => {
         const result = getParsedXml(resp);
         const [globalTitle, items] = result;
         const liFeed = document.createElement('li');
         const feedId = _.uniqueId();
         liFeed.classList.add('list-group-item');
         liFeed.setAttribute('id', feedId);
         liFeed.textContent = globalTitle;
         listOfFeeds.appendChild(liFeed);
         console.log(items);
        items.forEach(([link, title]) => {
          const post = document.createElement('li');
          post.dataset.feedId = feedId;
          const postId = _.uniqueId();
          post.setAttribute('id', postId);
          post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
          const postLink = document.createElement('a');
          postLink.setAttribute('href', link);
          postLink.textContent = title;
          post.appendChild(postLink);
          // console.log(post);
          const button = document.createElement('button');
          button.classList.add('btn', 'btn-primary', 'ml-5')
          button.setAttribute('type', 'button');
          button.textContent = 'Посмотеть';
          post.appendChild(button);
          // console.log(post);
          liOfPosts.appendChild(post);
        })
      });
      })
    }
    if (path === 'inputForm.status'){
      if (current === 'invalid') {
        input.classList.add('is-invalid');
      }
       if (current === 'valid') {
         input.classList.remove('is-invalid');
       }
    }
  });

  const form = document.querySelector('form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const newFeed = data.get('rssUrl');
    if (getValidatedUrl(newFeed)) {
      watchedState.inputForm.feeds.push(newFeed);
      watchedState.inputForm.status = 'valid';
    } else {
      watchedState.inputForm.status = 'invalid';
      // console.log(watchedState);
    }
    
  })
};

export default app;