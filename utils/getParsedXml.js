import i18n from 'i18next';

const getParsedXml = (response) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(response.data.contents, 'application/xml');
  if (!result.querySelector('rss')) {
    throw new Error(`${i18n.t('errors.noValidRSS')}`);
  }
  const feedTitle = result.querySelector('title').textContent;
  const feedDescription = result.querySelector('description').textContent;
  const items = result.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').innerHTML;
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    return { link, title, description };
  });
  return { feedTitle, feedDescription, posts };
};

export default getParsedXml;
