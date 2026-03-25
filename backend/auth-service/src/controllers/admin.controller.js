const supabase = require('../db/supabase');

const getUsers = async (req, res) => {
    try {
        const { data, error } = await supabase.from('users').select('id, email, name, role, status, created_at').order('created_at', { ascending: false });
        if (error) throw error;
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ error: 'Error obteniendo usuarios', details: err.message });
    }
};

const changeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { error } = await supabase.from('users').update({ status }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const changeRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;
        const { error } = await supabase.from('users').update({ role }).eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Rol actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Dependiendo de restricciones (FKs) esto puede fallar. Solo un soft-delete o borrado real si no hay FK conflicts
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        res.status(200).json({ message: 'Usuario eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error', details: err.message });
    }
};

module.exports = { getUsers, changeStatus, changeRole, deleteUser };
