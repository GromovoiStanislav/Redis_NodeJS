import fetch from 'node-fetch';

class JphApi {
  constructor() {}

  async fetchComments() {
    const response = await fetch(
      'https://jsonplaceholder.typicode.com/comments'
    );
    return response.json();
  }

  async fetchPosts() {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    return response.json();
  }

  async fetchUsers() {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    return response.json();
  }
}

export default new JphApi();
