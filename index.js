import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';

const host = '0.0.0.0';
const porta = 3000;

var listarProdutos  = [];
var usuarioLogado = false;

const server = express();

server.use(session({
  secret: 'segredo123',
  resave: true,
  saveUninitialized: true,
  cookie: { 
    maxAge: 1000 * 60 * 30 // 30 minutos
  }
}));

server.use(express.urlencoded({ extended: true }));
server.use(cookieParser());

server.get("/", verificarUsuarioLogado,(requisicao, resposta) => {
  let ultimoAcesso = requisicao.cookies?.ultimoAcesso;

    const data = new Date();
    resposta.cookie("ultimoAcesso", data.toLocaleString());

  resposta.setHeader("Content-Type", "text/html; charset=UTF-8");

    //disponibiliza o menu
    resposta.write(`
<DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <title>Atividade 4</title>
    </head>
     <body>
            <nav class="navbar navbar-expand-lg bg-body-tertiary">
            <div class="container-fluid">
                <a class="navbar-brand" href="#">Menu</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav">
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/">Inicio</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link" href="/CadastrarProdutos">Cadastrar Produtos</a>
                    </li>
                    <li class="nav-item">
                    <a class="nav-link active" aria-current="page" href="/logout">Sair</a>
                    </li>
                </ul>
                </div>
            </div>
            <div class="container-fluid">
                <div class="d-flex">
                    <div class="p-2">
                      <p>ultimo acesso: ${ultimoAcesso || "Primeiro acesso"}</p>
                    </div>
                </div>
            </div>
            </nav>

    </body>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
</html>
`);
    
    resposta.end();
});
server.get("/CadastrarProdutos", verificarUsuarioLogado,(requisicao, resposta) => {
    resposta.send(`
      <!DOCTYPE html>
      <html lang="pt-br">
        <head>
          <meta charset="UTF-8">
          <title>Cadastrar Produtos</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>

        <body class="p-4">
          <div class="container d-flex justify-content-center">
            <div class="card p-4 shadow-sm" style="max-width: 700px; width: 100%;">
              <h2 class="text-center mb-4">Cadastrar Produtos</h2>

        <form method="POST" action="/CadastrarProdutos" class="row g-3"> 

           <div class="col-md-6">
                    <label class="form-label">Código de Barras</label>
                    <input type="text" class="form-control" name="codigo" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Descrição</label>
                    <input type="text" class="form-control" name="descricao" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Preço de Custo</label>
                    <input type="number" class="form-control" step="0.01" name="precoCusto" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Preço de Venda</label>
                    <input type="number" class="form-control" step="0.01" name="precoVenda" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Data de Validade</label>
                    <input type="date" class="form-control" name="validade" required>
                </div>

                <div class="col-md-6">
                    <label class="form-label">Quantidade em Estoque</label>
                    <input type="number" class="form-control" name="estoque" required>
                </div>

                <div class="col-md-12">
                    <label class="form-label">Fabricante</label>
                    <input type="text" class="form-control" name="fabricante" required>
                </div>

                <div class="col-12">
                    <button class="btn btn-success" type="submit">Cadastrar</button>
                    <a href="/" class="btn btn-secondary">Voltar</a>
                </div>

            </form>
        </div>
</body>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
</html>

`);     
});
server.post("/CadastrarProdutos", verificarUsuarioLogado, (requisicao, resposta) => {
    
    const codigo   = requisicao.body.codigo;
    const descricao      = requisicao.body.descricao;
    const precoCusto     = requisicao.body.precoCusto;
    const precoVenda     = requisicao.body.precoVenda;
    const validade       = requisicao.body.validade;
    const estoque        = requisicao.body.estoque;
    const fabricante     = requisicao.body.fabricante;
  
    if (codigo && descricao && precoCusto && precoVenda && validade && estoque && fabricante) {

        listarProdutos.push({
            codigo,
            descricao,
            precoCusto,
            precoVenda,
            validade,
            estoque,
            fabricante
        });

        resposta.redirect("/listarProdutos");
        return;
    }

    let conteudo = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Cadastrar Produto</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
    </head>

    <body class="p-4">
        <div class="container d-flex justify-content-center">
            <div class="card p-4 shadow-sm" style="max-width: 700px; width: 100%;">
                <h2 class="text-center mb-4">Cadastrar Produtos</h2>

                <form method="POST" action="/CadastrarProdutos" class="row g-3">

                    <!-- Código de Barras -->
                    <div class="col-md-6">
                        <label for="codigoBarras" class="form-label">Código de Barras</label>
                        <input type="text" class="form-control" id="codigoBarras" name="codigo"
                               value="${codigo || ""}" placeholder="7891234567890">
                        ${!codigo? `<div class="text-danger">Código de barras é obrigatório!</div>` : ""}
                    </div>

                    <!-- Descrição -->
                    <div class="col-md-6">
                        <label for="descricao" class="form-label">Descrição do Produto</label>
                        <input type="text" class="form-control" id="descricao" name="descricao"
                               value="${descricao || ""}" placeholder="Ex: Sabonete, feijão, refrigerante...">
                        ${!descricao ? `<div class="text-danger">Descrição é obrigatória!</div>` : ""}
                    </div>

                    <!-- Preço de Custo -->
                    <div class="col-md-6">
                        <label for="precoCusto" class="form-label">Preço de Custo</label>
                        <input type="number" step="0.01" class="form-control" id="precoCusto" name="precoCusto"
                               value="${precoCusto || ""}" placeholder="Ex: 2.50">
                        ${!precoCusto ? `<div class="text-danger">Preço de custo é obrigatório!</div>` : ""}
                    </div>

                    <!-- Preço de Venda -->
                    <div class="col-md-6">
                        <label for="precoVenda" class="form-label">Preço de Venda</label>
                        <input type="number" step="0.01" class="form-control" id="precoVenda" name="precoVenda"
                               value="${precoVenda || ""}" placeholder="Ex: 4.99">
                        ${!precoVenda ? `<div class="text-danger">Preço de venda é obrigatório!</div>` : ""}
                    </div>

                    <!-- Validade -->
                    <div class="col-md-6">
                        <label for="validade" class="form-label">Data de Validade</label>
                        <input type="date" class="form-control" id="validade" name="validade"
                               value="${validade || ""}">
                        ${!validade ? `<div class="text-danger">Data de validade é obrigatória!</div>` : ""}
                    </div>

                    <!-- Estoque -->
                    <div class="col-md-6">
                        <label for="estoque" class="form-label">Quantidade em Estoque</label>
                        <input type="number" class="form-control" id="estoque" name="estoque"
                               value="${estoque || ""}" placeholder="Ex: 50">
                        ${!estoque ? `<div class="text-danger">Estoque é obrigatório!</div>` : ""}
                    </div>

                    <!-- Fabricante -->
                    <div class="col-md-12">
                        <label for="fabricante" class="form-label">Nome do Fabricante</label>
                        <input type="text" class="form-control" id="fabricante" name="fabricante"
                               value="${fabricante || ""}" placeholder="Ex: Nestlé, Sadia...">
                        ${!fabricante ? `<div class="text-danger">Fabricante é obrigatório!</div>` : ""}
                    </div>

                    <!-- Botões -->
                    <div class="col-12">
                        <button class="btn btn-success" type="submit">Cadastrar</button>
                        <a class="btn btn-secondary" href="/">Voltar</a>
                    </div>

                </form>
            </div>
        </div>
    </body>
    </html>
    `;

    resposta.send(conteudo);
});


server.get("/listarProdutos", verificarUsuarioLogado, (requisicao, resposta) => { 
    let tabelaProdutos = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet">
        <title>Lista de Produtos</title>
    </head>

    <body class="p-4">
        <div class="container">
            <h1 class="mb-4">Lista de Produtos</h1>

            <table class="table table-striped table-bordered align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Código de Barras</th>
                        <th>Descrição</th>
                        <th>Preço de Custo</th>
                        <th>Preço de Venda</th>
                        <th>Validade</th>
                        <th>Estoque</th>
                        <th>Fabricante</th>
                    </tr>
                </thead>

                <tbody>
    `;

    for (let i = 0; i < listarProdutos.length; i++) {
        tabelaProdutos += `
            <tr>
                <td>${listarProdutos[i].codigo}</td>
                <td>${listarProdutos[i].descricao}</td>
                <td>R$ ${Number(listarProdutos[i].precoCusto).toFixed(2)}</td>
                <td>R$ ${Number(listarProdutos[i].precoVenda).toFixed(2)}</td>
                <td>${listarProdutos[i].validade}</td>
                <td>${listarProdutos[i].estoque}</td>
                <td>${listarProdutos[i].fabricante}</td>
            </tr>
        `;
    }

    tabelaProdutos += `
                </tbody>
            </table>

            <a class="btn btn-secondary" href="/CadastrarProdutos">Voltar</a>
        </div>

        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    `;

    resposta.send(tabelaProdutos);
});

