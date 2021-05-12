import onChange from 'on-change';
import i18n from 'i18next';
import _ from 'lodash';

const feedsContainer = document.getElementById('feeds');
const linksContainer = document.getElementById('links');
const input = document.querySelector('input');
const form = document.querySelector('form');

const updateModal = (title, description, link, postId, state) => {
  const modal = document.querySelector('.modal');
  modal.id = postId;
  modal.style = 'display: block; padding-right: 12px;';
  modal.setAttribute('role', 'dialog');
  modal.querySelector('.modal-title').textContent = title;
  modal.querySelector('p').textContent = description;
  const linkButton = modal.querySelector('a');
  linkButton.setAttribute('href', link);
  linkButton.textContent = i18n.t('read');
  modal.querySelector('.modal-footer button').textContent = i18n.t('close');
  document.body.classList.add('modal-open');
  modal.classList.add('show');
  modal.removeAttribute('aria-hidden');
  state.modal.postId.push(postId);
};

const closeModal = () => {
  const modal = document.querySelector('.modal');
  modal.removeAttribute('id');
  modal.style = 'none';
  modal.querySelector('.modal-title').textContent = '';
  modal.querySelector('p').textContent = '';
  const linkButton = modal.querySelector('a');
  linkButton.removeAttribute('href');
  linkButton.textContent = '';
  modal.querySelector('button').textContent = '';
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  modal.classList.remove('show');
};

const buttonsClosingModal = document.querySelectorAll('[data-bs-dismiss="modal"]');
buttonsClosingModal.forEach((button) => {
  button.addEventListener('click', () => {
    closeModal();
  });
});

const renderFeeds = (current, previous) => {
  if (previous.length === 0) {
    const titleFeeds = document.createElement('h2');
    titleFeeds.textContent = i18n.t('feeds');
    feedsContainer.appendChild(titleFeeds);
    const listOfFeeds = document.createElement('ul');
    listOfFeeds.classList.add('list-group');
    feedsContainer.appendChild(listOfFeeds);
  }
  const listOfFeeds = feedsContainer.querySelector('ul');
  listOfFeeds.innerHTML = '';
  current.forEach(([{ feedTitle, feedDescription, urlId }]) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item');
    liFeed.setAttribute('id', urlId);
    const descriptionOfFeed = document.createElement('p');
    descriptionOfFeed.textContent = feedDescription;
    const titleOfFeed = document.createElement('h3');
    titleOfFeed.textContent = feedTitle;
    liFeed.appendChild(titleOfFeed);
    liFeed.appendChild(descriptionOfFeed);
    listOfFeeds.appendChild(liFeed);
  });
};

const renderPosts = (current, previous, state) => {
  if (previous.length === 0) {
    const titlePosts = document.createElement('h2');
    titlePosts.textContent = i18n.t('posts');
    linksContainer.appendChild(titlePosts);
    const liOfPosts = document.createElement('ul');
    linksContainer.appendChild(liOfPosts);
  }
  const liOfPosts = linksContainer.querySelector('ul');
  liOfPosts.classList.add('list-group');
  liOfPosts.innerHTML = '';
  current.forEach(({
    link, title, description, urlId, postId,
  }) => {
    const post = document.createElement('li');
    post.dataset.feedId = urlId;
    post.id = postId;
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const postLink = document.createElement('a');
    if (_.includes(state.modal.postId, postId)) {
      postLink.classList.add('font-weight-normal');
    } else {
      postLink.classList.add('font-weight-bold');
    }
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('href', link);
    postLink.textContent = title;
    postLink.addEventListener('click', () => {
      postLink.classList.remove('font-weight-bold');
      postLink.classList.add('font-weight-normal');
      state.modal.postId.push(postId);
    });
    post.appendChild(postLink);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'ml-5');
    button.setAttribute('type', 'button');
    button.textContent = i18n.t('buttons');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = `#${postId}`;
    post.appendChild(button);
    button.addEventListener('click', () => updateModal(title, description, link, postId, state));
    liOfPosts.appendChild(post);
  });
};

const watch = (state) => {
  const watchedState = onChange(state, function fn(path, current, previous) {
    const p = form.querySelector('p');
    if (path === 'errors') {
      p.textContent = '';
      p.textContent = current;
      input.after(p);
    }

    if (path === 'titles') {
      renderFeeds(current, previous);
    }
    if (path === 'posts') {
      renderPosts(current, previous, this);
    }
    if (path === 'inputForm.status') {
      if (current === 'invalid') {
        input.classList.add('is-invalid');
        p.classList.remove('text-success');
        p.classList.add('text-danger');
      }
      if (current === 'valid') {
        input.classList.remove('is-invalid');
        p.classList.remove('text-danger');
        p.classList.add('text-success');
      }
    }
    if (path === 'modal.postId') {
      
      current.forEach((item) => {
        linksContainer.querySelector(`li[id="${item}"] a`).classList.remove('font-weight-bold');
        linksContainer.querySelector(`li[id="${item}"] a`).classList.add('font-weight-normal');
      });
    }
  });
  return watchedState;
};

export default watch;