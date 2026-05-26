import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Initialize Supabase Client securely on the backend
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://iyzjzihmnuknukkiystb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5emp6aWhtbnVra2l5c3RiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3NDM3OTAsImV4cCI6MjA5NTMxOTc5MH0.bSEyHXD3ahCgg48jULm6mNCWsZqDU9H9O1Ws4bCQLHAI';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log(`[Supabase] Inicializado para o projeto: ${SUPABASE_URL}`);

// ==========================================
// API ENDPOINTS
// ==========================================

// --- Equipamentos ---
app.get('/api/equipment', async (req, res) => {
  try {
    const { data, error } = await supabase.from('equipment').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[API] Erro ao buscar equipamentos:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/equipment', async (req, res) => {
  try {
    const { data, error } = await supabase.from('equipment').upsert(req.body);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao salvar equipamento:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/equipment/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('equipment').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao excluir equipamento:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Logs / Histórico ---
app.get('/api/logs', async (req, res) => {
  try {
    const { data, error } = await supabase.from('logs').select('*');
    if (error) throw error;
    const sortedData = (data || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sortedData);
  } catch (error) {
    console.error('[API] Erro ao buscar logs:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/logs', async (req, res) => {
  try {
    const { data, error } = await supabase.from('logs').upsert(req.body);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao salvar log:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/logs/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('logs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao excluir log:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Pessoas ---
app.get('/api/people', async (req, res) => {
  try {
    const { data, error } = await supabase.from('people').select('*');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('[API] Erro ao buscar pessoas:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/people', async (req, res) => {
  try {
    const { data, error } = await supabase.from('people').upsert(req.body);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao salvar pessoa:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/people/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('people').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao excluir pessoa:', error);
    res.status(500).json({ error: error.message });
  }
});

// --- Configurações / Senhas ---
app.get('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').select('*').eq('key', 'passwords').single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(data || { key: 'passwords', value: { sharedPassword: 'producao2026', adminPassword: 'admin2026' } });
  } catch (error) {
    console.error('[API] Erro ao buscar configurações:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/settings', async (req, res) => {
  try {
    const { data, error } = await supabase.from('settings').upsert(req.body);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('[API] Erro ao salvar configurações:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// SERVIR ARQUIVOS ESTÁTICOS
// ==========================================

const distPath = path.join(__dirname, 'dist');

// Serve static assets on root and sub-base path
app.use('/audiovisual-equipment-manager', express.static(distPath));
app.use(express.static(distPath));

// Spa Routing Fallback
app.get(/.*/, (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint não encontrado.' });
  }
  
  // Return compiled index.html
  res.sendFile(path.join(distPath, 'index.html'));
});

// Launch server
app.listen(PORT, () => {
  console.log(`[Servidor] Rodando com sucesso na porta ${PORT}`);
});
