const Usuario = require('../models/usuario');
const jwt = require('jsonwebtoken');

function gerarToken(params = {}) {
    return jwt.sign(params, process.env.JWT_SECRET, {
        expiresIn: 86400
    });
}

exports.registrar = (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    Usuario.findByEmail(email, (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (usuario) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        Usuario.criar(nome, email, senha, (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }

            const token = gerarToken({ id: result.insertId });
            res.status(201).json({ 
                id: result.insertId, 
                nome, 
                email, 
                token 
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

    Usuario.findByEmail(email, (err, usuario) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no servidor' });
        }

        if (!usuario) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        Usuario.verificarSenha(senha, usuario.senha, (err, senhaCorreta) => {
            if (err) {
                return res.status(500).json({ error: 'Erro no servidor' });
            }

            if (!senhaCorreta) {
                return res.status(400).json({ error: 'Senha incorreta' });
            }

            const token = gerarToken({ id: usuario.id });
            res.json({ 
                id: usuario.id, 
                nome: usuario.nome, 
                email: usuario.email, 
                token 
            });
        });
    });
};
