const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());

// isso Permite solicitações de qualquer origem
app.use(cors());

const port = 3002;

// criando collection/tabela do banco catalogo
const Jogo = mongoose.model('Jogo',{
    title : String,
    description : String,
    image_url : String,
    trailer_url : String,
    ano_Lancamento :String,
    plataforma : String
});

// método para consultar dados de algum jogo
app .get('/', async(req, res) =>{
    const jogos = await Jogo.find();
    return res.send(jogos);
}),

app.get('/:_id', async (req, res) => {
    const _id = req.params._id; // Obtém o título diretamente do caminho da URL
    const jogos = await Jogo.find({ _id: _id }); // Busca os jogos pelo título
    return res.send(jogos);
  }),

  app.get('/titulo/:title', async (req, res) => {
    const title = req.params.title; // Obtém o título diretamente do caminho da URL
    const jogos = await Jogo.find({ title: title }); // Busca os jogos pelo título
    return res.send(jogos);
  }),

  app.get('/ano/:ano_Lancamento', async (req, res) => {
    const ano_Lancamento = req.params.ano_Lancamento; // Obtém o título diretamente do caminho da URL
    const jogos = await Jogo.find({ ano_Lancamento: ano_Lancamento }); // Busca os jogos pelo título
    return res.send(jogos);
  }),

//método utilizado para Adicionar novos dados de jogos(uso interno)
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
