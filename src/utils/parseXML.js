const parseXML = (response) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(response.data.contents, 'application/xml');
  const err = result.querySelector('parsererror');
  if (err) {
    const error = new Error(err.textContent);
    error.isParsingError = true;
    throw error;
  }
  const titleFeed = result.querySelector('channel>title');
  const feedTitle = titleFeed.textContent;
  const descriptionFeed = result.querySelector('channel>description');
  const feedDescription = descriptionFeed.textContent;
  const items = result.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').textContent;
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    return { link, title, description };
  });
  return { feedTitle, feedDescription, posts };
};

export default parseXML;
