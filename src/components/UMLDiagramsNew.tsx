import React, { useState } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Use Case Diagram - Clean and simple
const useCaseNodes: Node[] = [
  // Actors
  {
    id: 'user',
    type: 'input',
    position: { x: 100, y: 300 },
    data: { label: '👤 Utilizator' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #2563eb', 
      borderRadius: '60px', 
      width: '140px', 
      height: '80px',
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'admin',
    type: 'input',
    position: { x: 100, y: 500 },
    data: { label: '👨‍💼 Administrator' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #dc2626', 
      borderRadius: '60px', 
      width: '140px', 
      height: '80px',
      fontSize: '16px',
      fontWeight: 'bold',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  
  // Use Cases
  {
    id: 'login',
    position: { x: 400, y: 150 },
    data: { label: 'Autentificare' },
    style: { 
      background: '#f0f9ff', 
      border: '3px solid #0ea5e9', 
      borderRadius: '80px', 
      width: '180px', 
      height: '90px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'transactions',
    position: { x: 400, y: 270 },
    data: { label: 'Gestionare\nTranzacții' },
    style: { 
      background: '#f0fdf4', 
      border: '3px solid #16a34a', 
      borderRadius: '80px', 
      width: '180px', 
      height: '90px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  },
  {
    id: 'budget',
    position: { x: 400, y: 390 },
    data: { label: 'Gestionare\nBuget' },
    style: { 
      background: '#fffbeb', 
      border: '3px solid #f59e0b', 
      borderRadius: '80px', 
      width: '180px', 
      height: '90px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  },
  {
    id: 'reports',
    position: { x: 400, y: 510 },
    data: { label: 'Generare\nRapoarte' },
    style: { 
      background: '#fdf2f8', 
      border: '3px solid #ec4899', 
      borderRadius: '80px', 
      width: '180px', 
      height: '90px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  },
  {
    id: 'family',
    position: { x: 400, y: 630 },
    data: { label: 'Administrare\nFamilie' },
    style: { 
      background: '#f3e8ff', 
      border: '3px solid #a855f7', 
      borderRadius: '80px', 
      width: '180px', 
      height: '90px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }
  }
];

const useCaseEdges: Edge[] = [
  { id: 'e1', source: 'user', target: 'login', style: { stroke: '#374151', strokeWidth: 3 } },
  { id: 'e2', source: 'user', target: 'transactions', style: { stroke: '#374151', strokeWidth: 3 } },
  { id: 'e3', source: 'user', target: 'budget', style: { stroke: '#374151', strokeWidth: 3 } },
  { id: 'e4', source: 'user', target: 'reports', style: { stroke: '#374151', strokeWidth: 3 } },
  { id: 'e5', source: 'admin', target: 'family', style: { stroke: '#374151', strokeWidth: 3 } },
  { id: 'e6', source: 'admin', target: 'reports', style: { stroke: '#374151', strokeWidth: 3 } }
];

// Class Diagram - Updated structure with better formatting and larger boxes
const classNodes: Node[] = [
  {
    id: 'user-class',
    position: { x: 100, y: 100 },
    data: { 
      label: (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="text-center font-bold text-xl border-b-2 border-gray-800 pb-3 mb-4">User</div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-base space-y-2 pb-4 mb-4 border-b border-gray-400">
              <div>- id: UUID</div>
              <div>- email: string</div>
              <div>- firstName: string</div>
              <div>- lastName: string</div>
              <div>- createdAt: Date</div>
            </div>
            <div className="text-left text-base space-y-2">
              <div>+ login()</div>
              <div>+ logout()</div>
              <div>+ updateProfile()</div>
              <div>+ createFamily()</div>
            </div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #1f2937', 
      width: '380px', 
      height: '350px',
      borderRadius: '12px',
      padding: '0'
    }
  },
  
  {
    id: 'transaction-class',
    position: { x: 480, y: 100 },
    data: { 
      label: (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="text-center font-bold text-xl border-b-2 border-gray-800 pb-3 mb-4">Transaction</div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-base space-y-2 pb-4 mb-4 border-b border-gray-400">
              <div>- id: UUID</div>
              <div>- amount: number</div>
              <div>- description: string</div>
              <div>- category: string</div>
              <div>- type: TransactionType</div>
              <div>- date: Date</div>
            </div>
            <div className="text-left text-base space-y-2">
              <div>+ create()</div>
              <div>+ update()</div>
              <div>+ delete()</div>
            </div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #1f2937', 
      width: '380px', 
      height: '350px',
      borderRadius: '12px',
      padding: '0'
    }
  },

  {
    id: 'budget-class',
    position: { x: 100, y: 460 },
    data: { 
      label: (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="text-center font-bold text-xl border-b-2 border-gray-800 pb-3 mb-4">Budget</div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-base space-y-2 pb-4 mb-4 border-b border-gray-400">
              <div>- id: UUID</div>
              <div>- category: string</div>
              <div>- limitAmount: number</div>
              <div>- period: Period</div>
              <div>- userId: UUID</div>
            </div>
            <div className="text-left text-base space-y-2">
              <div>+ checkLimit()</div>
              <div>+ updateLimit()</div>
              <div>+ getSpending()</div>
            </div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #1f2937', 
      width: '380px', 
      height: '320px',
      borderRadius: '12px',
      padding: '0'
    }
  },

  {
    id: 'family-class',
    position: { x: 480, y: 460 },
    data: { 
      label: (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="text-center font-bold text-xl border-b-2 border-gray-800 pb-3 mb-4">FamilyGroup</div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-base space-y-2 pb-4 mb-4 border-b border-gray-400">
              <div>- id: UUID</div>
              <div>- name: string</div>
              <div>- createdBy: UUID</div>
              <div>- members: User[]</div>
            </div>
            <div className="text-left text-base space-y-2">
              <div>+ addMember()</div>
              <div>+ removeMember()</div>
              <div>+ inviteMember()</div>
            </div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #1f2937', 
      width: '380px', 
      height: '280px',
      borderRadius: '12px',
      padding: '0'
    }
  },

  {
    id: 'goal-class',
    position: { x: 860, y: 280 },
    data: { 
      label: (
        <div className="w-full h-full p-4 flex flex-col">
          <div className="text-center font-bold text-xl border-b-2 border-gray-800 pb-3 mb-4">Goal</div>
          <div className="flex-1 flex flex-col justify-between">
            <div className="text-left text-base space-y-2 pb-4 mb-4 border-b border-gray-400">
              <div>- id: UUID</div>
              <div>- title: string</div>
              <div>- targetAmount: number</div>
              <div>- currentAmount: number</div>
              <div>- deadline: Date</div>
            </div>
            <div className="text-left text-base space-y-2">
              <div>+ updateProgress()</div>
              <div>+ checkDeadline()</div>
              <div>+ markCompleted()</div>
            </div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '3px solid #1f2937', 
      width: '380px', 
      height: '320px',
      borderRadius: '12px',
      padding: '0'
    }
  }
];

const classEdges: Edge[] = [
  { 
    id: 'user-transaction', 
    source: 'user-class', 
    target: 'transaction-class', 
    label: '1..*', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '16px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  },
  { 
    id: 'user-budget', 
    source: 'user-class', 
    target: 'budget-class', 
    label: '1..*', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '16px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  },
  { 
    id: 'user-family', 
    source: 'user-class', 
    target: 'family-class', 
    label: 'n..n', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '16px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  },
  { 
    id: 'user-goal', 
    source: 'user-class', 
    target: 'goal-class', 
    label: '1..*', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '16px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  }
];

// Sequence Diagram - Transaction creation flow
const sequenceNodes: Node[] = [
  // Actors headers
  {
    id: 'user-header',
    position: { x: 150, y: 80 },
    data: { label: 'Utilizator' },
    style: { 
      background: '#dbeafe', 
      border: '4px solid #2563eb', 
      width: '160px', 
      height: '90px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'frontend-header',
    position: { x: 400, y: 80 },
    data: { label: 'Frontend' },
    style: { 
      background: '#dcfce7', 
      border: '4px solid #16a34a', 
      width: '160px', 
      height: '90px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'backend-header',
    position: { x: 650, y: 80 },
    data: { label: 'Backend' },
    style: { 
      background: '#fef3c7', 
      border: '4px solid #f59e0b', 
      width: '160px', 
      height: '90px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  {
    id: 'database-header',
    position: { x: 900, y: 80 },
    data: { label: 'Database' },
    style: { 
      background: '#fce7f3', 
      border: '4px solid #ec4899', 
      width: '160px', 
      height: '90px',
      borderRadius: '12px',
      fontWeight: 'bold',
      fontSize: '18px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },

  // Lifelines (vertical lines)
  {
    id: 'user-lifeline',
    position: { x: 227, y: 200 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '3px dashed #6b7280', 
      width: '6px', 
      height: '600px',
      borderRadius: '0px'
    }
  },
  {
    id: 'frontend-lifeline',
    position: { x: 477, y: 200 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '3px dashed #6b7280', 
      width: '6px', 
      height: '600px',
      borderRadius: '0px'
    }
  },
  {
    id: 'backend-lifeline',
    position: { x: 727, y: 200 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '3px dashed #6b7280', 
      width: '6px', 
      height: '600px',
      borderRadius: '0px'
    }
  },
  {
    id: 'database-lifeline',
    position: { x: 977, y: 200 },
    data: { label: '' },
    style: { 
      background: 'transparent', 
      border: '3px dashed #6b7280', 
      width: '6px', 
      height: '600px',
      borderRadius: '0px'
    }
  },

  // Messages
  {
    id: 'msg1',
    position: { x: 160, y: 280 },
    data: { label: '1. Completează formular tranzacție' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  },
  {
    id: 'msg2',
    position: { x: 410, y: 380 },
    data: { label: '2. Validare date' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  },
  {
    id: 'msg3',
    position: { x: 660, y: 480 },
    data: { label: '3. Salvare în baza de date' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  },
  {
    id: 'msg4',
    position: { x: 660, y: 580 },
    data: { label: '4. Confirmare salvare' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  },
  {
    id: 'msg5',
    position: { x: 410, y: 680 },
    data: { label: '5. Actualizare interfață' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  },
  {
    id: 'msg6',
    position: { x: 160, y: 780 },
    data: { label: '6. Notificare utilizator' },
    style: { 
      background: '#ffffff', 
      border: '3px solid #374151', 
      fontSize: '16px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontWeight: '600'
    }
  }
];

const sequenceEdges: Edge[] = [
  { 
    id: 'seq1', 
    source: 'msg1', 
    target: 'msg2', 
    animated: true, 
    label: 'submit',
    style: { stroke: '#3b82f6', strokeWidth: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    labelStyle: { fill: '#3b82f6', fontWeight: 'bold', fontSize: '16px' }
  },
  { 
    id: 'seq2', 
    source: 'msg2', 
    target: 'msg3', 
    animated: true, 
    label: 'create',
    style: { stroke: '#10b981', strokeWidth: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
    labelStyle: { fill: '#10b981', fontWeight: 'bold', fontSize: '16px' }
  },
  { 
    id: 'seq3', 
    source: 'msg3', 
    target: 'msg4', 
    animated: true, 
    label: 'success',
    style: { stroke: '#f59e0b', strokeWidth: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    labelStyle: { fill: '#f59e0b', fontWeight: 'bold', fontSize: '16px' }
  },
  { 
    id: 'seq4', 
    source: 'msg4', 
    target: 'msg5', 
    animated: true, 
    label: 'update',
    style: { stroke: '#8b5cf6', strokeWidth: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
    labelStyle: { fill: '#8b5cf6', fontWeight: 'bold', fontSize: '16px' }
  },
  { 
    id: 'seq5', 
    source: 'msg5', 
    target: 'msg6', 
    animated: true, 
    label: 'notify',
    style: { stroke: '#ec4899', strokeWidth: 4 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ec4899' },
    labelStyle: { fill: '#ec4899', fontWeight: 'bold', fontSize: '16px' }
  }
];

const UMLDiagramsNew = () => {
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
      <div className="p-8 bg-white shadow-sm border-b">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Diagrame UML - Aplicația Financiară</h1>
        
        <Tabs value={selectedDiagram} onValueChange={setSelectedDiagram} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="usecase" className="text-lg font-semibold py-3">Cazuri de Utilizare</TabsTrigger>
            <TabsTrigger value="class" className="text-lg font-semibold py-3">Diagrama Claselor</TabsTrigger>
            <TabsTrigger value="sequence" className="text-lg font-semibold py-3">Diagrama Secvențe</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <div className="w-full" style={{ height: 'calc(100vh - 160px)' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          attributionPosition="bottom-left"
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={true}
          panOnScroll={true}
          panOnDrag={true}
          style={{ background: '#ffffff' }}
        >
          <Background color="#e5e7eb" gap={20} size={2} />
          <Controls showZoom={false} showFitView={true} showInteractive={false} />
          <MiniMap 
            nodeStrokeColor="#374151"
            nodeColor="#f9fafb"
            position="top-right"
            style={{ backgroundColor: '#ffffff', border: '2px solid #d1d5db' }}
          />
        </ReactFlow>
      </div>
      
      <div className="absolute bottom-8 left-8 bg-white p-6 rounded-xl shadow-2xl max-w-lg border-2 border-gray-200">
        <h3 className="font-bold text-xl mb-4 text-gray-900">
          {selectedDiagram === 'usecase' && 'Diagrama Cazurilor de Utilizare'}
          {selectedDiagram === 'class' && 'Diagrama Claselor'}
          {selectedDiagram === 'sequence' && 'Diagrama de Secvențe'}
        </h3>
        <div className="text-base text-gray-700 leading-relaxed">
          {selectedDiagram === 'usecase' && 'Prezintă interacțiunile dintre utilizatori și funcționalitățile sistemului de management financiar. Arată cum utilizatorii și administratorii interacționează cu diferitele module ale aplicației.'}
          {selectedDiagram === 'class' && 'Ilustrează structura principalelor clase din sistem și relațiile dintre ele. Fiecare clasă conține atributele și metodele necesare pentru funcționalitatea aplicației.'}
          {selectedDiagram === 'sequence' && 'Demonstrează fluxul de execuție pentru procesul de creare a unei tranzacții, de la introducerea datelor până la confirmarea finală și actualizarea interfeței utilizator.'}
        </div>
      </div>
    </div>
  );
};

export default UMLDiagramsNew;
