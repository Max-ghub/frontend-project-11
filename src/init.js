import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render';
import resources from './locales/index.js';
import parser from './parser';

const runApp = () => {
  const elements = {
    formContainer: document.getElementById('rss-form-container'),
    form: document.querySelector('.rss-form'),
    field: document.getElementById('rss-field'),
    submit: document.querySelector('.rss-form [type="submit"]'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    feedback: document.querySelector('#rss-form-container .feedback'),
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
      url: i18nInstance.t('formSubmit.danger.ERR_URL'),
    },
  });

  const initalState = {
    field: {
      value: '',
    },
    newFeedId: null,
    feeds: [],
    posts: [],
    error: null,
    uiState: {
      submit: false,
      feeds: false,
      posts: false,
    },
  };

  const state = onChange(initalState, render(elements, initalState, i18nInstance));

  const schemaURL = yup.string().url().nullable();
  const proxy = 'https://allorigins.hexlet.app/raw?url=';
  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    state.uiState.submit = true;

    const formData = new FormData(e.target);
    const fieldValue = formData.get('url');
    state.field.value = fieldValue;

    schemaURL.validate(state.field.value)
      .then(() => {
        const url = `${proxy}${encodeURIComponent(fieldValue)}`;
        return axios.get(url);
      }).then((response) => {
        const feedId = uniqueId();
        parser(response.data, state, feedId);
        return feedId;
      })
      .then((id) => {
        state.uiState.feeds = true;
        state.uiState.posts = true;
        state.error = null;
        state.newFeedId = id;
      })
      .catch((_err) => {
        state.error = _err;
      });
  });
};

export default runApp;
