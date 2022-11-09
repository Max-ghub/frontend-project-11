import { uniqueId } from 'lodash';

const getOldPosts = (state, feedId) => state.rssData.posts
  .filter((post) => post.feedId === feedId);

const getPostsTitles = (posts) => posts.map(({ title }) => title);

const getFeedData = (xml, feedId) => ({
  id: feedId,
  title: xml.querySelector('channel title').textContent,
  description: xml.querySelector('channel description').textContent,
});

const getPostsData = (items, feedId) => Array.from(items).map((item) => {
  const postData = {
    id: uniqueId(),
    title: item.querySelector('title').textContent,
    description: item.querySelector('description').textContent,
    link: item.querySelector('link').textContent,
    feedId,
  };

  return postData;
});

const getActualPostsData = (data, oldPostsTitles) => data
  .filter(({ title }) => !oldPostsTitles.includes(title));

export default ({ data }, state, feedId, type = '') => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(data.contents, 'application/xml');
  const items = xmlDocument.querySelectorAll('item');

  if (type === 'submit') {
    const feedData = getFeedData(xmlDocument, feedId);
    const postsData = getPostsData(items, feedId);
    return { feedData, postsData };
  }

  const oldPosts = getOldPosts(state, feedId);
  const oldPostsTitles = getPostsTitles(oldPosts);

  const postsData = getPostsData(items, feedId);
  const newPosts = getActualPostsData(postsData, oldPostsTitles);

  return newPosts;
};
