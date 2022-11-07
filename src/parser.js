import { uniqueId } from 'lodash';

const parseRSS = (data, state, feedId) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data, 'application/xml');

  const feed = {
    id: feedId,
    title: xmlDoc.querySelector('channel title').textContent,
    description: xmlDoc.querySelector('channel description').textContent,
  };
  state.feeds.push(feed);

  const items = xmlDoc.querySelectorAll('item');
  items.forEach((item) => {
    const post = {
      id: uniqueId(),
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      feedId,
    };
    state.posts.push(post);
  });
};

export default parseRSS;
