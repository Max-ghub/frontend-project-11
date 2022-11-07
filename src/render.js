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

const createFeedsContainer = (elements, i18nInstance) => {
  const feedsContainer = document.createElement('div');
  feedsContainer.classList.add('card', 'border-0');

  const feedsBody = document.createElement('div');
  feedsBody.classList.add('card-body');

  const feedsTitle = document.createElement('h2');
  feedsTitle.classList.add('card-title', 'h4');
  feedsTitle.textContent = i18nInstance.t('feeds.title');
  feedsBody.append(feedsTitle);

  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');

  feedsContainer.append(feedsBody, feedsList);
  elements.feeds.append(feedsContainer);
};

const createTasksContainer = (elements, i18nInstance) => {
  const postsContainer = document.createElement('div');
  postsContainer.classList.add('card', 'border-0');

  const postsBody = document.createElement('div');
  postsBody.classList.add('card-body');

  const postsTitle = document.createElement('h2');
  postsTitle.classList.add('card-title', 'h4');
  postsTitle.textContent = i18nInstance.t('posts.title');
  postsBody.append(postsTitle);

  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');

  postsContainer.append(postsBody, postsList);
  elements.posts.append(postsContainer);
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

  feedbackToggle(elements, state);
  elements.feedback.textContent = error.message;
  elements.field.classList.add('is-invalid');
};

const renderFeedsAndPosts = (elements, state, feedId, i18nInstance) => {
  // Feed
  const feedData = state.feeds.find(({ id }) => id === feedId);
  const feedsListEl = elements.feeds.querySelector('ul.list-group');

  const feedEl = document.createElement('li');
  feedEl.classList.add('list-group-item', 'border-0', 'border-end-0');

  const feedTitleEl = document.createElement('h3');
  feedTitleEl.classList.add('h6', 'm-0');
  feedTitleEl.textContent = feedData.title;

  const feedDescEl = document.createElement('p');
  feedDescEl.classList.add('m-0', 'small', 'text-black-50');
  feedDescEl.textContent = feedData.description;

  feedEl.append(feedTitleEl, feedDescEl);
  feedsListEl.append(feedEl);

  // Posts
  const postsData = state.posts.filter((post) => post.feedId === feedId);
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
  postsListEl.append(...posts);

  // Feedback
  feedbackToggle(elements, state);
  elements.feedback.textContent = i18nInstance.t('formSubmit.seccess');
};

const render = (elements, state, i18nInstance) => (path, value, prevValue) => {
  // console.log(path, value);
  switch (path) {
    case 'error': {
      renderFormSubmitError(elements, state, value, prevValue, i18nInstance);
      break;
    }
    case 'newFeedId': {
      renderFeedsAndPosts(elements, state, value, i18nInstance);
      break;
    }
    case 'uiState.submit': {
      createFeedBackEl(elements);
      break;
    }
    case 'uiState.feeds': {
      createFeedsContainer(elements, i18nInstance);
      break;
    }
    case 'uiState.tasks': {
      createTasksContainer(elements, i18nInstance);
      break;
    }
    default: {
      // console.log(`Unknown path: ${path}`);
      break;
    }
  }
};

export default render;
