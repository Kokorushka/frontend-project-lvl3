import onChange from 'on-change';
// import _ from 'lodash';

// const closeModal = (elements) => {
//   elements.modal.removeAttribute('id');
//   elements.modal.style = 'none';
//   elements.modal.querySelector('.modal-title').textContent = '';
//   elements.modal.querySelector('p').textContent = '';
//   elements.linkButton.removeAttribute('href');
//   elements.linkButton.textContent = '';
//   elements.modal.querySelector('button').textContent = '';
//   elements.modal.setAttribute('aria-hidden', 'true');
//   document.body.classList.remove('modal-open');
//   elements.modal.classList.remove('show');
// };
const updateModal = (currentItem, state, instancei18n, elements) => {
  elements.modal.id = currentItem;
  const { posts } = state;
  const currentPost = posts.find((post) => post.id === currentItem);
  const { postTitle, postDescription, link } = currentPost;
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
  // state.viewedPosts.add(id);
  // elements.buttonsClosingModal.forEach((button) => {
  //   button.addEventListener('click', () => {
  //     closeModal(elements);
  //   });
  // });
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
  current.forEach(({
    urlId,
    title,
    description,
  }) => {
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
  const {
    viewedPosts,
  } = state;
  const liOfPosts = elements.linksContainer.querySelector('ul');
  liOfPosts.classList.add('list-group');
  liOfPosts.innerHTML = '';
  current.forEach(({
    postTitle,
    link,
    channelId,
    id,
  }) => {
    const post = document.createElement('li');
    post.dataset.feedId = channelId;
    post.id = id;
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const postLink = document.createElement('a');
    if (viewedPosts.has(id)) {
      postLink.classList.add('font-weight-normal');
    } else {
      postLink.classList.add('fw-bold');
    }
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('href', link);
    postLink.dataset.testid = 'post-link';
    postLink.textContent = postTitle;
    post.appendChild(postLink);
    const button = document.createElement('button');
    button.classList.add('btn', 'btn-primary', 'ml-5');
    button.setAttribute('type', 'button');
    button.textContent = instancei18n.t('buttons');
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = `#${id}`;
    button.dataset.id = id;
    button.dataset.testid = 'preview';
    post.appendChild(button);
    liOfPosts.appendChild(post);
  });
};

const renderSuccess = (elements) => {
  elements.input.classList.remove('is-invalid');
  elements.p.classList.remove('text-danger');
  elements.p.classList.add('text-success');
};
const renderFail = (elements) => {
  elements.input.classList.add('is-invalid');
  elements.p.classList.remove('text-success');
  elements.p.classList.add('text-danger');
};
const renderText = (elements, instancei18n, current) => {
  elements.p.textContent = '';
  elements.p.textContent = instancei18n.t(current);
  elements.input.after(elements.p);
};
const disableButton = (elements) => {
  elements.input.setAttribute('readonly', 'readonly');
  elements.buttonAdd.setAttribute('disabled', 'disabled');
};

const ableButton = (elements) => {
  elements.buttonAdd.removeAttribute('disabled');
  elements.input.removeAttribute('readonly');
};

const watch = (state, instancei18n, elements) => {
  const watchedState = onChange(state, (path, current, previous) => {
    if (path === 'form.error' && current !== null) {
      renderText(elements, instancei18n, current);
    }

    if (path === 'feeds') {
      renderFeeds(current, previous, instancei18n, elements);
    }
    if (path === 'posts') {
      renderPosts(current, previous, state, instancei18n, elements);
    }
    // if (path === 'form.status') {
    //   if (current === 'invalid') {
    //     renderFail(elements);
    //   }
    //   if (current === 'valid') {
    //     renderSuccess(elements);
    //   }
    // }
    if (path === 'viewedPosts') {
      current.forEach((item) => {
        elements.linksContainer.querySelector(`li[id="${item}"] a`).classList.remove('fw-bold');
        elements.linksContainer.querySelector(`li[id="${item}"] a`).classList.add('font-weight-normal');
      });
    }
    if (path === 'loadingProcess.status') {
      if (current === 'loading') {
        disableButton(elements);
        elements.input.classList.remove('is-invalid');
        elements.p.classList.remove('text-danger');
        elements.p.classList.remove('text-success');
      }
      if (current === 'filling') {
        ableButton(elements);
      }
      if (current === 'success') {
        renderSuccess(elements);
        ableButton(elements);
      }
      if (current === 'fail') {
        renderFail(elements);
        ableButton(elements);
      }
    }
    if (path === 'loadingProcess.error' && current !== null) {
      renderText(elements, instancei18n, current);
    }
    if (path === 'modal.currentId') {
      updateModal(current, state, instancei18n, elements);
    }
  });
  return watchedState;
};

export default watch;
