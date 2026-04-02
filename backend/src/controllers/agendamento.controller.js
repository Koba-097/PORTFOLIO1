const { getDb } = require("../config/database");

exports.criar = async (req, res) => {
    try {
        const db = getDb();

        const { nome, telefone, data, hora } = req.body;
        const owner_id = req.user?.id || 1;

        if (!nome || !telefone || !data || !hora) {
            return res.status(400).json({ error: "Preencha todos os campos" });
        }

        // 🔒 bloquear horário duplicado
        const existente = await db.get(
            `SELECT * FROM agendamentos
             WHERE data = ? AND hora = ? AND owner_id = ?`,
            [data, hora, owner_id]
        );

        if (existente) {
            return res.status(400).json({ error: "Horário já ocupado" });
        }

        await db.run(
            `INSERT INTO agendamentos (nome, telefone, data, hora, owner_id)
             VALUES (?, ?, ?, ?, ?)`,
            [nome, telefone, data, hora, owner_id]
        );

        res.json({ message: "Agendamento criado com sucesso" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao criar agendamento" });
    }
};

exports.listar = async (req, res) => {
    const db = getDb();
    const { data } = req.query;
    const owner_id = req.user?.id || 1;

    const agendamentos = await db.all(
        `SELECT hora FROM agendamentos WHERE data = ? AND owner_id = ?`,
        [data, owner_id]
    );

    res.json(agendamentos);
};