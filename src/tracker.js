import axios from 'axios';
import parseRSS from './parser.js';
import getProxyURL from './getProxyURL.js';

const tracker = (state) => {
  const { urls } = state.tracker;
  const newPostsPromise = urls.map(({ url, feedId }) => axios.get(getProxyURL(url))
    .then((response) => parseRSS(response, state, feedId)));
  return Promise.all(newPostsPromise);
};
export default tracker;
