import onChange from 'on-change';
import _ from 'lodash';

const closeModal = (elements) => {
  elements.modal.removeAttribute('id');
  elements.modal.style = 'none';
  elements.modal.querySelector('.modal-title').textContent = '';
  elements.modal.querySelector('p').textContent = '';
  elements.linkButton.removeAttribute('href');
  elements.linkButton.textContent = '';
  elements.modal.querySelector('button').textContent = '';
  elements.modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-open');
  elements.modal.classList.remove('show');
};
const updateModal = (postTitle, postDescription, link, postId, state, instancei18n, elements) => {
  elements.modal.id = postId;
  elements.modal.style = 'display: block; padding-right: 12px;';
  elements.modal.setAttribute('role', 'dialog');
  elements.modal.querySelector('.modal-title').textContent = postTitle;
  elements.modal.querySelector('p').textContent = postDescription;
  elements.linkButton.setAttribute('href', link);
  elements.linkButton.textContent = instancei18n.t('read');
  elements.modal.querySelector('.modal-footer button').textContent = instancei18n.t('close');
  document.body.classList.add('modal-open');
  elements.modal.classList.add('show');
  elements.modal.removeAttribute('aria-hidden');
  state.postId.add(postId);
  elements.buttonsClosingModal.forEach((button) => {
    button.addEventListener('click', () => {
      closeModal(elements);
    });
  });
};

const renderFeeds = (current, previous, instancei18n, elements) => {
  if (previous.length === 0) {
    const titleFeeds = document.createElement('h2');
    titleFeeds.textContent = instancei18n.t('feeds');
    elements.feedsContainer.appendChild(titleFeeds);
    const listOfFeeds = document.createElement('ul');
    listOfFeeds.classList.add('list-group');
    elements.feedsContainer.appendChild(listOfFeeds);
  }
  const listOfFeeds = elements.feedsContainer.querySelector('ul');
  listOfFeeds.innerHTML = '';
  current.forEach(({ urlId, title, description }) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item');
    liFeed.setAttribute('id', urlId);
    const descriptionOfFeed = document.createElement('p');
    descriptionOfFeed.textContent = description;
    const titleOfFeed = document.createElement('h3');
    titleOfFeed.textContent = title;
    liFeed.appendChild(titleOfFeed);
    liFeed.appendChild(descriptionOfFeed);
    listOfFeeds.appendChild(liFeed);
  });
};

const renderPosts = (current, previous, state, instancei18n, elements) => {
  if (previous.length === 0) {
    const titlePosts = document.createElement('h2');
    titlePosts.textContent = instancei18n.t('posts');
    elements.linksContainer.appendChild(titlePosts);
    const liOfPosts = document.createElement('ul');
    elements.linksContainer.appendChild(liOfPosts);
  }
  const liOfPosts = elements.linksContainer.querySelector('ul');
  liOfPosts.classList.add('list-group');
  liOfPosts.innerHTML = '';
  current.forEach(({
    link, postTitle, postDescription, urlId, postId,
  }) => {
    const post = document.createElement('li');
    post.dataset.feedId = urlId;
    post.id = postId;
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const postLink = document.createElement('a');
    if (_.includes(state.postId, postId)) {
      postLink.classList.add('font-weight-normal');
    } else {
      postLink.classList.add('fw-bold');
    }
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('href', link);
    postLink.dataset.testid = 'post-link';
    postLink.textContent = postTitle;
    postLink.addEventListener('click', () => {
      postLink.classList.remove('fw-bold');
      postLink.classList.add('font-weight-normal');
      state.postId.add(postId);
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
    button.addEventListener('click', () => updateModal(postTitle, postDescription, link, postId, state, instancei18n, elements));
    liOfPosts.appendChild(post);
  });
};

const watch = (state, instancei18n, elements) => {
  const watchedState = onChange(state, (path, current, previous) => {
    if (path === 'form.errors') {
      elements.p.textContent = '';
      elements.p.textContent = current;
      elements.input.after(elements.p);
    }

    if (path === 'form.urls') {
      renderFeeds(current, previous, instancei18n, elements);
    }
    if (path === 'posts') {
      renderPosts(current, previous, watchedState, instancei18n, elements);
    }
    if (path === 'form.status') {
      if (current === 'invalid') {
        elements.input.classList.add('is-invalid');
        elements.p.classList.remove('text-success');
        elements.p.classList.add('text-danger');
        elements.buttonAdd.removeAttribute('disabled');
        elements.input.removeAttribute('readonly');
      }
      if (current === 'valid') {
        elements.input.classList.remove('is-invalid');
        elements.p.classList.remove('text-danger');
        elements.p.classList.add('text-success');
        elements.input.removeAttribute('readonly');
        elements.buttonAdd.removeAttribute('disabled');
      }
      if (current === 'loading') {
        elements.input.setAttribute('readonly', 'readonly');
        elements.buttonAdd.setAttribute('disabled', 'disabled');
      }
    }
    if (path === 'postId') {
      current.forEach((item) => {
        elements.linksContainer.querySelector(`li[id="${item}"] a`).classList.remove('fw-bold');
        elements.linksContainer.querySelector(`li[id="${item}"] a`).classList.add('font-weight-normal');
      });
    }
  });
  return watchedState;
};

export default watch;
