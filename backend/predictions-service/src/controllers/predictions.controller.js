const supabase = require('../db/supabase');

const getUserPredictions = async (req, res) => {
    try {
        const { event_id } = req.query;
        let query = supabase.from('predictions').select('*, fight:fight_id(fighter1_id, fighter2_id, result_method)').eq('user_id', req.user.id);
        
        if (event_id) {
            // Obtener predicciones de un evento específico filtrando las peleas
            const { data: fights } = await supabase.from('fights').select('id').eq('event_id', event_id);
            const fightIds = fights.map(f => f.id);
            if (fightIds.length > 0) query = query.in('fight_id', fightIds);
            else return res.status(200).json([]);
        }

        const { data, error } = await query;
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo predicciones', details: err.message });
    }
};

const makePrediction = async (req, res) => {
    try {
        const { fight_id, predicted_winner_id, predicted_method } = req.body;
        const user_id = req.user.id;

        // Comprobar si la pelea ya empezó (basado en la fecha del evento)
        const { data: fight } = await supabase.from('fights').select('event_id, result_method').eq('id', fight_id).single();
        const { data: event } = await supabase.from('events').select('status, event_date').eq('id', fight.event_id).single();
        
        const eventDate = event?.event_date ? new Date(event.event_date) : null;
        const alreadyStarted = eventDate && eventDate <= new Date();
        
        if (alreadyStarted && event.status === 'completed') {
            return res.status(400).json({ error: 'No se puede predecir un evento que ya terminó' });
        }

        const { data, error } = await supabase.from('predictions').upsert({
            user_id,
            fight_id,
            predicted_winner_id,
            predicted_method,
            updated_at: new Date().toISOString()
        }, { onConflict: 'user_id, fight_id' }).select().single();

        if (error) throw error;
        res.status(200).json({ message: 'Predicción guardada exitosamente', data });
    } catch (err) {
        res.status(500).json({ error: 'Error guardando predicción', details: err.message });
    }
};

const getGlobalRanking = async (req, res) => {
    try {
        // En supabase se requiere una view o un agrupado manual, haremos query a 'users' order by points
        const { data, error } = await supabase.from('users')
            .select('id, name')
            .limit(100);

        if (error) throw error;
        
        // Retornamos puntos en 0 y rank temporal para evitar que el frontend o backend fallen por falta de columnas
        const rankingData = (data || []).map((u, i) => ({ ...u, points: 0, rank: i + 1 }));
        
        res.status(200).json(rankingData);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo ranking global', details: err.message });
    }
};

module.exports = { getUserPredictions, makePrediction, getGlobalRanking };
