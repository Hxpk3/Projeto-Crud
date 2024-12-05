const db = require('../models/db.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

function gerarToken(params = {}) {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET não está definido no arquivo .env');
    }

    return jwt.sign(
        params, 
        process.env.JWT_SECRET, 
        { expiresIn: 86400 }
    );
}

exports.registrar = (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const checkUserSql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(checkUserSql, [email], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ error: 'Erro no banco de dados' });
        }

        if (checkResults.length > 0) {
            return res.status(400).json({ error: 'Usuário já existe' });
        }

        bcrypt.hash(senha, 10, (hashErr, hashedSenha) => {
            if (hashErr) {
                return res.status(500).json({ error: 'Erro ao criar usuário' });
            }

            const insertSql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
            db.query(insertSql, [nome, email, hashedSenha], (insertErr, result) => {
                if (insertErr) {
                    return res.status(500).json({ error: 'Erro ao criar usuário' });
                }

                try {
                    const token = gerarToken({ 
                        id: result.insertId, 
                        email: email 
                    });

                    res.status(201).json({ 
                        id: result.insertId, 
                        nome, 
                        email,
                        token 
                    });
                } catch (tokenErr) {
                    console.error('Erro ao gerar token:', tokenErr);
                    return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
                }
            });
        });
    });
};

exports.login = (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error('Erro no banco de dados:', err);
            return res.status(500).json({ error: 'Erro interno do servidor' });
        }

        if (results.length === 0) {
            return res.status(400).json({ error: 'Usuário não encontrado' });
        }

        const usuario = results[0];

        bcrypt.compare(senha, usuario.senha, (compareErr, senhaCorreta) => {
            if (compareErr) {
                console.error('Erro ao comparar senhas:', compareErr);
                return res.status(500).json({ error: 'Erro ao validar senha' });
            }

            if (!senhaCorreta) {
                return res.status(400).json({ error: 'Senha incorreta' });
            }

            try {
                const token = gerarToken({ 
                    id: usuario.id, 
                    email: usuario.email 
                });

                res.json({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    token
                });
            } catch (tokenErr) {
                console.error('Erro ao gerar token:', tokenErr);
                return res.status(500).json({ error: 'Erro ao gerar token de autenticação' });
            }
        });
    });
};

exports.verificarToken = (token) => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET não está definido');
        }

        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        console.error('Erro na verificação do token:', err);
        return null;
    }
};
