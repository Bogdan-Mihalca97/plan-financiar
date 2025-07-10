
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
    style: { 
      background: '#e3f2fd', 
      border: '2px solid #1976d2', 
      borderRadius: '50px', 
      width: '120px', 
      height: '70px',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'admin-actor',
    type: 'input',
    position: { x: 50, y: 400 },
    data: { label: '👨‍💼 Admin Familie' },
    style: { 
      background: '#e3f2fd', 
      border: '2px solid #1976d2', 
      borderRadius: '50px', 
      width: '140px', 
      height: '70px',
      fontSize: '14px',
      fontWeight: 'bold'
    }
  },
  
  // Use Cases - Authentication
  {
    id: 'login',
    position: { x: 300, y: 50 },
    data: { label: 'Autentificare' },
    style: { 
      background: '#f3e5f5', 
      border: '2px solid #7b1fa2', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  {
    id: 'register',
    position: { x: 300, y: 150 },
    data: { label: 'Înregistrare' },
    style: { 
      background: '#f3e5f5', 
      border: '2px solid #7b1fa2', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  
  // Use Cases - Transactions
  {
    id: 'add-transaction',
    position: { x: 300, y: 250 },
    data: { label: 'Adăugare\nTranzacție' },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #388e3c', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  {
    id: 'edit-transaction',
    position: { x: 300, y: 350 },
    data: { label: 'Editare\nTranzacție' },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #388e3c', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  {
    id: 'view-transactions',
    position: { x: 300, y: 450 },
    data: { label: 'Vizualizare\nTranzacții' },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #388e3c', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  
  // Use Cases - Budget & Goals
  {
    id: 'manage-budget',
    position: { x: 520, y: 250 },
    data: { label: 'Gestionare\nBuget' },
    style: { 
      background: '#fff3e0', 
      border: '2px solid #f57c00', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  {
    id: 'set-goals',
    position: { x: 520, y: 350 },
    data: { label: 'Stabilire\nObective' },
    style: { 
      background: '#fff3e0', 
      border: '2px solid #f57c00', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  
  // Use Cases - Family
  {
    id: 'create-family',
    position: { x: 300, y: 550 },
    data: { label: 'Creare\nGrup Familie' },
    style: { 
      background: '#fce4ec', 
      border: '2px solid #c2185b', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  {
    id: 'invite-member',
    position: { x: 300, y: 650 },
    data: { label: 'Invitare\nMembru' },
    style: { 
      background: '#fce4ec', 
      border: '2px solid #c2185b', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  },
  
  // Use Cases - Reports
  {
    id: 'generate-reports',
    position: { x: 520, y: 450 },
    data: { label: 'Generare\nRapoarte' },
    style: { 
      background: '#e0f2f1', 
      border: '2px solid #00796b', 
      borderRadius: '50px', 
      width: '160px', 
      height: '70px',
      fontSize: '13px',
      fontWeight: '500'
    }
  }
];

const useCaseEdges: Edge[] = [
  // User connections
  { id: 'e1', source: 'user-actor', target: 'login', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e2', source: 'user-actor', target: 'register', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e3', source: 'user-actor', target: 'add-transaction', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e4', source: 'user-actor', target: 'edit-transaction', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e5', source: 'user-actor', target: 'view-transactions', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e6', source: 'user-actor', target: 'manage-budget', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e7', source: 'user-actor', target: 'set-goals', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e8', source: 'user-actor', target: 'generate-reports', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  
  // Admin connections
  { id: 'e9', source: 'admin-actor', target: 'create-family', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
  { id: 'e10', source: 'admin-actor', target: 'invite-member', type: 'straight', style: { stroke: '#666', strokeWidth: 2 } },
];

// Class Diagram Nodes
const classNodes: Node[] = [
  // User Class
  {
    id: 'user-class',
    position: { x: 50, y: 50 },
    data: { 
      label: (
        <div className="text-left text-sm p-2">
          <div className="font-bold border-b-2 border-gray-800 pb-2 mb-2 text-center">User</div>
          <div className="text-gray-700 border-b pb-2 mb-2">
            <div>- id: UUID</div>
            <div>- firstName: string</div>
            <div>- lastName: string</div>
            <div>- email: string</div>
          </div>
          <div className="text-gray-900">
            <div>+ login()</div>
            <div>+ logout()</div>
            <div>+ updateProfile()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #333', 
      width: '220px', 
      height: '180px',
      borderRadius: '8px'
    }
  },
  
  // Transaction Class
  {
    id: 'transaction-class',
    position: { x: 320, y: 50 },
    data: { 
      label: (
        <div className="text-left text-sm p-2">
          <div className="font-bold border-b-2 border-gray-800 pb-2 mb-2 text-center">Transaction</div>
          <div className="text-gray-700 border-b pb-2 mb-2">
            <div>- id: UUID</div>
            <div>- amount: number</div>
            <div>- description: string</div>
            <div>- category: string</div>
            <div>- type: TransactionType</div>
            <div>- date: Date</div>
          </div>
          <div className="text-gray-900">
            <div>+ create()</div>
            <div>+ update()</div>
            <div>+ delete()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #333', 
      width: '240px', 
      height: '200px',
      borderRadius: '8px'
    }
  },
  
  // Budget Class
  {
    id: 'budget-class',
    position: { x: 620, y: 50 },
    data: { 
      label: (
        <div className="text-left text-sm p-2">
          <div className="font-bold border-b-2 border-gray-800 pb-2 mb-2 text-center">Budget</div>
          <div className="text-gray-700 border-b pb-2 mb-2">
            <div>- id: UUID</div>
            <div>- category: string</div>
            <div>- limitAmount: number</div>
            <div>- period: Period</div>
            <div>- userId: UUID</div>
          </div>
          <div className="text-gray-900">
            <div>+ checkLimit()</div>
            <div>+ updateLimit()</div>
            <div>+ getSpending()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #333', 
      width: '220px', 
      height: '180px',
      borderRadius: '8px'
    }
  },
  
  // Family Group Class
  {
    id: 'family-class',
    position: { x: 50, y: 280 },
    data: { 
      label: (
        <div className="text-left text-sm p-2">
          <div className="font-bold border-b-2 border-gray-800 pb-2 mb-2 text-center">FamilyGroup</div>
          <div className="text-gray-700 border-b pb-2 mb-2">
            <div>- id: UUID</div>
            <div>- name: string</div>
            <div>- createdBy: UUID</div>
            <div>- members: User[]</div>
          </div>
          <div className="text-gray-900">
            <div>+ addMember()</div>
            <div>+ removeMember()</div>
            <div>+ inviteMember()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #333', 
      width: '220px', 
      height: '180px',
      borderRadius: '8px'
    }
  },
  
  // Goal Class
  {
    id: 'goal-class',
    position: { x: 320, y: 280 },
    data: { 
      label: (
        <div className="text-left text-sm p-2">
          <div className="font-bold border-b-2 border-gray-800 pb-2 mb-2 text-center">Goal</div>
          <div className="text-gray-700 border-b pb-2 mb-2">
            <div>- id: UUID</div>
            <div>- title: string</div>
            <div>- targetAmount: number</div>
            <div>- currentAmount: number</div>
            <div>- deadline: Date</div>
          </div>
          <div className="text-gray-900">
            <div>+ updateProgress()</div>
            <div>+ checkDeadline()</div>
            <div>+ markCompleted()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #333', 
      width: '220px', 
      height: '180px',
      borderRadius: '8px'
    }
  }
];

const classEdges: Edge[] = [
  // Relationships
  { 
    id: 'user-transaction', 
    source: 'user-class', 
    target: 'transaction-class', 
    label: '1..*', 
    type: 'straight',
    style: { stroke: '#333', strokeWidth: 2 },
    labelStyle: { fill: '#333', fontWeight: 'bold' }
  },
  { 
    id: 'user-budget', 
    source: 'user-class', 
    target: 'budget-class', 
    label: '1..*', 
    type: 'straight',
    style: { stroke: '#333', strokeWidth: 2 },
    labelStyle: { fill: '#333', fontWeight: 'bold' }
  },
  { 
    id: 'user-family', 
    source: 'user-class', 
    target: 'family-class', 
    label: 'n..n', 
    type: 'straight',
    style: { stroke: '#333', strokeWidth: 2 },
    labelStyle: { fill: '#333', fontWeight: 'bold' }
  },
  { 
    id: 'user-goal', 
    source: 'user-class', 
    target: 'goal-class', 
    label: '1..*', 
    type: 'straight',
    style: { stroke: '#333', strokeWidth: 2 },
    labelStyle: { fill: '#333', fontWeight: 'bold' }
  },
];

// Sequence Diagram Nodes
const sequenceNodes: Node[] = [
  // Actors/Objects - Vertical headers
  {
    id: 'user-seq',
    position: { x: 100, y: 50 },
    data: { label: 'Utilizator' },
    style: { 
      background: '#e3f2fd', 
      border: '2px solid #1976d2', 
      width: '120px', 
      height: '60px',
      borderRadius: '8px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'ui-seq',
    position: { x: 280, y: 50 },
    data: { label: 'UI Component' },
    style: { 
      background: '#e8f5e8', 
      border: '2px solid #388e3c', 
      width: '120px', 
      height: '60px',
      borderRadius: '8px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'context-seq',
    position: { x: 460, y: 50 },
    data: { label: 'Context' },
    style: { 
      background: '#fff3e0', 
      border: '2px solid #f57c00', 
      width: '120px', 
      height: '60px',
      borderRadius: '8px',
      fontWeight: 'bold'
    }
  },
  {
    id: 'supabase-seq',
    position: { x: 640, y: 50 },
    data: { label: 'Supabase' },
    style: { 
      background: '#fce4ec', 
      border: '2px solid #c2185b', 
      width: '120px', 
      height: '60px',
      borderRadius: '8px',
      fontWeight: 'bold'
    }
  },
  
  // Lifelines - Vertical dashed lines
  {
    id: 'lifeline-user',
    position: { x: 158, y: 140 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '2px dashed #666', 
      width: '4px', 
      height: '400px',
      borderRadius: '0px'
    }
  },
  {
    id: 'lifeline-ui',
    position: { x: 338, y: 140 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '2px dashed #666', 
      width: '4px', 
      height: '400px',
      borderRadius: '0px'
    }
  },
  {
    id: 'lifeline-context',
    position: { x: 518, y: 140 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '2px dashed #666', 
      width: '4px', 
      height: '400px',
      borderRadius: '0px'
    }
  },
  {
    id: 'lifeline-supabase',
    position: { x: 698, y: 140 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '2px dashed #666', 
      width: '4px', 
      height: '400px',
      borderRadius: '0px'
    }
  },
  
  // Messages/Actions
  {
    id: 'action1',
    position: { x: 80, y: 180 },
    data: { label: '1. Completează formular' },
    style: { 
      background: '#f5f5f5', 
      border: '1px solid #999', 
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px'
    }
  },
  {
    id: 'action2',
    position: { x: 250, y: 240 },
    data: { label: '2. Validare date' },
    style: { 
      background: '#f5f5f5', 
      border: '1px solid #999', 
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px'
    }
  },
  {
    id: 'action3',
    position: { x: 450, y: 300 },
    data: { label: '3. Salvare în DB' },
    style: { 
      background: '#f5f5f5', 
      border: '1px solid #999', 
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px'
    }
  },
  {
    id: 'action4',
    position: { x: 450, y: 360 },
    data: { label: '4. Confirmare' },
    style: { 
      background: '#f5f5f5', 
      border: '1px solid #999', 
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px'
    }
  },
  {
    id: 'action5',
    position: { x: 250, y: 420 },
    data: { label: '5. Actualizare UI' },
    style: { 
      background: '#f5f5f5', 
      border: '1px solid #999', 
      fontSize: '12px',
      padding: '4px 8px',
      borderRadius: '4px'
    }
  },
];

const sequenceEdges: Edge[] = [
  // Messages (horizontal arrows)
  { 
    id: 'msg1', 
    source: 'action1', 
    target: 'action2', 
    type: 'straight', 
    animated: true, 
    label: 'submit',
    style: { stroke: '#2196f3', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#2196f3' }
  },
  { 
    id: 'msg2', 
    source: 'action2', 
    target: 'action3', 
    type: 'straight', 
    animated: true, 
    label: 'create',
    style: { stroke: '#4caf50', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#4caf50' }
  },
  { 
    id: 'msg3', 
    source: 'action3', 
    target: 'action4', 
    type: 'straight', 
    animated: true, 
    label: 'success',
    style: { stroke: '#ff9800', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#ff9800' }
  },
  { 
    id: 'msg4', 
    source: 'action4', 
    target: 'action5', 
    type: 'straight', 
    animated: true, 
    label: 'refresh',
    style: { stroke: '#e91e63', strokeWidth: 2 },
    markerEnd: { type: 'arrowclosed', color: '#e91e63' }
  },
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
    <div className="w-full h-screen bg-white">
      <div className="p-6 bg-white shadow-sm border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Diagrame UML - Aplicația de Management Financiar</h1>
        
        <Tabs value={selectedDiagram} onValueChange={setSelectedDiagram} className="w-full">
          <TabsList className="grid w-full max-w-lg grid-cols-3 mb-4">
            <TabsTrigger value="usecase" className="text-sm font-medium">Cazuri de Utilizare</TabsTrigger>
            <TabsTrigger value="class" className="text-sm font-medium">Clase</TabsTrigger>
            <TabsTrigger value="sequence" className="text-sm font-medium">Secvențe</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="w-full" style={{ height: 'calc(100vh - 140px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
        >
          <Background color="#f0f0f0" gap={16} />
          <Controls />
          <MiniMap 
            nodeStrokeColor={(n) => {
              if (n.style?.border) {
                const borderStyle = n.style.border as string;
                return borderStyle.includes('#') ? borderStyle.split('#')[1].split(' ')[0] : '#333';
              }
              return '#333';
            }}
            nodeColor={(n) => {
              if (n.style?.background) return n.style.background as string;
              return '#fff';
            }}
            position="top-right"
          />
        </ReactFlow>
      </div>
      
      <div className="absolute bottom-6 left-6 bg-white p-6 rounded-lg shadow-lg max-w-md border">
        <h3 className="font-bold text-lg mb-3">
          {selectedDiagram === 'usecase' && 'Diagrama Cazurilor de Utilizare'}
          {selectedDiagram === 'class' && 'Diagrama Claselor'}
          {selectedDiagram === 'sequence' && 'Diagrama de Secvențe'}
        </h3>
        <div className="text-sm text-gray-700">
          {selectedDiagram === 'usecase' && 'Ilustrează interacțiunile dintre utilizatori și sistemul de management financiar. Actorii (Utilizator și Admin Familie) interacționează cu diverse cazuri de utilizare pentru gestionarea finanțelor.'}
          {selectedDiagram === 'class' && 'Prezintă structura claselor și relațiile dintre ele în aplicație. Fiecare clasă conține atribute și metode specifice pentru funcționalitatea sistemului.'}
          {selectedDiagram === 'sequence' && 'Arată fluxul de mesaje pentru procesul de adăugare a unei tranzacții, de la introducerea datelor de către utilizator până la actualizarea interfeței.'}
        </div>
      </div>
    </div>
  );
};

export default UMLDiagrams;