server.get("/login", (requisicao, resposta) => {
    resposta.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              min-height: 100vh;
              /* fundo total */
              background: linear-gradient(135deg, #1a1a1a, #4b5320);
              color: white;
            }

            header {
              background-color: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(5px);
            }

            .card {
              background-color: rgba(0, 0, 0, 0.85);
              border: none;
            }
          </style>
        </head>

      <body>
      <!-- Cabeçalho -->
        <header class="text-white text-center py-3">
          <h1>Área de Login</h1>
        </header>

  <!-- Corpo -->
  <section class="d-flex justify-content-center align-items-center py-5">
    <div class="container">
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card p-5 text-center rounded-4 shadow-lg">

            <div class="mb-md-5 mt-md-4 pb-5">
              <h2 class="fw-bold mb-2 text-uppercase">Login</h2>
              <p class="text-white-50 mb-5">Digite seu e-mail e senha para entrar</p>

              <form action="/login" method="POST">
                <div class="form-outline form-white mb-4">
                  <input id="typeEmailX" name="usuario" class="form-control form-control-lg" placeholder="seu@email.com" required />
                  <label class="form-label" for="typeEmailX">Email</label>
                </div>

                <div class="form-outline form-white mb-4">
                  <input type="password" id="typePasswordX" name="senha" class="form-control form-control-lg" placeholder="********" required />
                  <label class="form-label" for="typePasswordX">Senha</label>
                </div>

                <p class="small mb-5 pb-lg-2">
                  <a class="text-white-50" href="#!">Esqueceu a senha?</a>
                </p>

                <button class="btn btn-outline-light btn-lg px-5" type="submit">Entrar</button>
              </form>

            
            </div>

            <div>
              <p class="mb-0">
                Não tem uma conta? <a href="#!" class="text-white-50 fw-bold">Cadastre-se</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Scripts Bootstrap -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

    `);
});

server.post("/login", (requisicao, resposta) => {
  const { usuario, senha } = requisicao.body;

  if(usuario === "admin" && senha === "admin") {

    requisicao.session.dadosLogin = {
                                        logado: true,
                                        nomeUsuario: "Administrador"
                                    };
  
    resposta.redirect("/");
  } else {
    resposta.write(`
          <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Login</title>
          <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
          <style>
            body {
              min-height: 100vh;
              /* fundo total */
              background: linear-gradient(135deg, #1a1a1a, #4b5320);
              color: white;
            }

            header {
              background-color: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(5px);
            }

            .card {
              background-color: rgba(0, 0, 0, 0.85);
              border: none;
            }
          </style>
        </head>

      <body>
      <!-- Cabeçalho -->
        <header class="text-white text-center py-3">
          <h1>Área de Login</h1>
        </header>

  <!-- Corpo -->
  <section class="d-flex justify-content-center align-items-center py-5">
    <div class="container">
      <div class="row d-flex justify-content-center align-items-center">
        <div class="col-12 col-md-8 col-lg-6 col-xl-5">
          <div class="card p-5 text-center rounded-4 shadow-lg">

            <div class="mb-md-5 mt-md-4 pb-5">
              <h2 class="fw-bold mb-2 text-uppercase">Login</h2>
              <p class="text-white-50 mb-5">Digite seu e-mail e senha para entrar</p>

              <form action="/login" method="POST">
                <div class="form-outline form-white mb-4">
                  <input type="email" id="typeEmailX" name="usuario" class="form-control form-control-lg" placeholder="seu@email.com" required />
                  <label class="form-label" for="typeEmailX">Email</label>
                </div>

                <div class="form-outline form-white mb-4">
                  <input type="password" id="typePasswordX" name="senha" class="form-control form-control-lg" placeholder="********" required />
                  <label class="form-label" for="typePasswordX">Senha</label>
                </div>

                <p class="small mb-5 pb-lg-2">
                  <a class="text-white-50" href="#!">Esqueceu a senha?</a>
                </p>

                <button class="btn btn-outline-light btn-lg px-5" type="submit">Entrar</button>
              </form>
              <div class="col-12 mt-2">
                  <p class="text-danger">Usuário ou senha inválidos!</p>
                </div>
            
            </div>

            <div>
              <p class="mb-0">
                Não tem uma conta? <a href="#!" class="text-white-50 fw-bold">Cadastre-se</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Scripts Bootstrap -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>

      `)
  }
});

server.get("/logout", (requisicao, resposta) => {
    requisicao.session.destroy();
    resposta.redirect("/login");
});

function verificarUsuarioLogado(requisicao, resposta, proximo) {
  if(requisicao.session?.dadosLogin?.logado){
    proximo();
  } else {
    resposta.redirect("/login");
  }
}

server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`)
});