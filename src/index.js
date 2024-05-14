// Importa os módulos necessários
const express = require('express'); // Importa o módulo Express.js para criar o servidor
const mongoose = require('mongoose'); // Importa o módulo Mongoose para interagir com o MongoDB
const cors = require('cors'); // Importa o módulo CORS para habilitar o acesso a recursos de diferentes origens

// Cria e inicializa o aplicativo Express
const app = express();
app.use(express.json());

// isso Permite solicitações de qualquer origem
app.use(cors());

// aqui é definido a porta
const port = 3002;

// criando collection/tabela do banco catalogo
const Jogo = mongoose.model('Jogo',{
    title : String,
    description : String,
    image_url : String,
    trailer_url : String,
    ano_Lancamento :String,
    plataforma : String
}); // isso aq Define o esquema de dados para os jogos

// método para consultar dados de todos os jogos
app .get('/', async(req, res) =>{
    const jogos = await Jogo.find();
    return res.send(jogos);
}),

// método para consultar um jogo pelo seu ID
app.get('/:_id', async (req, res) => {
    const _id = req.params._id; // Obtém o título diretamente do caminho da URL
    const jogos = await Jogo.find({ _id: _id }); // Busca os jogos pelo título
    return res.send(jogos);
  }),

// método de consulta multiplas de jogos por titulos, ele irá retornar jogos
// que estiverem o titulo mais de acordo com o parametro recebido
  app.get('/titulo/:title', async (req, res) => {
    console.log("Buscando por jogo:", req.params.title);
    const keyword = req.params.title;
    const regex   = new RegExp(keyword, "i");
    const jogos   = await Jogo.find({ title: regex });
    return res.send(jogos);
  });

// método de consulta multiplas de jogos por Ano de lançamento dos jogos
  app.get('/ano/:ano_Lancamento', async (req, res) => {
    const ano_Lancamento = req.params.ano_Lancamento; // Obtém o título diretamente do caminho da URL
    const jogos = await Jogo.find({ ano_Lancamento: ano_Lancamento }); // Busca os jogos pelo título
    return res.send(jogos);
  }),

// método utilizado para Adicionar novos dados de jogos(uso interno)
app.post('/', async(req, res) =>{
    const jogo = new Jogo({
        title: req.body.title,
        description : req.body.description,
        image_url : req.body.image_url,
        trailer_url : req.body.trailer_url,
        ano_Lancamento : req.body.ano_Lancamento,
        plataforma : req.body.plataforma
    })
    await jogo.save();
    return res.send(jogo);
}),

// auto explicativo: exclui dados da collection por meio da ID(uso interno)
app.delete('/:id' , async(req,res) =>{
     const jogos = await Jogo.findByIdAndDelete(req.params.id);     
     return res.send(jogos);
}),

// método put é utilizado para alterar dados de algum jogo, tendo que receber como parametro a ID do jog para alterar(uso interno)
app.put('/:id', async(req, res)=>{
    const jogo = await Jogo.findByIdAndUpdate(req.params.id,{
        title : req.body.title,
        description : req.body.description,
        image_url : req.body.image_url,
        trailer_url : req.body.trailer_url,
        ano_Lancamento : req.body.ano_Lancamento,
        plataforma : req.body.plataforma
    },
    {
        new : true
    })
})

// URL de conexao com o Banco do mongoDB
app.listen(port, () => {
    mongoose.connect ('mongodb+srv://admin:RNvgWLM3GcFsIOgV@catalogo.actzwfx.mongodb.net/')
})

console.log(`API rodando na porta ${port}`);
