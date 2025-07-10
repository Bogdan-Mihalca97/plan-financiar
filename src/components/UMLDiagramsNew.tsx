
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

// Class Diagram - Updated structure
const classNodes: Node[] = [
  {
    id: 'user-class',
    position: { x: 100, y: 100 },
    data: { 
      label: (
        <div className="text-left text-sm p-4 w-full">
          <div className="font-bold border-b-2 border-gray-700 pb-2 mb-3 text-center text-lg">User</div>
          <div className="text-gray-600 border-b border-gray-300 pb-3 mb-3">
            <div className="mb-1">- id: UUID</div>
            <div className="mb-1">- email: string</div>
            <div className="mb-1">- firstName: string</div>
            <div className="mb-1">- lastName: string</div>
            <div className="mb-1">- createdAt: Date</div>
          </div>
          <div className="text-gray-800">
            <div className="mb-1">+ authenticate()</div>
            <div className="mb-1">+ updateProfile()</div>
            <div className="mb-1">+ createFamily()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '4px solid #1f2937', 
      width: '280px', 
      height: '240px',
      borderRadius: '12px'
    }
  },
  
  {
    id: 'transaction-class',
    position: { x: 450, y: 100 },
    data: { 
      label: (
        <div className="text-left text-sm p-4 w-full">
          <div className="font-bold border-b-2 border-gray-700 pb-2 mb-3 text-center text-lg">Transaction</div>
          <div className="text-gray-600 border-b border-gray-300 pb-3 mb-3">
            <div className="mb-1">- id: UUID</div>
            <div className="mb-1">- amount: number</div>
            <div className="mb-1">- category: string</div>
            <div className="mb-1">- description: string</div>
            <div className="mb-1">- date: Date</div>
            <div className="mb-1">- type: string</div>
          </div>
          <div className="text-gray-800">
            <div className="mb-1">+ create()</div>
            <div className="mb-1">+ update()</div>
            <div className="mb-1">+ delete()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '4px solid #1f2937', 
      width: '280px', 
      height: '240px',
      borderRadius: '12px'
    }
  },

  {
    id: 'budget-class',
    position: { x: 100, y: 400 },
    data: { 
      label: (
        <div className="text-left text-sm p-4 w-full">
          <div className="font-bold border-b-2 border-gray-700 pb-2 mb-3 text-center text-lg">Budget</div>
          <div className="text-gray-600 border-b border-gray-300 pb-3 mb-3">
            <div className="mb-1">- id: UUID</div>
            <div className="mb-1">- category: string</div>
            <div className="mb-1">- limitAmount: number</div>
            <div className="mb-1">- period: string</div>
            <div className="mb-1">- userId: UUID</div>
          </div>
          <div className="text-gray-800">
            <div className="mb-1">+ checkLimit()</div>
            <div className="mb-1">+ updateLimit()</div>
            <div className="mb-1">+ getSpending()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '4px solid #1f2937', 
      width: '280px', 
      height: '220px',
      borderRadius: '12px'
    }
  },

  {
    id: 'family-class',
    position: { x: 450, y: 400 },
    data: { 
      label: (
        <div className="text-left text-sm p-4 w-full">
          <div className="font-bold border-b-2 border-gray-700 pb-2 mb-3 text-center text-lg">FamilyGroup</div>
          <div className="text-gray-600 border-b border-gray-300 pb-3 mb-3">
            <div className="mb-1">- id: UUID</div>
            <div className="mb-1">- name: string</div>
            <div className="mb-1">- createdBy: UUID</div>
            <div className="mb-1">- members: User[]</div>
          </div>
          <div className="text-gray-800">
            <div className="mb-1">+ addMember()</div>
            <div className="mb-1">+ removeMember()</div>
            <div className="mb-1">+ inviteMember()</div>
          </div>
        </div>
      )
    },
    style: { 
      background: '#ffffff', 
      border: '4px solid #1f2937', 
      width: '280px', 
      height: '200px',
      borderRadius: '12px'
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
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '14px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  },
  { 
    id: 'user-budget', 
    source: 'user-class', 
    target: 'budget-class', 
    label: '1..*', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '14px' },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#1f2937' }
  },
  { 
    id: 'user-family', 
    source: 'user-class', 
    target: 'family-class', 
    label: 'n..n', 
    style: { stroke: '#1f2937', strokeWidth: 3 },
    labelStyle: { fill: '#1f2937', fontWeight: 'bold', fontSize: '14px' },
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
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          panOnScroll={false}
          panOnDrag={false}
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
