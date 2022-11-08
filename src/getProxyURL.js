const getProxyURL = (url) => {
  const proxy = 'https://allorigins.hexlet.app/get?disableCache=true&url=';
  return `${proxy}${encodeURIComponent(url)}`;
};

export default getProxyURL;
