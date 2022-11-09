/* eslint-disable no-param-reassign */
import trackData from './trackData';

const createFeedBackEl = (elements) => {
  const newFeedbackEl = document.createElement('p');
  newFeedbackEl.classList.add('feedback', 'm-0', 'position-absolute', 'small');
  elements.formContainer.append(newFeedbackEl);
  elements.feedback = document.querySelector('#rss-form-container .feedback');
};

const createContainer = (elements, i18nInstance, name) => {
  const containerEl = document.createElement('div');
  containerEl.classList.add('card', 'border-0');

  const containerBodyEl = document.createElement('div');
  containerBodyEl.classList.add('card-body');
  const containerTitleEl = document.createElement('h2');
  containerTitleEl.classList.add('card-title', 'h4');
  containerTitleEl.textContent = i18nInstance.t(`${name}.title`);
  containerBodyEl.append(containerTitleEl);

  const containerListEl = document.createElement('ul');
  containerListEl.classList.add('list-group', 'border-0', 'rounded-0');

  containerEl.append(containerBodyEl, containerListEl);
  elements[name].append(containerEl);
};

const feedbackToggle = (elements, state, i18nInstance) => {
  const { feedback } = elements;
  const error = state.error !== null;

  if (error) {
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = state.error.message;
    return;
  }

  feedback.classList.add('text-success');
  feedback.classList.remove('text-danger');
  feedback.textContent = i18nInstance.t('formSubmit.seccess');
};

const renderFormSubmitError = (elements, state, error, prevError, i18nInstance) => {
  const hasError = error !== null;
  const hadError = prevError !== null;

  if (!hasError && hadError) {
    elements.field.classList.remove('is-invalid');
    return;
  }

  if (error.name === 'TypeError') {
    error.message = i18nInstance.t('formSubmit.danger.ERR_NOT_RSS');
  } else if (error.name === 'ExistUrlError') {
    error.message = i18nInstance.t('formSubmit.danger.ERR_EXIST_URL');
  } else if (error.name === 'AxiosError' && error.code === 'ERR_NETWORK') {
    feedbackToggle(elements, state, i18nInstance);
    error.message = i18nInstance.t(`formSubmit.danger.${error.code}`);
  }

  feedbackToggle(elements, state, i18nInstance);
  elements.field.classList.add('is-invalid');
};

const renderFeeds = (elements, feedsData, newFeedId) => {
  const feedsListEl = elements.feeds.querySelector('ul.list-group');
  const feedData = feedsData.find(({ id }) => newFeedId === id);

  const feedEl = document.createElement('li');
  feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');

  const feedTitleEl = document.createElement('h3');
  feedTitleEl.classList.add('h6', 'm-0');
  feedTitleEl.textContent = feedData.title;
  const feedDescEl = document.createElement('p');
  feedDescEl.classList.add('m-0', 'small', 'text-black-50');
  feedDescEl.textContent = feedData.description;

  feedEl.append(feedTitleEl, feedDescEl);
  feedsListEl.prepend(feedEl);
};

const renderPosts = (elements, postsData, i18nInstance) => {
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

      // Update postLink
      postLinkEl.classList.remove('fw-bold');
      postLinkEl.classList.add('fw-normal', 'link-secondary');
    });

    postEl.append(postLinkEl, postButtonEl);
    return postEl;
  });

  postsListEl.prepend(...posts);
};

const tracker = (elements, state, i18nInstance, interval) => {
  setTimeout(() => {
    const newPostsDataAllPromise = trackData(state);

    newPostsDataAllPromise.then((newPostsDataAll) => {
      newPostsDataAll.forEach((newPostsData) => {
        if (newPostsData.length === 0) return;
        state.rssData.posts.push(...newPostsData);
        renderPosts(elements, newPostsData, i18nInstance);
      });
    });

    tracker(elements, state, i18nInstance, interval);
  }, interval);
};

const render = (elements, state, i18nInstance) => (path, value, prevValue) => {
  switch (path) {
    case 'rssData.newFeedId': {
      // Feedback
      feedbackToggle(elements, state, i18nInstance);
      elements.field.value = '';
      elements.field.focus();

      // Feeds
      const newFeedId = value;
      const feedsData = state.rssData.feeds;
      renderFeeds(elements, feedsData, newFeedId);

      // Posts
      const postsData = state.rssData.posts;
      const newPostsData = postsData.filter(({ feedId }) => feedId === newFeedId);
      renderPosts(elements, newPostsData, i18nInstance);

      break;
    }
    case 'error': {
      renderFormSubmitError(elements, state, value, prevValue, i18nInstance);
      break;
    }
    case 'tracker.enabled': {
      const { interval } = state.tracker;
      tracker(elements, state, i18nInstance, interval);
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
