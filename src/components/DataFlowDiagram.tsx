
import React from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const nodes: Node[] = [
  // Frontend Layer
  {
    id: 'user',
    type: 'input',
    position: { x: 50, y: 50 },
    data: { label: '👤 Utilizator' },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', borderRadius: '10px' }
  },
  {
    id: 'auth-ui',
    position: { x: 250, y: 50 },
    data: { label: '🔐 Autentificare\n(Auth.tsx)' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', borderRadius: '10px' }
  },
  {
    id: 'dashboard',
    position: { x: 50, y: 200 },
    data: { label: '📊 Dashboard\n(Dashboard.tsx)' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '10px' }
  },
  {
    id: 'transactions',
    position: { x: 300, y: 200 },
    data: { label: '💳 Tranzacții\n(Transactions.tsx)' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '10px' }
  },
  {
    id: 'reports',
    position: { x: 550, y: 200 },
    data: { label: '📈 Rapoarte\n(Reports.tsx)' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '10px' }
  },

  // Context Layer
  {
    id: 'auth-context',
    position: { x: 150, y: 350 },
    data: { label: '🔑 AuthContext\n(Gestionare stare autentificare)' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', borderRadius: '10px' }
  },
  {
    id: 'transactions-context',
    position: { x: 400, y: 350 },
    data: { label: '💰 TransactionsContext\n(Gestionare tranzacții locale)' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', borderRadius: '10px' }
  },
  {
    id: 'family-context',
    position: { x: 650, y: 350 },
    data: { label: '👨‍👩‍👧‍👦 FamilyContext\n(Gestionare familie)' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', borderRadius: '10px' }
  },

  // Backend Layer
  {
    id: 'supabase-client',
    position: { x: 300, y: 500 },
    data: { label: '🔌 Supabase Client\n(API Communication)' },
    style: { background: '#e0f2f1', border: '2px solid #00796b', borderRadius: '10px' }
  },

  // Database Layer
  {
    id: 'database',
    type: 'output',
    position: { x: 100, y: 650 },
    data: { label: '🗄️ Baza de Date\n(PostgreSQL)' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '10px' }
  },
  {
    id: 'auth-db',
    position: { x: 300, y: 650 },
    data: { label: '👥 Profiles\n(Utilizatori)' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '10px' }
  },
  {
    id: 'transactions-db',
    position: { x: 500, y: 650 },
    data: { label: '💸 Transactions\n(Tranzacții)' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '10px' }
  },
  {
    id: 'family-db',
    position: { x: 700, y: 650 },
    data: { label: '🏠 Family Groups\n(Grupuri familiale)' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '10px' }
  },

  // External Services
  {
    id: 'charts',
    position: { x: 800, y: 50 },
    data: { label: '📊 Recharts\n(Vizualizare date)' },
    style: { background: '#f1f8e9', border: '2px solid #689f38', borderRadius: '10px' }
  }
];

const edges: Edge[] = [
  // User interactions
  { id: 'e1', source: 'user', target: 'auth-ui', label: 'Login/Register', type: 'smoothstep' },
  { id: 'e2', source: 'user', target: 'dashboard', label: 'Vizualizare', type: 'smoothstep' },
  { id: 'e3', source: 'user', target: 'transactions', label: 'CRUD Tranzacții', type: 'smoothstep' },
  { id: 'e4', source: 'user', target: 'reports', label: 'Rapoarte', type: 'smoothstep' },

  // UI to Context
  { id: 'e5', source: 'auth-ui', target: 'auth-context', label: 'Stare Auth', type: 'smoothstep' },
  { id: 'e6', source: 'dashboard', target: 'transactions-context', label: 'Date Dashboard', type: 'smoothstep' },
  { id: 'e7', source: 'transactions', target: 'transactions-context', label: 'Gestionare Tranzacții', type: 'smoothstep' },
  { id: 'e8', source: 'dashboard', target: 'family-context', label: 'Info Familie', type: 'smoothstep' },

  // Context to Supabase
  { id: 'e9', source: 'auth-context', target: 'supabase-client', label: 'Auth API', type: 'smoothstep' },
  { id: 'e10', source: 'transactions-context', target: 'supabase-client', label: 'Transactions API', type: 'smoothstep' },
  { id: 'e11', source: 'family-context', target: 'supabase-client', label: 'Family API', type: 'smoothstep' },

  // Supabase to Database
  { id: 'e12', source: 'supabase-client', target: 'database', label: 'SQL Queries', type: 'smoothstep' },
  { id: 'e13', source: 'database', target: 'auth-db', label: '', type: 'smoothstep' },
  { id: 'e14', source: 'database', target: 'transactions-db', label: '', type: 'smoothstep' },
  { id: 'e15', source: 'database', target: 'family-db', label: '', type: 'smoothstep' },

  // Charts integration
  { id: 'e16', source: 'reports', target: 'charts', label: 'Randare Grafice', type: 'smoothstep' },
  { id: 'e17', source: 'transactions-context', target: 'charts', label: 'Date pentru Grafice', type: 'smoothstep' },

  // Data flow back to UI
  { id: 'e18', source: 'transactions-context', target: 'dashboard', label: 'Date Actualizate', type: 'smoothstep', animated: true },
  { id: 'e19', source: 'auth-context', target: 'dashboard', label: 'Status Utilizator', type: 'smoothstep', animated: true },
];

const DataFlowDiagram = () => {
  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-gray-900">Fluxul de Date - Aplicația de Management Financiar</h1>
        <p className="text-gray-600 mt-2">Diagrama interactivă a arhitecturii și fluxului de date</p>
      </div>
      
      <div className="w-full h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
        >
          <Background />
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              return '#eee';
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              return '#fff';
            }}
          />
        </ReactFlow>
      </div>
      
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">Legenda:</h3>
        <div className="space-y-1 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-600 rounded"></div>
            <span>Utilizator & Input</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-600 rounded"></div>
            <span>Componente UI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-100 border-2 border-orange-600 rounded"></div>
            <span>Context Providers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-teal-100 border-2 border-teal-600 rounded"></div>
            <span>API Layer</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-100 border-2 border-pink-600 rounded"></div>
            <span>Baza de Date</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlowDiagram;
