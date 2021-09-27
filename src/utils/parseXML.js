const parseXML = (xml) => {
  const parser = new DOMParser();
  const dom = parser.parseFromString(xml, 'application/xml');
  const err = dom.querySelector('parsererror');
  if (err) {
    const error = new Error(err.textContent);
    error.isParsingError = true;
    throw error;
  }
  const titleFeed = dom.querySelector('channel>title');
  const title = titleFeed.textContent;
  const descriptionFeed = dom.querySelector('channel>description');
  const description = descriptionFeed.textContent;
  const items = dom.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').textContent;
    const postTitle = item.querySelector('title').textContent;
    const postDescription = item.querySelector('description').textContent;
    return { postTitle, link, postDescription };
  });
  return { title, description, posts };
};

export default parseXML;
