const db = require('../models/db.js');

exports.cadastrarParticipante = (req, res) => {
    const { nome, evento_id } = req.body;

    const checkEventSql = 'SELECT * FROM eventos WHERE id = ?';
    db.query(checkEventSql, [evento_id], (checkErr, checkResults) => {
        if (checkErr) {
            return res.status(500).json({ error: 'Erro no banco de dados', details: checkErr });
        }
        
        if (checkResults.length === 0) {
            return res.status(404).json({ error: 'Evento não encontrado' });
        }

        const sql = 'INSERT INTO participantes (nome, evento_id) VALUES (?, ?)';
        db.query(sql, [nome, evento_id], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Erro interno do servidor', details: err });
            }
            res.status(201).json({ id: result.insertId, nome, evento_id });
        });
    });
};

exports.listarParticipantes = (req, res) => {
    const { evento_id } = req.query;
    const sql = `
        SELECT p.id, p.nome, p.evento_id, e.nome as evento_nome 
        FROM participantes p
        LEFT JOIN eventos e ON p.evento_id = e.id
        ${evento_id ? 'WHERE p.evento_id = ?' : ''}
    `;
    
    const params = evento_id ? [evento_id] : [];
    
    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
};

exports.editarParticipante = (req, res) => {
    const { id } = req.params;
    const { nome, evento_id } = req.body;

    if (!nome || !evento_id) {
        return res.status(400).json({ 
            error: 'Dados incompletos', 
            details: { nome, evento_id } 
        });
    }

    const sql = 'UPDATE participantes SET nome = ?, evento_id = ? WHERE id = ?';
    db.query(sql, [nome, evento_id, id], (err, result) => {
        if (err) {
            return res.status(500).json({ 
                error: 'Erro interno do servidor', 
                details: err 
            });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        res.status(200).json({ id, nome, evento_id });
    });
};

exports.deletarParticipante = (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM participantes WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) return res.status(500).send(err);
        if (result.affectedRows === 0) return res.status(404).send('Participante não encontrado.');
        res.status(204).send();
    });
};

exports.buscarParticipante = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM participantes WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Erro no banco de dados', details: err });
        }
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Participante não encontrado' });
        }
        
        res.json(results[0]);
    });
};

function loadEventOptions() {
    $.get('/api/eventos', function(events) {
        const eventSelect = $('#eventoId');
        eventSelect.empty();
        events.forEach(event => {
            eventSelect.append(`<option value="${event.id}">${event.nome}</option>`);
        });
    });
}
