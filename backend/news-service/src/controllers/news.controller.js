const supabase = require('../db/supabase');

// Obtener noticias c/ paginación
const getNews = async (req, res) => {
    try {
        const { category, page = 1, limit = 10 } = req.query;
        const offset = (Number(page) - 1) * Number(limit);

        let query = supabase.from('news').select('*', { count: 'exact' });
        if (category) query = query.eq('category', category);

        const { data, count, error } = await query
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (error) throw error;
        res.status(200).json({ data, total: count, page: Number(page), limit: Number(limit) });
    } catch (err) {
        res.status(500).json({ error: 'Error al obtener noticias', details: err.message });
    }
};

const getNewsById = async (req, res) => {
    try {
        const { id } = req.params;
        // Incrementa la vista
        await supabase.rpc('increment_news_viewer', { news_id: id });
        
        const { data, error } = await supabase.from('news').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Noticia no encontrada' });
        
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const createNews = async (req, res) => {
    try {
        const { data, error } = await supabase.from('news').insert([{ 
            ...req.body, author_id: req.user.id 
        }]).select().single();
        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error creando noticia', details: err.message });
    }
};

const updateNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await supabase.from('news').update({
            ...req.body, updated_at: new Date().toISOString()
        }).eq('id', id).select().single();
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error actualizando noticia', details: err.message });
    }
};

const deleteNews = async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from('news').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Noticia eliminada' });
    } catch (err) {
        res.status(500).json({ error: 'Error eliminando noticia', details: err.message });
    }
};

// Toggle like
const toggleLike = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id; // Del verifyToken
        
        // Comprobar si ya existe el like
        const { data: existingLike } = await supabase.from('news_likes')
            .select('*').eq('news_id', id).eq('user_id', userId).single();

        if (existingLike) {
            // Quitar like
            await supabase.from('news_likes').delete().eq('id', existingLike.id);
            // Actualizar contador
            await supabase.rpc('decrement_news_like', { n_id: id });
            return res.status(200).json({ message: 'Like removido' });
        } else {
            // Dar like
            await supabase.from('news_likes').insert([{ news_id: id, user_id: userId }]);
            await supabase.rpc('increment_news_like', { n_id: id });
            return res.status(200).json({ message: 'Like añadido' });
        }
    } catch (err) {
        res.status(500).json({ error: 'Error con acción like', details: err.message });
    }
};

module.exports = { getNews, getNewsById, createNews, updateNews, deleteNews, toggleLike };
