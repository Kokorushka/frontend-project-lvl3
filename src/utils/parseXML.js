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
  const title = titleFeed.textContent;
  const descriptionFeed = result.querySelector('channel>description');
  const description = descriptionFeed.textContent;
  const items = result.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    return { link, postTitle, postDescription };
  });
  return { title, description, posts };
};

export default parseXML;
