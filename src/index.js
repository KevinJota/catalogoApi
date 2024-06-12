require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3002;
const jwtSecret = process.env.JWT_SECRET || 'default_secret';
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://guzmanalaca:wHPMbWOHuxx1RIac@catalog.q59852s.mongodb.net/';

const Jogo = mongoose.model('Jogo', {
    title: String,
    description: String,
    image_url: String,
    trailer_url: String,
    ano_Lancamento: String,
    plataforma: String
});

const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String,
    favoriteGames: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Jogo' }]
});

app.get('/jogos', async (req, res) => {
    const jogos = await Jogo.find();
    res.send(jogos);
});

app.get('/jogos/:_id', async (req, res) => {
    const _id = req.params._id;
    const jogos = await Jogo.find({ _id });
    res.send(jogos);
});

app.get('/jogos/titulo/:title', async (req, res) => {
    const keyword = req.params.title;
    const regex = new RegExp(keyword, "i");
    const jogos = await Jogo.find({ title: regex });
    res.send(jogos);
});

app.get('/jogos/ano/:ano_Lancamento', async (req, res) => {
    const ano_Lancamento = req.params.ano_Lancamento;
    const jogos = await Jogo.find({ ano_Lancamento });
    res.send(jogos);
});

app.post('/jogos', async (req, res) => {
    const jogo = new Jogo(req.body);
    await jogo.save();
    res.send(jogo);
});

app.delete('/jogos/:id', async (req, res) => {
    const jogos = await Jogo.findByIdAndDelete(req.params.id);
    res.send(jogos);
});

app.put('/jogos/:id', async (req, res) => {
    const jogo = await Jogo.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.send(jogo);
});

app.post('/usuarios/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword, favoriteGames: [] });

    try {
        const newUser = await user.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.post('/usuarios/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, jwtSecret, { expiresIn: '1h' });
    res.json({ token, user });
});

app.get('/usuarios', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

app.get('/usuarios/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });

    try {
        const verified = jwt.verify(token, jwtSecret);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

app.listen(port, () => {
    mongoose.connect(mongoUri).then(() => {
        console.log(`API rodando na porta ${port}`);
    }).catch(err => {
        console.error('Erro ao conectar ao MongoDB', err);
    });
});
