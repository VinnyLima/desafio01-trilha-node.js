const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username } = request.headers;

  const userExist = users.find(user => user.username === username);

  if(!userExist){
   return response.json({
      message: `O Usuário ${username} não existe na base de dados `
    })
  }

  return next()
}

app.post('/users', (request, response) => {
  const {name, username } = request.body;  

  const userExist = users.find(user => user.username === username);

  if(userExist){
    return response.json({
    message: `Já existe um usuário na base de dados com esse username: ${username}`
    })
  }

  if(!name || !username){
    return response.json({
      message: 'nome ou userName não informados verifique por favor'
    })
  }

  const normalizeUser = {
    id: uuidv4(),
    name,
    username,
    todos:[]
  };

  users.push(normalizeUser);

  response.json(normalizeUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {username} = request.headers

    const userFind = users.find(user => user.username === username)

    const { todos } = userFind;

    return response.json({
      user: username,
      todos
    })
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {username} =request.headers;
  const {title,deadline } = request.body;

  const userFind = users.find(user => user.username === username)

  const normalizeTodo = {
    id: uuidv4(),
    title,
    done:false,
    deadline:new Date(deadline),
    created_at: new Date()
  }

  userFind.todos.push(normalizeTodo);

  return response.json(userFind);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;