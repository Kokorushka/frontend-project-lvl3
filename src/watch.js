import onChange from 'on-change';
import i18n from 'i18next';

const feedsContainer = document.getElementById('feeds');
const linksContainer = document.getElementById('links');
const input = document.querySelector('input');
const form = document.querySelector('form');

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
  current.forEach(([title, feedId]) => {
    const liFeed = document.createElement('li');
    liFeed.classList.add('list-group-item');
    liFeed.setAttribute('id', feedId);
    liFeed.textContent = title;
    listOfFeeds.appendChild(liFeed);
  });
}

const renderPosts = (current, previous) => {
  if (previous.length === 0) {
    const titlePosts = document.createElement('h2');
    titlePosts.textContent = i18n.t('posts');;
    linksContainer.appendChild(titlePosts);
    const liOfPosts = document.createElement('ul');
    linksContainer.appendChild(liOfPosts);
  }
  const liOfPosts = linksContainer.querySelector('ul');
  liOfPosts.classList.add('list-group');
  liOfPosts.innerHTML = '';
  current.forEach(([items, feedId]) => {
    items.forEach(([link, title]) => {
      const post = document.createElement('li');
      post.setAttribute('id', feedId);
      post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
      const postLink = document.createElement('a');
      postLink.setAttribute('href', link);
      postLink.textContent = title;
      post.appendChild(postLink);
      const button = document.createElement('button');
      button.classList.add('btn', 'btn-primary', 'ml-5')
      button.setAttribute('type', 'button');
      button.textContent = i18n.t('buttons');
      // const buttonLink = document.createElement('a');
      // buttonLink.setAttribute('href', link);
      // button.appendChild(buttonLink);
      post.appendChild(button);
      liOfPosts.appendChild(post);
  })
  })
}




const watch = (state) => {
  const watchedState = onChange(state, (path, current, previous) => {
    if (path === 'errors') {
      const p = form.querySelector('p');
      p.textContent = '';
      p.textContent = current;
      input.after(p);
      
    }

    if (path === 'titles') {
      renderFeeds(current, previous);
    }
    if (path === 'posts') {
      renderPosts(current, previous);
    }
    if (path === 'inputForm.status') {
      if (current === 'invalid') {
        input.classList.add('is-invalid');
        form.querySelector('p').classList.remove('text-success')
        form.querySelector('p').classList.add('text-danger')
      }
      if (current === 'valid') {
        input.classList.remove('is-invalid');
        form.querySelector('p').classList.add('text-success')
        form.querySelector('p').classList.remove('text-danger')
      }
    }
  });
  return watchedState;
};

export default watch;