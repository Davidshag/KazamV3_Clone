"use client";

import React, { useCallback, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from "@xyflow/react";
import { nanoid } from "nanoid";

import { Info } from "../info";
import { Participants } from "../participants";
import { Toolbar } from "../toolbar";
import { SelectionTools } from "../selection-tools";
import { CanvasMode, CanvasState, LayerType, Color } from "@/types/canvas";

import "@xyflow/react/dist/style.css";

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 250 },
    data: { label: 'Node 1' },
  },
];

const initialEdges: Edge[] = [];

export const Canvas = ({ boardId }: { boardId: string }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: CanvasMode.None,
  });
  
  const [lastUsedColor, setLastUsedColor] = useState<Color>({
    r: 0,
    g: 0,
    b: 0,
  });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Convert LayerType enum to readable string
  const getLayerTypeName = (layerType: LayerType): string => {
    switch (layerType) {
      case LayerType.Text:
        return 'Text';
      case LayerType.Note:
        return 'Sticky Note';
      case LayerType.Rectangle:
        return 'Rectangle';
      case LayerType.Ellipse:
        return 'Ellipse';
      default:
        return 'Node';
    }
  };

  // Get node label and style based on layer type
  const getNodeConfig = (layerType: LayerType) => {
    switch (layerType) {
      case LayerType.Text:
        return {
          label: 'Text Node',
          style: { backgroundColor: '#f0f0f0', border: '2px solid #6b7280' }
        };
      case LayerType.Note:
        return {
          label: 'Sticky Note',
          style: { backgroundColor: '#fef3c7', border: '2px solid #f59e0b' }
        };
      case LayerType.Rectangle:
        return {
          label: 'Rectangle',
          style: { backgroundColor: '#dbeafe', border: '2px solid #3b82f6' }
        };
      case LayerType.Ellipse:
        return {
          label: 'Ellipse',
          style: { backgroundColor: '#dcfce7', border: '2px solid #22c55e', borderRadius: '50%' }
        };
      default:
        return {
          label: 'Node',
          style: { backgroundColor: '#f9fafb', border: '2px solid #6b7280' }
        };
    }
  };

  // Handle canvas click to create new nodes
  const onPaneClick = useCallback((event: React.MouseEvent) => {
    if (canvasState.mode === CanvasMode.Inserting && canvasState.layerType !== undefined) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const config = getNodeConfig(canvasState.layerType);
      
      const newNode: Node = {
        id: nanoid(),
        type: 'default',
        position: {
          x: event.clientX - rect.left - 50, // Center the node
          y: event.clientY - rect.top - 25,
        },
        data: { label: config.label },
        style: {
          ...config.style,
          width: 100,
          height: 50,
        },
      };
      
      setNodes((nds) => [...nds, newNode]);
      
      // Reset to select mode after creating
      setCanvasState({ mode: CanvasMode.None });
    }
  }, [canvasState, setNodes, setCanvasState]);

  // Simple undo/redo
  const undo = useCallback(() => {
    setNodes((nds) => nds.slice(0, -1));
  }, [setNodes]);

  const redo = useCallback(() => {
    console.log('Redo clicked');
  }, []);

  // Quick add node function for testing
  const addQuickNode = useCallback(() => {
    const config = getNodeConfig(LayerType.Rectangle);
    const newNode: Node = {
      id: nanoid(),
      type: 'default',
      position: {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100,
      },
      data: { label: config.label },
      style: {
        ...config.style,
        width: 100,
        height: 50,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <main className="h-full w-full relative bg-neutral-100">
      <Info boardId={boardId} />
      <Participants />
      
      {/* Fix toolbar pointer events */}
      <div className="absolute top-[50%] -translate-y-[50%] left-2 z-50 pointer-events-auto">
        <Toolbar
          canvasState={canvasState}
          setCanvasState={setCanvasState}
          canRedo={false}
          canUndo={nodes.length > 1}
          undo={undo}
          redo={redo}
        />
      </div>
      
      <SelectionTools
        camera={{ x: 0, y: 0 }}
        setLastUsedColor={setLastUsedColor}
      />

      {/* Instructions - Fixed the toLowerCase error */}
      {canvasState.mode === CanvasMode.Inserting && canvasState.layerType !== undefined && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Click anywhere on the canvas to add a {getLayerTypeName(canvasState.layerType).toLowerCase()} node
        </div>
      )}

      {/* Quick add button for testing */}
      <button
        onClick={addQuickNode}
        className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 pointer-events-auto"
      >
        + Add Node
      </button>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        fitView
        className={canvasState.mode === CanvasMode.Inserting ? 'cursor-crosshair' : ''}
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </main>
  );
};
