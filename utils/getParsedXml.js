const getParsedXml = (response) => {
  const parser = new DOMParser();
  const result = parser.parseFromString(response.data.contents, "application/xml");
  // const feedLink = result.querySelector('link');
  const title = result.querySelector('title').textContent;
  const items = result.querySelectorAll('item');
  const mappedItems = [...items].map((item) => {
    const link = item.querySelector('link').innerHTML;
    const title = item.querySelector('title').textContent;
    return [link, title];
  });
  return [title, mappedItems];
};

export default getParsedXml;