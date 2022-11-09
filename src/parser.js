import { uniqueId } from 'lodash';

const parseRSS = ({ data }, state, feedId, type = '') => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(data.contents, 'application/xml');

  if (type === 'submit') {
    const feedData = {
      id: feedId,
      title: xmlDoc.querySelector('channel title').textContent,
      description: xmlDoc.querySelector('channel description').textContent,
    };

    const items = xmlDoc.querySelectorAll('item');
    const postsData = Array.from(items).map((item) => {
      const postData = {
        id: uniqueId(),
        title: item.querySelector('title').textContent,
        description: item.querySelector('description').textContent,
        link: item.querySelector('link').textContent,
        feedId,
      };

      return postData;
    });
    return { feedData, postsData };
  }

  const oldPosts = state.rssData.posts.filter((post) => post.feedId === feedId);
  const oldPostsTitles = oldPosts.map(({ title }) => title);
  const items = xmlDoc.querySelectorAll('item');
  const postsData = Array.from(items).map((item) => {
    const postData = {
      id: uniqueId(),
      title: item.querySelector('title').textContent,
      description: item.querySelector('description').textContent,
      link: item.querySelector('link').textContent,
      feedId,
    };

    return postData;
  });
  const newPosts = postsData.filter(({ title }) => !oldPostsTitles.includes(title));

  return newPosts;
};

export default parseRSS;
