// Um desenvolvedor tentou criar um projeto que consome a base de dados de filme do TMDB para criar um organizador de filmes, mas desistiu 
// pois considerou o seu código inviável. Você consegue usar typescript para organizar esse código e a partir daí aprimorar o que foi feito?

// A ideia dessa atividade é criar um aplicativo que: 
//    - Busca filmes
//    - Apresenta uma lista com os resultados pesquisados
//    - Permite a criação de listas de filmes e a posterior adição de filmes nela

// Todas as requisições necessárias para as atividades acima já estão prontas, mas a implementação delas ficou pela metade (não vou dar tudo de graça).
// Atenção para o listener do botão login-button que devolve o sessionID do usuário
// É necessário fazer um cadastro no https://www.themoviedb.org/ e seguir a documentação do site para entender como gera uma API key https://developers.themoviedb.org/3/getting-started/introduction

var apiKey = 'f629adc21918bde3204670ed6a49ef9e';
//let apiKey;
let requestToken: string;
let username: string;
let password: string;
let sessionId: string;
let listId = '7101979';

let loginButton = document.getElementById('login-button') as HTMLInputElement;
let searchButton = document.getElementById('search-button') as HTMLInputElement;
let searchContainer = document.getElementById('search-container')!;

loginButton.addEventListener('click', async () => {
    await criarRequestToken();
    await logar();
    await criarSessao();
})

searchButton.addEventListener('click', async () => {
    let lista = document.getElementById("lista");
    if (lista) {
        lista.outerHTML = "";
    }
    let query = (document.getElementById('search') as HTMLInputElement).value;
    let listaDeFilmes = await procurarFilme(query);
    let ul = document.createElement('ul');
    ul.id = "lista"
    for (const item of listaDeFilmes.results) {
        let li = document.createElement('li');
        li.appendChild(document.createTextNode(item.original_title))
        ul.appendChild(li)
    }
    console.log(listaDeFilmes);
    searchContainer.appendChild(ul);
})

function preencherSenha() {
    password = (document.getElementById('senha') as HTMLInputElement).value;
    validateLoginButton();
}

function preencherLogin() {
    username = (document.getElementById('login') as HTMLInputElement).value;
    validateLoginButton();
}

function preencherApi() {
    apiKey = (document.getElementById('api-key') as HTMLInputElement).value;
    validateLoginButton();
}

function validateLoginButton() {
    if (password && username && apiKey) {
        loginButton.disabled = false;
    } else {
        loginButton.disabled = true;
    }
}

async function request (uri: string, method: "POST" | "GET", body?: any) {
    const response = await fetch(`https://api.themoviedb.org${uri}`, {
        method: method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: body && JSON.stringify(body)
      });
      return await response.json();
}

async function get (uri: string) {
    return await request(uri, "GET")
}

async function post (uri: string, body?: any) {
    return await request(uri, "POST", body)
}

async function procurarFilme(query:string) {
    query = encodeURI(query)
    console.log(query)

    return await get(`/3/search/movie?api_key=${apiKey}&query=${query}`)
}

async function adicionarFilme(filmeId:number) {
    let result = await get(`/3/movie/${filmeId}?api_key=${apiKey}&language=en-US`)
    console.log(result);
}

async function criarRequestToken() {
    let result = await get(`/3/authentication/token/new?api_key=${apiKey}`)
    requestToken = String(result.request_token)
}

async function logar() {
    await post(
        `/3/authentication/token/validate_with_login?api_key=${apiKey}`,
        {
            username: `${username}`,
            password: `${password}`,
            request_token: `${requestToken}`
        }
    )
}

async function criarSessao() {
    let result = await get(`/3/authentication/session/new?api_key=${apiKey}&request_token=${requestToken}`)
    sessionId = result.session_id;
}

async function criarLista(nomeDaLista:string, descricao:string) {
    let result = await post(
        `/3/list?api_key=${apiKey}&session_id=${sessionId}`,
        {
            name: nomeDaLista,
            description: descricao,
            language: "pt-br"
        }
    )
    console.log(result);
}

async function adicionarFilmeNaLista(filmeId:number, listaId:number) {
    let result = await post(
        `/3/list/${listaId}/add_item?api_key=${apiKey}&session_id=${sessionId}`,
        {
            media_id: filmeId
        }
    )
    console.log(result);
}

async function pegarLista() {
    let result = await get(`/3/list/${listId}?api_key=${apiKey}`)
    console.log(result);
}

{/* <div style="display: flex;">
  <div style="display: flex; width: 300px; height: 100px; justify-content: space-between; flex-direction: column;">
      <input id="login" placeholder="Login" onchange="preencherLogin(event)">
      <input id="senha" placeholder="Senha" type="password" onchange="preencherSenha(event)">
      <input id="api-key" placeholder="Api Key" onchange="preencherApi()">
      <button id="login-button" disabled>Login</button>
  </div>
  <div id="search-container" style="margin-left: 20px">
      <input id="search" placeholder="Escreva...">
      <button id="search-button">Pesquisar Filme</button>
  </div>
</div>*/}