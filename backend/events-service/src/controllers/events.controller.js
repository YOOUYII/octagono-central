const supabase = require('../db/supabase');

// ─── EVENTOS ───────────────────────────────────────────────────────────────────
const getEvents = async (req, res) => {
    try {
        const { status, page = 1, limit = 20 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase.from('events').select('*', { count: 'exact' });
        if (status) query = query.eq('status', status);

        const { data, count, error } = await query
            .range(offset, offset + Number(limit) - 1)
            .order('event_date', { ascending: false });

        if (error) throw error;
        res.status(200).json({ data, total: count, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo eventos', details: err.message });
    }
};

const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        // Trae el evento con sus peleas y los peleadores involucrados
        const { data: event, error: evError } = await supabase.from('events').select('*').eq('id', id).single();
        if (evError || !event) return res.status(404).json({ error: 'Evento no encontrado' });

        const { data: fights, error: fError } = await supabase.from('fights')
            .select(`*, fighter1:fighter1_id(*), fighter2:fighter2_id(*), winner:winner_id(*)`)
            .eq('event_id', id)
            .order('card_order', { ascending: true });

        if (fError) throw fError;
        res.status(200).json({ ...event, fights });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const createEvent = async (req, res) => {
    try {
        const { data, error } = await supabase.from('events').insert([{
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error creando evento', details: err.message });
    }
};

const updateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('events').update({
            ...req.body,
            updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando evento', details: err.message });
    }
};

const deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('events').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Evento eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error eliminando evento', details: err.message });
    }
};

// ─── PELEAS ────────────────────────────────────────────────────────────────────
const getFightsByEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fights')
            .select(`*, fighter1:fighter1_id(*), fighter2:fighter2_id(*), winner:winner_id(*)`)
            .eq('event_id', id)
            .order('card_order', { ascending: true });
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const addFightToEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fights').insert([{
            ...req.body,
            event_id: id,
            created_at: new Date().toISOString()
        }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error añadiendo pelea', details: err.message });
    }
};

const updateFight = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fights').update(req.body).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando pelea', details: err.message });
    }
};

const deleteFight = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('fights').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Pelea eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

// ─── ESTADÍSTICAS ──────────────────────────────────────────────────────────────
const getStatsByFight = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fight_stats')
            .select(`*, fighter:fighter_id(id, name, image_url)`)
            .eq('fight_id', id);
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error cargando estadísticas', details: err.message });
    }
};

const createStats = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('fight_stats').insert([{ ...req.body, fight_id: id }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error creando estadísticas', details: err.message });
    }
};

const updateStats = async (req, res) => {
    try {
        const { id, fighterId } = req.params;
        const { data, error } = await supabase.from('fight_stats').update(req.body).eq('fight_id', id).eq('fighter_id', fighterId).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando estadísticas', details: err.message });
    }
};

module.exports = {
    getEvents, getEventById, createEvent, updateEvent, deleteEvent,
    getFightsByEvent, addFightToEvent, updateFight, deleteFight,
    getStatsByFight, createStats, updateStats
};
