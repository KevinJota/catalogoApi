const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Cria e inicializa o aplicativo Express
const app = express();
app.use(express.json());
app.use(cors());

// Define a porta
const port = 3002;

// Definindo o esquema de dados para os jogos
const Jogo = mongoose.model('Jogo', {
    title: String,
    description: String,
    image_url: String,
    trailer_url: String,
    ano_Lancamento: String,
    plataforma: String
});

// Definindo o esquema de dados para os usuários
const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String, // hashed password
    favoriteGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogo' }]
});

// Rotas para jogos

// Método para consultar dados de todos os jogos
app.get('/jogos', async (req, res) => {
    const jogos = await Jogo.find();
    return res.send(jogos);
});

// Método para consultar um jogo pelo seu ID
app.get('/jogos/:_id', async (req, res) => {
    const _id = req.params._id;
    const jogo = await Jogo.findById(_id);
    return res.send(jogo);
});

// Método de consulta múltiplas de jogos por títulos
app.get('/jogos/titulo/:title', async (req, res) => {
    const keyword = req.params.title;
    const regex = new RegExp(keyword, "i");
    const jogos = await Jogo.find({ title: regex });
    return res.send(jogos);
});

// Método de consulta múltiplas de jogos por Ano de lançamento
app.get('/jogos/ano/:ano_Lancamento', async (req, res) => {
    const ano_Lancamento = req.params.ano_Lancamento;
    const jogos = await Jogo.find({ ano_Lancamento });
    return res.send(jogos);
});

// Método utilizado para adicionar novos dados de jogos (uso interno)
app.post('/jogos', async (req, res) => {
    const jogo = new Jogo({
        title: req.body.title,
        description: req.body.description,
        image_url: req.body.image_url,
        trailer_url: req.body.trailer_url,
        ano_Lancamento: req.body.ano_Lancamento,
        plataforma: req.body.plataforma
    });
    await jogo.save();
    return res.send(jogo);
});

// Excluir dados da collection por meio da ID (uso interno)
app.delete('/jogos/:id', async (req, res) => {
    const jogo = await Jogo.findByIdAndDelete(req.params.id);
    return res.send(jogo);
});

// Método PUT para alterar dados de algum jogo (uso interno)
app.put('/jogos/:id', async (req, res) => {
    const jogo = await Jogo.findByIdAndUpdate(req.params.id, {
        title: req.body.title,
        description: req.body.description,
        image_url: req.body.image_url,
        trailer_url: req.body.trailer_url,
        ano_Lancamento: req.body.ano_Lancamento,
        plataforma: req.body.plataforma
    }, {
        new: true
    });
    res.send(jogo);
});

// Rotas para usuários

// Registro de usuário
app.post('/usuarios/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        username,
        email,
        password: hashedPassword,
        favoriteGames: []
    });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Login de usuário
app.post('/usuarios/login', async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, 'seu_segredo_jwt', { expiresIn: '1h' });

    res.json({ token, user });
});

// Rota para obter dados do usuário pelo ID
app.get('/usuarios/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Obter jogos favoritos de um usuário
app.get('/usuarios/:id/favorite', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).populate('favoriteGames');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.favoriteGames);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Adicionar um jogo à lista de favoritos de um usuário
app.post('/usuarios/:id/favorite', async (req, res) => {
    try {
        const userId = req.params.id;
        const { gameId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!user.favoriteGames.includes(gameId)) {
            user.favoriteGames.push(gameId);
            await user.save();
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remover um jogo da lista de favoritos de um usuário
app.delete('/usuarios/:id/favorite/:gameId', async (req, res) => {
    try {
        const userId = req.params.id;
        const gameId = req.params.gameId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        user.favoriteGames = user.favoriteGames.filter(id => id.toString() !== gameId);
        await user.save();
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// URL de conexão com o Banco do MongoDB
app.listen(port, () => {
    mongoose.connect('mongodb+srv://guzmanalaca:wHPMbWOHuxx1RIac@catalog.q59852s.mongodb.net/')
        .then(() => console.log(`API rodando na porta ${port}`))
        .catch(err => console.error('Erro ao conectar ao MongoDB', err));
});

