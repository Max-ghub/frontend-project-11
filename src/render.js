import tracker from './tracker';

/* eslint-disable no-param-reassign */
const createFeedBackEl = (elements) => {
  const newFeedbackEl = document.createElement('p');
  newFeedbackEl.classList.add('feedback', 'm-0', 'position-absolute', 'small');
  elements.formContainer.append(newFeedbackEl);
  elements.feedback = document.querySelector('#rss-form-container .feedback');
};

const feedbackToggle = ({ feedback }, state) => {
  const error = state.error !== null;

  if (error) {
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    return;
  }

  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
};

const createContainer = (elements, i18nInstance, name) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');

  const body = document.createElement('div');
  body.classList.add('card-body');

  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18nInstance.t(`${name}.title`);
  body.append(title);

  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  container.append(body, list);
  elements[name].append(container);
};

const renderFormSubmitError = (elements, state, error, prevError, i18nInstance) => {
  const hasError = error !== null;
  const hadError = prevError !== null;

  if (!hasError && hadError) {
    elements.feedback.classList.remove('text-danger');
    elements.field.classList.remove('is-invalid');
    return;
  }

  if (error.name === 'AxiosError') {
    if (error.code === 'ERR_NETWORK') {
      error.message = i18nInstance.t(`formSubmit.danger.${error.code}`);
    }
  }

  if (error.name === 'TypeError') {
    error.message = i18nInstance.t('formSubmit.danger.ERR_NOT_RSS');
  }

  feedbackToggle(elements, state);
  elements.feedback.textContent = error.message;
  elements.field.classList.add('is-invalid');
};

const renderFeeds = (elements, state, feedsData, i18nInstance) => {
  const feedsListEl = elements.feeds.querySelector('ul.list-group');

  const feeds = feedsData.map((feedData) => {
    const feedEl = document.createElement('li');
    feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const feedTitleEl = document.createElement('h3');
    feedTitleEl.classList.add('h6', 'm-0');
    feedTitleEl.textContent = feedData.title;

    const feedDescEl = document.createElement('p');
    feedDescEl.classList.add('m-0', 'small', 'text-black-50');
    feedDescEl.textContent = feedData.description;

    feedEl.append(feedTitleEl, feedDescEl);

    return feedEl;
  });

  feedsListEl.innerHTML = '';
  feedsListEl.prepend(...feeds);

  feedbackToggle(elements, state);
  elements.feedback.textContent = i18nInstance.t('formSubmit.seccess');
};

const renderPosts = (elements, postsData, i18nInstance, type = 'full') => {
  const postsListEl = elements.posts.querySelector('ul.list-group');

  const posts = postsData.map((postData) => {
    const postEl = document.createElement('li');
    postEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const postLinkEl = document.createElement('a');
    postLinkEl.setAttribute('href', postData.link);
    postLinkEl.classList.add('fw-bold');
    postLinkEl.dataset.id = postData.id;
    postLinkEl.setAttribute('target', '_blank');
    postLinkEl.setAttribute('rel', 'noopener noreferrer');
    postLinkEl.textContent = postData.title;

    const postButtonEl = document.createElement('button');
    postButtonEl.setAttribute('type', 'button');
    postButtonEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    postButtonEl.dataset.id = postData.id;
    postButtonEl.dataset.bsToggle = 'modal';
    postButtonEl.dataset.bsTarget = '#modal';
    postButtonEl.textContent = i18nInstance.t('posts.viewButton');
    postButtonEl.addEventListener('click', () => {
      const modal = document.getElementById('modal');

      // Header
      const modalTitle = modal.querySelector('.modal-title');
      modalTitle.textContent = postData.title;

      // Body
      const modalBody = modal.querySelector('.modal-body');
      modalBody.textContent = postData.description;

      // Footer
      const modalFooter = modal.querySelector('.modal-footer');
      const modalReadButton = modalFooter.querySelector('a[role="button"]');
      modalReadButton.setAttribute('href', postData.link);
      const modalCloseButton = modalFooter.querySelector('button[type="button"]');
      // Clearing modal
      modalCloseButton.addEventListener('click', () => {
        modalTitle.textContent = '';
        modalBody.textContent = '';
        modalReadButton.setAttribute('href', '#');
      }, { once: true });
    });

    postEl.append(postLinkEl, postButtonEl);
    return postEl;
  });

  if (type === 'full') {
    postsListEl.innerHTML = '';
  }
  postsListEl.prepend(...posts);
};

const render = (elements, state, i18nInstance) => (path, value, prevValue) => {
  console.log(path, value);
  switch (path) {
    case 'rssData.newFeedId': {
      const feedsData = state.rssData.feeds;
      renderFeeds(elements, state, feedsData, i18nInstance);

      const postsData = state.rssData.posts;
      renderPosts(elements, postsData, i18nInstance);

      break;
    }
    case 'tracker.enabled': {
      setInterval(() => {
        const newPostsPromise = tracker(state);
        newPostsPromise
          .then((postsDataAll) => {
            postsDataAll.forEach((postsData) => {
              state.rssData.posts.push(...postsData);
              const renderPostsType = 'trackerPrepend';
              renderPosts(elements, postsData, i18nInstance, renderPostsType);
            });
          });
      }, 10000);
      break;
    }
    case 'error': {
      renderFormSubmitError(elements, state, value, prevValue, i18nInstance);
      break;
    }
    case 'uiState.submit': {
      createFeedBackEl(elements);
      break;
    }
    case 'uiState.feeds': {
      const containerName = 'feeds';
      createContainer(elements, i18nInstance, containerName);
      break;
    }
    case 'uiState.posts': {
      const containerName = 'posts';
      createContainer(elements, i18nInstance, containerName);
      break;
    }
    default: {
      break;
    }
  }
};

export default render;
