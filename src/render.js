const renderError = (elements, error, prevError) => {
  const hasError = error !== null;
  const hadError = prevError !== null;

  if (!hasError && hadError) {
    const feedbackEl = elements.rssFormContainer.querySelector('.feedback');

    elements.rssField.classList.remove('is-invalid');
    feedbackEl.remove();

    return;
  }

  const feedbackEl = document.createElement('p');
  feedbackEl.classList.add('feedback', 'm-0', 'position-absolute', 'small', 'text-danger');
  feedbackEl.textContent = error.message;

  elements.rssField.classList.add('is-invalid');
  elements.rssFormContainer.append(feedbackEl);
};

const render = (elements) => (path, value, prevValue) => {
  switch (path) {
    case 'error': {
      renderError(elements, value, prevValue);
      break;
    }
    default: {
      // console.log(`Unknown path: ${path}`);
      break;
    }
  }
};

export default render;
