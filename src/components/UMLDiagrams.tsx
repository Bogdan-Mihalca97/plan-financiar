
import React, { useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Use Case Diagram Nodes and Edges
const useCaseNodes: Node[] = [
  // Actors
  {
    id: 'user-actor',
    type: 'input',
    position: { x: 50, y: 200 },
    data: { label: '👤 Utilizator' },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', borderRadius: '50px', width: '100px', height: '60px' }
  },
  {
    id: 'admin-actor',
    type: 'input',
    position: { x: 50, y: 400 },
    data: { label: '👨‍💼 Admin Familie' },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', borderRadius: '50px', width: '120px', height: '60px' }
  },
  
  // Use Cases - Authentication
  {
    id: 'login',
    position: { x: 300, y: 50 },
    data: { label: 'Autentificare' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', borderRadius: '50px', width: '140px', height: '60px' }
  },
  {
    id: 'register',
    position: { x: 300, y: 130 },
    data: { label: 'Înregistrare' },
    style: { background: '#f3e5f5', border: '2px solid #7b1fa2', borderRadius: '50px', width: '140px', height: '60px' }
  },
  
  // Use Cases - Transactions
  {
    id: 'add-transaction',
    position: { x: 300, y: 210 },
    data: { label: 'Adăugare\nTranzacție' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50px', width: '140px', height: '60px' }
  },
  {
    id: 'edit-transaction',
    position: { x: 300, y: 290 },
    data: { label: 'Editare\nTranzacție' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50px', width: '140px', height: '60px' }
  },
  {
    id: 'view-transactions',
    position: { x: 300, y: 370 },
    data: { label: 'Vizualizare\nTranzacții' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', borderRadius: '50px', width: '140px', height: '60px' }
  },
  
  // Use Cases - Budget & Goals
  {
    id: 'manage-budget',
    position: { x: 500, y: 210 },
    data: { label: 'Gestionare\nBuget' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', borderRadius: '50px', width: '140px', height: '60px' }
  },
  {
    id: 'set-goals',
    position: { x: 500, y: 290 },
    data: { label: 'Stabilire\nObective' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', borderRadius: '50px', width: '140px', height: '60px' }
  },
  
  // Use Cases - Family
  {
    id: 'create-family',
    position: { x: 300, y: 450 },
    data: { label: 'Creare\nGrup Familie' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '50px', width: '140px', height: '60px' }
  },
  {
    id: 'invite-member',
    position: { x: 300, y: 530 },
    data: { label: 'Invitare\nMembru' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', borderRadius: '50px', width: '140px', height: '60px' }
  },
  
  // Use Cases - Reports
  {
    id: 'generate-reports',
    position: { x: 500, y: 370 },
    data: { label: 'Generare\nRapoarte' },
    style: { background: '#e0f2f1', border: '2px solid #00796b', borderRadius: '50px', width: '140px', height: '60px' }
  }
];

const useCaseEdges: Edge[] = [
  // User connections
  { id: 'e1', source: 'user-actor', target: 'login', type: 'straight' },
  { id: 'e2', source: 'user-actor', target: 'register', type: 'straight' },
  { id: 'e3', source: 'user-actor', target: 'add-transaction', type: 'straight' },
  { id: 'e4', source: 'user-actor', target: 'edit-transaction', type: 'straight' },
  { id: 'e5', source: 'user-actor', target: 'view-transactions', type: 'straight' },
  { id: 'e6', source: 'user-actor', target: 'manage-budget', type: 'straight' },
  { id: 'e7', source: 'user-actor', target: 'set-goals', type: 'straight' },
  { id: 'e8', source: 'user-actor', target: 'generate-reports', type: 'straight' },
  
  // Admin connections
  { id: 'e9', source: 'admin-actor', target: 'create-family', type: 'straight' },
  { id: 'e10', source: 'admin-actor', target: 'invite-member', type: 'straight' },
];

// Class Diagram Nodes
const classNodes: Node[] = [
  // User Class
  {
    id: 'user-class',
    position: { x: 50, y: 50 },
    data: { 
      label: (
        <div className="text-left text-xs">
          <div className="font-bold border-b pb-1 mb-1">User</div>
          <div className="text-gray-600 border-b pb-1 mb-1">
            - id: UUID<br/>
            - firstName: string<br/>
            - lastName: string<br/>
            - email: string
          </div>
          <div className="text-gray-800">
            + login()<br/>
            + logout()<br/>
            + updateProfile()
          </div>
        </div>
      )
    },
    style: { background: '#ffffff', border: '2px solid #333', width: '180px', height: '140px' }
  },
  
  // Transaction Class
  {
    id: 'transaction-class',
    position: { x: 300, y: 50 },
    data: { 
      label: (
        <div className="text-left text-xs">
          <div className="font-bold border-b pb-1 mb-1">Transaction</div>
          <div className="text-gray-600 border-b pb-1 mb-1">
            - id: UUID<br/>
            - amount: number<br/>
            - description: string<br/>
            - category: string<br/>
            - type: TransactionType<br/>
            - date: Date
          </div>
          <div className="text-gray-800">
            + create()<br/>
            + update()<br/>
            + delete()
          </div>
        </div>
      )
    },
    style: { background: '#ffffff', border: '2px solid #333', width: '200px', height: '160px' }
  },
  
  // Budget Class
  {
    id: 'budget-class',
    position: { x: 550, y: 50 },
    data: { 
      label: (
        <div className="text-left text-xs">
          <div className="font-bold border-b pb-1 mb-1">Budget</div>
          <div className="text-gray-600 border-b pb-1 mb-1">
            - id: UUID<br/>
            - category: string<br/>
            - limitAmount: number<br/>
            - period: Period<br/>
            - userId: UUID
          </div>
          <div className="text-gray-800">
            + checkLimit()<br/>
            + updateLimit()<br/>
            + getSpending()
          </div>
        </div>
      )
    },
    style: { background: '#ffffff', border: '2px solid #333', width: '180px', height: '140px' }
  },
  
  // Family Group Class
  {
    id: 'family-class',
    position: { x: 50, y: 250 },
    data: { 
      label: (
        <div className="text-left text-xs">
          <div className="font-bold border-b pb-1 mb-1">FamilyGroup</div>
          <div className="text-gray-600 border-b pb-1 mb-1">
            - id: UUID<br/>
            - name: string<br/>
            - createdBy: UUID<br/>
            - members: User[]
          </div>
          <div className="text-gray-800">
            + addMember()<br/>
            + removeMember()<br/>
            + inviteMember()
          </div>
        </div>
      )
    },
    style: { background: '#ffffff', border: '2px solid #333', width: '180px', height: '140px' }
  },
  
  // Goal Class
  {
    id: 'goal-class',
    position: { x: 300, y: 250 },
    data: { 
      label: (
        <div className="text-left text-xs">
          <div className="font-bold border-b pb-1 mb-1">Goal</div>
          <div className="text-gray-600 border-b pb-1 mb-1">
            - id: UUID<br/>
            - title: string<br/>
            - targetAmount: number<br/>
            - currentAmount: number<br/>
            - deadline: Date
          </div>
          <div className="text-gray-800">
            + updateProgress()<br/>
            + checkDeadline()<br/>
            + markCompleted()
          </div>
        </div>
      )
    },
    style: { background: '#ffffff', border: '2px solid #333', width: '180px', height: '140px' }
  }
];

const classEdges: Edge[] = [
  // Relationships
  { id: 'user-transaction', source: 'user-class', target: 'transaction-class', label: '1..*', type: 'straight' },
  { id: 'user-budget', source: 'user-class', target: 'budget-class', label: '1..*', type: 'straight' },
  { id: 'user-family', source: 'user-class', target: 'family-class', label: 'n..n', type: 'straight' },
  { id: 'user-goal', source: 'user-class', target: 'goal-class', label: '1..*', type: 'straight' },
];

// Sequence Diagram Nodes
const sequenceNodes: Node[] = [
  // Actors/Objects
  {
    id: 'user-seq',
    position: { x: 50, y: 50 },
    data: { label: 'Utilizator' },
    style: { background: '#e1f5fe', border: '2px solid #0277bd', width: '100px', height: '50px' }
  },
  {
    id: 'ui-seq',
    position: { x: 200, y: 50 },
    data: { label: 'UI Component' },
    style: { background: '#e8f5e8', border: '2px solid #388e3c', width: '120px', height: '50px' }
  },
  {
    id: 'context-seq',
    position: { x: 370, y: 50 },
    data: { label: 'Context' },
    style: { background: '#fff3e0', border: '2px solid #f57c00', width: '100px', height: '50px' }
  },
  {
    id: 'supabase-seq',
    position: { x: 520, y: 50 },
    data: { label: 'Supabase' },
    style: { background: '#fce4ec', border: '2px solid #c2185b', width: '100px', height: '50px' }
  },
  
  // Messages/Actions
  {
    id: 'action1',
    position: { x: 125, y: 150 },
    data: { label: '1. Completează formular' },
    style: { background: 'transparent', border: 'none', fontSize: '12px' }
  },
  {
    id: 'action2',
    position: { x: 285, y: 200 },
    data: { label: '2. Validare date' },
    style: { background: 'transparent', border: 'none', fontSize: '12px' }
  },
  {
    id: 'action3',
    position: { x: 445, y: 250 },
    data: { label: '3. Salvare în DB' },
    style: { background: 'transparent', border: 'none', fontSize: '12px' }
  },
  {
    id: 'action4',
    position: { x: 445, y: 300 },
    data: { label: '4. Confirmare' },
    style: { background: 'transparent', border: 'none', fontSize: '12px' }
  },
  {
    id: 'action5',
    position: { x: 285, y: 350 },
    data: { label: '5. Actualizare UI' },
    style: { background: 'transparent', border: 'none', fontSize: '12px' }
  },
];

const sequenceEdges: Edge[] = [
  // Lifelines (vertical lines)
  { id: 'life1', source: 'user-seq', target: 'action1', type: 'straight', style: { strokeDasharray: '5,5' } },
  { id: 'life2', source: 'ui-seq', target: 'action2', type: 'straight', style: { strokeDasharray: '5,5' } },
  
  // Messages (horizontal arrows)
  { id: 'msg1', source: 'action1', target: 'action2', type: 'straight', animated: true, label: 'submit' },
  { id: 'msg2', source: 'action2', target: 'action3', type: 'straight', animated: true, label: 'create' },
  { id: 'msg3', source: 'action3', target: 'action4', type: 'straight', animated: true, label: 'success' },
  { id: 'msg4', source: 'action4', target: 'action5', type: 'straight', animated: true, label: 'refresh' },
];

const UMLDiagrams = () => {
  const [selectedDiagram, setSelectedDiagram] = useState('usecase');

  const getDiagramData = () => {
    switch (selectedDiagram) {
      case 'usecase':
        return { nodes: useCaseNodes, edges: useCaseEdges };
      case 'class':
        return { nodes: classNodes, edges: classEdges };
      case 'sequence':
        return { nodes: sequenceNodes, edges: sequenceEdges };
      default:
        return { nodes: useCaseNodes, edges: useCaseEdges };
    }
  };

  const { nodes, edges } = getDiagramData();

  return (
    <div className="w-full h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm border-b">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Diagrame UML - Aplicația de Management Financiar</h1>
        
        <Tabs value={selectedDiagram} onValueChange={setSelectedDiagram} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="usecase">Cazuri de Utilizare</TabsTrigger>
            <TabsTrigger value="class">Clase</TabsTrigger>
            <TabsTrigger value="sequence">Secvențe</TabsTrigger>
          </TabsList>
        </Tabs>
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
      
      <div className="absolute bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg max-w-md">
        <h3 className="font-semibold mb-2">
          {selectedDiagram === 'usecase' && 'Diagrama Cazurilor de Utilizare'}
          {selectedDiagram === 'class' && 'Diagrama Claselor'}
          {selectedDiagram === 'sequence' && 'Diagrama de Secvențe'}
        </h3>
        <div className="text-sm text-gray-600">
          {selectedDiagram === 'usecase' && 'Ilustrează interacțiunile dintre utilizatori și sistemul de management financiar.'}
          {selectedDiagram === 'class' && 'Prezintă structura claselor și relațiile dintre ele în aplicație.'}
          {selectedDiagram === 'sequence' && 'Arată fluxul de mesaje pentru procesul de adăugare a unei tranzacții.'}
        </div>
      </div>
    </div>
  );
};

export default UMLDiagrams;
