import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import render from './render';
import resources from './locales/index.js';

const runApp = () => {
  const elements = {
    rssFormContainer: document.getElementById('rss-form-container'),
    rssForm: document.querySelector('.rss-form'),
    rssField: document.getElementById('rss-field'),
    rssSubmit: document.querySelector('.rss-form [type="submit"]'),
  };

  const defaultLanguage = 'ru';
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  });

  yup.setLocale({
    string: {
      url: i18nInstance.t('yup.url'),
    },
  });

  const initalState = {
    field: {
      value: '',
    },
    error: null,
  };

  const state = onChange(initalState, render(elements));

  const schemaURL = yup.string().url().nullable();
  elements.rssForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const fieldValue = formData.get('url');
    state.field.value = fieldValue;

    schemaURL.validate(state.field.value)
      .then(() => {
        state.error = null;
      })
      .catch((_err) => {
        state.error = _err;
      });
  });
};

export default runApp;
