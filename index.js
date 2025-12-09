import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const host = '0.0.0.0';
const porta = 3000;

var listaEquipes = [];
var listaJogadores = [];

const server = express();

server.use(session({
  secret: 'segredo123',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 30 //30 minutos
  }
}));

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

function verificarUsuarioLogado(requisicao, resposta, proximo) {
  if(requisicao.session?.dadosLogin?.logado){
    proximo();
  } else {
    resposta.redirect("/login");
  }
}

server.get("/", verificarUsuarioLogado,(req, res) => {
  let ultimoAcesso = req.cookies?.ultimoAcesso;
  const data = new Date();
  res.cookie("ultimoAcesso", data.toLocaleString());

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Campeonato LoL</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
  a.nav-link { font-size: 15px; }
</style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
  <div class="container-fluid">
    <a class="navbar-brand">Menu</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
      <span class="navbar-toggler-icon"></span>
    </button>

    <div class="collapse navbar-collapse" id="nav">
      <ul class="navbar-nav">

        <li class="nav-item">
          <a class="nav-link active" href="/">Início</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/cadastrarEquipe">Cadastro de Equipes</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/cadastrarJogador">Cadastro de Jogadores</a>
        </li>

        <li class="nav-item">
          <a class="nav-link" href="/logout">Sair</a>
        </li>

      </ul>
    </div>
  </div>

  <div class="container text-white">
    <p class="mt-2">Último acesso: ${ultimoAcesso || "Primeiro acesso"}</p>
  </div>
</nav>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
  `);
});

server.get("/cadastrarEquipe", verificarUsuarioLogado, (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Cadastrar Equipe</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
</style>
</head>
<body class="p-4">

<div class="card p-4 mx-auto" style="max-width: 600px;">
  <h2 class="text-center mb-3">Cadastro de Equipe</h2>

  <form method="POST" action="/cadastrarEquipe" class="row g-3">

    <div class="col-12">
      <label>Nome da Equipe</label>
      <input type="text" class="form-control" name="nome" required>
    </div>

    <div class="col-12">
      <label>Nome do Capitão</label>
      <input type="text" class="form-control" name="capitao" required>
    </div>

    <div class="col-12">
      <label>Telefone/WhatsApp</label>
      <input type="text" class="form-control" name="contato" required>
    </div>

    <div class="text-center">
      <button class="btn btn-primary">Salvar</button>
      <a href="/" class="btn btn-outline-secondary">Voltar</a>
    </div>

  </form>
</div>

</body>
</html>
  `);
});

server.post("/cadastrarEquipe", verificarUsuarioLogado, (req, res) => {
  if (req.body.nome && req.body.capitao && req.body.contato) {
    listaEquipes.push({
      nome: req.body.nome,
      capitao: req.body.capitao,
      contato: req.body.contato
    });
    res.redirect("/listarEquipes");
  } else {
    res.send("Todos os campos são obrigatórios!");
  }
});

server.get("/listarEquipes", verificarUsuarioLogado, (req, res) => {
  let tabela = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Equipes</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
</style>
</head>

<body class="p-4">
<h2 class="mb-3">Equipes Cadastradas</h2>

<a href="/" class="btn btn-outline-secondary btn-sm">Menu</a>
<a href="/cadastrarEquipe" class="btn btn-primary btn-sm">Nova Equipe</a>
<br><br>

<table class="table table-hover">
  <thead class="table-secondary">
    <tr>
      <th>Nome</th>
      <th>Capitão</th>
      <th>Contato</th>
    </tr>
  </thead>
  <tbody>
`;

  for (let i = 0; i < listaEquipes.length; i++) {
    tabela += `
    <tr>
      <td>${listaEquipes[i].nome}</td>
      <td>${listaEquipes[i].capitao}</td>
      <td>${listaEquipes[i].contato}</td>
    </tr>`;
  }

  tabela += `
  </tbody>
</table>
</body>
</html>
`;
  res.send(tabela);
});

server.get("/cadastrarJogador", verificarUsuarioLogado, (req, res) => {
  let opcoes = "";

  for (let i = 0; i < listaEquipes.length; i++) {
    opcoes += `<option value="${listaEquipes[i].nome}">${listaEquipes[i].nome}</option>`;
  }

  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Cadastrar Jogador</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
</style>
</head>

<body class="p-4">

<div class="card p-4 mx-auto" style="max-width: 600px;">
  <h2 class="text-center mb-3">Cadastro de Jogador</h2>

  <form method="POST" action="/cadastrarJogador" class="row g-3">

    <div class="col-12">
      <label>Nome</label>
      <input type="text" class="form-control" name="nome" required>
    </div>

    <div class="col-12">
      <label>Nickname</label>
      <input type="text" class="form-control" name="nick" required>
    </div>

    <div class="col-12">
      <label>Função</label>
      <select class="form-control" name="funcao" required>
        <option>top</option>
        <option>jungle</option>
        <option>mid</option>
        <option>atirador</option>
        <option>suporte</option>
      </select>
    </div>

    <div class="col-12">
      <label>Elo</label>
      <input type="text" class="form-control" name="elo" required>
    </div>

    <div class="col-12">
      <label>Gênero</label>
      <input type="text" class="form-control" name="genero" required>
    </div>

    <div class="col-12">
      <label>Equipe</label>
      <select class="form-control" name="equipe" required>${opcoes}</select>
    </div>

    <div class="text-center">
      <button class="btn btn-primary">Salvar</button>
      <a href="/" class="btn btn-outline-secondary">Voltar</a>
    </div>

  </form>
</div>

</body>
</html>
  `);
});


