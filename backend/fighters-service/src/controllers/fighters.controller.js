const supabase = require('../db/supabase');

const getFighters = async (req, res) => {
    try {
        const { page = 1, limit = 20, weight_class, search } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase.from('fighters').select('*', { count: 'exact' });

        if (weight_class) query = query.eq('weight_class', weight_class);
        if (search) query = query.ilike('name', `%${search}%`);

        const { data, count, error } = await query
            .range(offset, offset + Number(limit) - 1)
            .order('name', { ascending: true });

        if (error) throw error;

        res.status(200).json({ data, total: count, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo peleadores', details: err.message });
    }
};

const getFighterById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fighters').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Peleador no encontrado' });
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const createFighter = async (req, res) => {
    try {
        const { data, error } = await supabase.from('fighters').insert([{
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error creando peleador', details: err.message });
    }
};

const updateFighter = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fighters').update({
            ...req.body,
            updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando peleador', details: err.message });
    }
};

const deleteFighter = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('fighters').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Peleador eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error eliminando peleador', details: err.message });
    }
};

module.exports = { getFighters, getFighterById, createFighter, updateFighter, deleteFighter };
