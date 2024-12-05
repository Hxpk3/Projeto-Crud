const db = require('../models/db.js');

exports.cadastrarEvento = (req, res) => {
    const { nome, data, local, descricao } = req.body;

    if (!nome || !data || !local) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const sql = 'INSERT INTO eventos (nome, data, local, descricao) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [nome, data, local, descricao], (err, result) => {
        if (err) {
            console.error('Erro ao cadastrar evento:', err);
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        res.status(201).json({ 
            id: result.insertId, 
            nome, 
            data, 
            local, 
            descricao 
        });
    });
};

exports.listarEventos = (req, res) => {
    const sql = 'SELECT * FROM eventos ORDER BY data';
    
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao listar eventos:', err);
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        res.json(results);
    });
};

exports.buscarEvento = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM eventos WHERE id = ?';
    
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar evento:', err);
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        res.json(results[0]);
    });
};

exports.editarEvento = (req, res) => {
    const { id } = req.params;
    const { nome, data, local, descricao } = req.body;

    if (!nome || !data || !local) {
        return res.status(400).json({ error: 'Dados incompletos' });
    }

    const sql = 'UPDATE eventos SET nome = ?, data = ?, local = ?, descricao = ? WHERE id = ?';
    
    db.query(sql, [nome, data, local, descricao, id], (err, result) => {
        if (err) {
            console.error('Erro ao editar evento:', err);
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        res.json({ id, nome, data, local, descricao });
    });
};

exports.deletarEvento = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM eventos WHERE id = ?';
    
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Erro ao deletar evento:', err);
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }
        
        res.status(204).send();
    });
};
