const getParsedXml = (response, instancei18n, state) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(response.data.contents, 'application/xml');
  const error = result.querySelector('parsererror');
  if (error) {
    state.errors = `${instancei18n.t('errors.noValidRSS')}`;
    throw error;
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
