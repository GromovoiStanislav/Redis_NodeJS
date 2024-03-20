import { getAllUsers } from '../db/users.js';

const renderPage = async (req, res) => {
  if (req.path === '/users') {
    const data = {
      users: await getAllUsers(),
    };

    res.saveJsonToCache(data);

    res.json(data);
  }

  if (req.path === '/catalog') {
    //const html = await app.renderToHTML(req, res, req.path, query);

    const html = '<h1>Catalog</h1>';

    res.saveHtmlToCache(html);

    res.send(html);
  }
};

export { renderPage };