server.post("/cadastrarJogador", verificarUsuarioLogado, (req, res) => {
  var total = 0;

  for (let i = 0; i < listaJogadores.length; i++) {
    if (listaJogadores[i].equipe === req.body.equipe) {
      total++;
    }
  }

  if (total >= 5) {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
      <title>Equipe Completa</title>
    </head>
    <body class="p-4 bg-light">
      <div class="card p-4 mx-auto" style="max-width: 500px;">
        <h3 class="text-center">Equipe já possui 5 jogadores!</h3>
        <p class="text-center">A equipe <b>${req.body.equipe}</b> está completa.</p>
        <div class="text-center">
          <a href="/cadastrarJogador" class="btn btn-primary">Voltar</a>
          <a href="/" class="btn btn-outline-secondary">Menu</a>
        </div>
      </div>
    </body>
    </html>
    `);
    return;
  }

  if (req.body.nome && req.body.nick && req.body.funcao && req.body.elo && req.body.genero && req.body.equipe) {
    listaJogadores.push({
      nome: req.body.nome,
      nick: req.body.nick,
      funcao: req.body.funcao,
      elo: req.body.elo,
      genero: req.body.genero,
      equipe: req.body.equipe
    });
    res.redirect("/listarJogadores");
  } else {
    res.send("Todos os campos são obrigatórios!");
  }
});

server.get("/listarJogadores", verificarUsuarioLogado, (req, res) => {
  let lista = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Jogadores</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
</style>
</head>

<body class="p-4">
<h2 class="mb-3">Jogadores por Equipe</h2>

<a href="/" class="btn btn-outline-secondary btn-sm">Menu</a>
<a href="/cadastrarJogador" class="btn btn-primary btn-sm">Novo Jogador</a>
<br><br>
`;

  for (let i = 0; i < listaEquipes.length; i++) {
    lista += `<h4 class="mt-4">${listaEquipes[i].nome}</h4>
    <table class="table table-hover mt-2">
      <thead class="table-secondary">
        <tr>
          <th>Nome</th>
          <th>Nickname</th>
          <th>Função</th>
          <th>Elo</th>
          <th>Gênero</th>
        </tr>
      </thead>
      <tbody>
    `;

    for (let j = 0; j < listaJogadores.length; j++) {
      if (listaJogadores[j].equipe === listaEquipes[i].nome) {
        lista += `
        <tr>
          <td>${listaJogadores[j].nome}</td>
          <td>${listaJogadores[j].nick}</td>
          <td>${listaJogadores[j].funcao}</td>
          <td>${listaJogadores[j].elo}</td>
          <td>${listaJogadores[j].genero}</td>
        </tr>
        `;
      }
    }

    lista += `
      </tbody>
    </table>`;
  }

  lista += `
</body>
</html>
`;

  res.send(lista);
});

server.get("/login", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Login</title>
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
<style>
  body { background-color: #f8f9fa; }
</style>
</head>

<body class="p-5">

<div class="card p-4 mx-auto" style="max-width: 400px;">
  <h3 class="text-center mb-3">Login</h3>
  <form method="POST" action="/login" class="row g-3">
    <div>
      <label>Usuário</label>
      <input type="text" class="form-control" name="usuario">
    </div>

    <div>
      <label>Senha</label>
      <input type="password" class="form-control" name="senha">
    </div>

    <div class="text-center">
      <button class="btn btn-primary">Entrar</button>
    </div>
  </form>
</div>

</body>
</html>
  `);
});

server.post("/login", (req, res) => {
  if(req.body.usuario === "admin" && req.body.senha === "admin") {
    req.session.dadosLogin = { logado: true };
    res.redirect("/");
  } else {
    res.send("Login inválido.");
  }
});

server.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/login");
});

server.listen(porta, host, () => {
  console.log("Servidor rodando em porta " + porta);
});