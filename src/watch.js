import onChange from 'on-change';
import _ from 'lodash';

const updateModal = (title, description, link, postId, state, instancei18n) => {
  const modal = document.querySelector('.modal');
  modal.id = postId;
  modal.style = 'display: block; padding-right: 12px;';
  modal.setAttribute('role', 'dialog');
  modal.querySelector('.modal-title').textContent = title;
  modal.querySelector('p').textContent = description;
  const linkButton = modal.querySelector('a');
  linkButton.setAttribute('href', link);
  linkButton.textContent = instancei18n.t('read');
  modal.querySelector('.modal-footer button').textContent = instancei18n.t('close');
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

const renderFeeds = (current, previous, instancei18n) => {
  const feedsContainer = document.getElementById('feeds');
  if (previous.length === 0) {
    const titleFeeds = document.createElement('h2');
    titleFeeds.textContent = instancei18n.t('feeds');
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

const renderPosts = (current, previous, state, instancei18n) => {
  const linksContainer = document.getElementById('links');
  if (previous.length === 0) {
    const titlePosts = document.createElement('h2');
    titlePosts.textContent = instancei18n.t('posts');
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
      postLink.classList.add('fw-bold');
    }
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('href', link);
    postLink.dataset.testid = 'post-link';
    postLink.textContent = title;
    postLink.addEventListener('click', () => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('font-weight-normal');
      state.modal.postId.push(postId);
    });
    post.appendChild(postLink);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'ml-5');
    button.setAttribute('type', 'button');
    button.textContent = instancei18n.t('buttons');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = `#${postId}`;
    button.dataset.testid = 'preview';
    post.appendChild(button);
    button.addEventListener('click', () => updateModal(title, description, link, postId, state, instancei18n));
    liOfPosts.appendChild(post);
  });
};

const watch = (state, instancei18n) => {
  const input = document.querySelector('input');
  const form = document.querySelector('form');
  const button = document.querySelector('button[aria-label="add"]');
  const watchedState = onChange(state, function fn(path, current, previous) {
    if (path === 'errors') {
      const p = form.querySelector('p');
      p.textContent = '';
      p.textContent = current;
      input.after(p);
    }

    if (path === 'titles') {
      renderFeeds(current, previous, instancei18n);
    }
    if (path === 'posts') {
      renderPosts(current, previous, this, instancei18n);
    }
    if (path === 'inputForm.status') {
      const p = form.querySelector('p');
      if (current === 'invalid') {
        input.classList.add('is-invalid');
        p.classList.remove('text-success');
        p.classList.add('text-danger');
        button.removeAttribute('disabled');
        input.removeAttribute('readonly');
      }
      if (current === 'valid') {
        input.classList.remove('is-invalid');
        p.classList.remove('text-danger');
        p.classList.add('text-success');
        input.removeAttribute('readonly');
        button.removeAttribute('disabled');
      }
      if (current === 'loading') {
        input.setAttribute('readonly', 'readonly');
        button.setAttribute('disabled', 'disabled');
      }
    }
    if (path === 'modal.postId') {
      const linksContainer = document.getElementById('links');
      current.forEach((item) => {
        linksContainer.querySelector(`li[id="${item}"] a`).classList.remove('fw-bold');
        linksContainer.querySelector(`li[id="${item}"] a`).classList.add('font-weight-normal');
      });
    }
  });
  return watchedState;
};

export default watch;
