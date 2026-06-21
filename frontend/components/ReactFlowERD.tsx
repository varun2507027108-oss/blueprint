"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";

// Custom Node Component for Database Tables
function TableNode({ data }: { data: any }) {
  return (
    <div className="bg-[#111827] border border-[#334155] rounded-md shadow-xl w-56 overflow-hidden font-mono relative">
      <Handle type="target" position={Position.Left} id="a-target" className="!bg-[#3b82f6] !border-none !w-2 !h-2" />
      <Handle type="source" position={Position.Right} id="a-source" className="!bg-[#3b82f6] !border-none !w-2 !h-2" />
      <div className="bg-[#1e293b] text-white p-2 text-[11px] uppercase tracking-widest border-b border-[#334155] font-bold flex justify-between items-center cursor-move">
        <span>{data.tableName}</span>
        <span className="text-[8px] text-[#64748b]">TABLE</span>
      </div>
      <div className="flex flex-col">
        {data.attributes.map((attr: any, i: number) => (
          <div key={i} className={`flex justify-between items-center px-3 py-1.5 text-[11px] border-b border-[#1e293b] last:border-0 ${i % 2 === 0 ? 'bg-[#0f172a]/50' : 'bg-transparent'}`}>
            <div className="flex gap-2 items-center">
              <span className="text-[#64748b] text-[10px]">{attr.type}</span>
              <span className="text-[#e2e8f0]">{attr.name}</span>
            </div>
            {attr.key && (
              <span className={`text-[8px] px-1.5 py-0.5 rounded-sm font-bold tracking-wider ${
                attr.key.includes('PK') ? 'bg-amber-500/20 text-amber-400' : 
                attr.key.includes('FK') ? 'bg-blue-500/20 text-blue-400' : 
                'bg-purple-500/20 text-purple-400' // For UNIQUE or other constraints
              }`}>
                {attr.key}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const nodeTypes = { table: TableNode };

// Dagre Auto-Layout function
const getLayoutedElements = (nodes: any[], edges: any[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: "LR", nodesep: 50, ranksep: 80 }); // Left-to-right layout

  nodes.forEach((node) => {
    const height = 40 + (node.data.attributes.length * 28);
    dagreGraph.setNode(node.id, { width: 224, height: height });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 112,
      y: nodeWithPosition.y - (nodeWithPosition.height / 2),
    };
  });

  return { nodes, edges };
};

export default function ReactFlowERD({ chart }: { chart: string }) {
  const { nodes, edges } = useMemo(() => {
    const parsed = parseMermaidToReactFlow(chart);
    return getLayoutedElements(parsed.nodes, parsed.edges);
  }, [chart]);

  if (!nodes.length) {
    return (
      <div className="w-full flex items-center justify-center bg-base p-6 rounded-none border border-border-subtle overflow-x-auto min-h-[200px] text-text-muted text-[11px] font-mono uppercase tracking-widest">
        No valid diagram data generated.
      </div>
    );
  }

  return (
    <div className="w-full h-[500px] bg-base rounded-none border border-border-subtle overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesConnectable={false}
        nodesDraggable={true}
        zoomOnScroll={true}
        panOnDrag={true}
      >
        <Background color="#334155" gap={16} size={1} />
        <Controls className="bg-panel border border-border-subtle !shadow-none" showInteractive={false} />
      </ReactFlow>
    </div>
  );
}

// Upgraded Parser: Converts AI Mermaid text into React Flow JSON
function parseMermaidToReactFlow(mermaidStr: string) {
  const nodes: any[] = [];
  const edges: any[] = [];
  
  if (!mermaidStr) return { nodes, edges };

  let cleanStr = mermaidStr.replace(/```mermaid/g, '').replace(/```/g, '').trim();
  cleanStr = cleanStr.replace(/\berDiagram\b/gi, '').trim();

  // 1. Parse Entities
  const entityRegex = /(\w+)\s*\{([^}]*)\}/g;
  let match;
  while ((match = entityRegex.exec(cleanStr)) !== null) {
    const tableName = match[1];
    const attrsStr = match[2];
    const attributes: any[] = [];

    // Split attributes by line for robust parsing
    const attrLines = attrsStr.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
    
    for (const line of attrLines) {
      // Match: TYPE NAME (CONSTRAINTS)
      // e.g., VARCHAR(255) email UNIQUE
      // e.g., UUID id PK, FK
      const attrMatch = line.match(/^([\w\d\(\),]+)\s+([\w\d_]+)(?:\s+(.+))?$/);
      if (attrMatch) {
        attributes.push({
          type: attrMatch[1],
          name: attrMatch[2],
          key: attrMatch[3] ? attrMatch[3].trim() : null
        });
      }
    }

    nodes.push({
      id: tableName,
      type: 'table',
      position: { x: 0, y: 0 }, // Dagre will overwrite this
      data: { tableName, attributes }
    });
  }

  // 2. Parse Relationships (Upgraded Regex)
  // Matches: ENTITY_A ||--o{ ENTITY_B : "label"
  // Matches: ENTITY_A }|--|| ENTITY_B : label
  const relRegex = /(\w+)\s+([|o{}~-]+)\s+(\w+)\s*:\s*("[^"]+"|\w[\w\s-]*)/g;
  let relMatch;
  while ((relMatch = relRegex.exec(cleanStr)) !== null) {
    const source = relMatch[1];
    const target = relMatch[3];
    let label = relMatch[4].trim();
    
    // Remove quotes from label if present
    if (label.startsWith('"') && label.endsWith('"')) {
      label = label.substring(1, label.length - 1);
    }

    edges.push({
      id: `e-${source}-${target}-${Math.random().toString(36).substring(7)}`,
      source,
      target,
      sourceHandle: "a-source",
      targetHandle: "a-target",
      label,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#3b82f6', strokeWidth: 2 },
      labelStyle: { fill: '#94a3b8', fontWeight: 700, fontSize: 10, fontFamily: 'monospace' },
      labelBgStyle: { fill: '#1e293b', fillOpacity: 1, stroke: '#334155', strokeWidth: 1, rx: 4, ry: 4 },
      labelBgPadding: [8, 4],
      labelBgBorderRadius: 4,
    });
  }

  return { nodes, edges };
}