import * as yup from 'yup';
import onChange from 'on-change';
import render from './render';

const runApp = () => {
  const elements = {
    rssFormContainer: document.getElementById('rss-form-container'),
    rssForm: document.querySelector('.rss-form'),
    rssField: document.getElementById('rss-field'),
    rssSubmit: document.querySelector('.rss-form [type="submit"]'),
  };

  const initalState = {
    field: {
      value: '',
    },
    error: null,
  };

  const state = onChange(initalState, render(elements, initalState));
  const schema = yup.string().url().nullable();

  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fieldValue = formData.get('url');
    state.field.value = fieldValue;

    schema.validate(state.field.value)
      .then(() => {
        state.error = null;
      })
      .catch(() => {
        state.error = 'url';
      });
  });
};

export default runApp;
