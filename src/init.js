import * as yup from 'yup';
import onChange from 'on-change';
import i18n from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import render from './render';
import resources from './locales/index.js';
import parseRSS from './parser';
import getProxyURL from './getProxyURL';

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
      value: null,
    },
    rssData: {
      newFeedId: null,
      feeds: [],
      posts: [],
      urls: [],
    },
    tracker: {
      enabled: false,
      interval: 5000,
      urls: [],
    },
    error: null,
    uiState: {
      submit: false,
      feeds: false,
      posts: false,
    },
  };

  const state = onChange(initalState, render(elements, initalState, i18nInstance));

  const schemaURL = yup.string().url().nullable();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    state.uiState.submit = true;

    const formData = new FormData(e.target);
    const fieldValue = formData.get('url');
    state.field.value = fieldValue;

    const existingUrl = state.rssData.urls.includes(state.field.value);
    if (existingUrl) {
      state.error = { name: 'ExistUrlError' };
      return;
    }

    schemaURL.validate(state.field.value)
      .then(() => axios.get(getProxyURL(state.field.value)))
      .then((response) => {
        const feedId = uniqueId();

        const parseType = 'submit';
        const { feedData, postsData } = parseRSS(response, state, feedId, parseType);
        state.uiState.feeds = true;
        state.uiState.posts = true;
        state.rssData.feeds.push(feedData);
        state.rssData.posts.push(...postsData);
        return feedId;
      })
      .then((id) => {
        // Error
        state.error = null;

        // rssData
        state.rssData.newFeedId = id;
        state.rssData.urls.push(state.field.value);

        // Tracker
        state.tracker.urls.push({
          url: state.field.value,
          feedId: id,
        });
        state.tracker.enabled = true;
      })
      .catch((_err) => {
        state.error = _err;
      });
  });
};

export default runApp;
