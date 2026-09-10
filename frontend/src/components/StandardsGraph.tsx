'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphData, fetchStandardsGraph } from '@/lib/api';
import { Network, ZoomIn, ZoomOut, RefreshCw, Layers, Info } from 'lucide-react';

interface StandardsGraphProps {
  initialData?: GraphData;
  focusStandard?: string;
}

export const StandardsGraph: React.FC<StandardsGraphProps> = ({ initialData, focusStandard }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    async function initCytoscape() {
      if (!containerRef.current) return;
      setLoading(true);

      try {
        let graphData = initialData;
        if (!graphData) {
          if (focusStandard) {
            const { fetchStandardsSubgraph } = await import('@/lib/api');
            graphData = await fetchStandardsSubgraph(focusStandard, 2);
          } else {
            graphData = await fetchStandardsGraph();
          }
        }

        if (!isMounted || !containerRef.current) return;

        // Dynamic import cytoscape to prevent SSR issues
        const cytoscape = (await import('cytoscape')).default;

        const cyElements = [
          ...graphData.nodes.map((n) => ({
            data: {
              id: n.id,
              label: n.label,
              type: n.type,
              status: n.status,
              title: n.title,
            },
          })),
          ...graphData.edges.map((e) => ({
            data: {
              source: e.source,
              target: e.target,
              label: e.label,
            },
          })),
        ];

        cyRef.current = cytoscape({
          container: containerRef.current,
          elements: cyElements,
          style: [
            {
              selector: 'node',
              style: {
                label: 'data(label)',
                'color': '#F8FAFC',
                'font-size': '11px',
                'font-family': 'JetBrains Mono, monospace',
                'font-weight': 600,
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#1E293B',
                'border-width': 2,
                'border-color': '#475569',
                'width': 64,
                'height': 64,
                'text-wrap': 'wrap',
                'text-max-width': '80px',
              },
            },
            {
              selector: 'node[type = "standard"][status = "ACTIVE"]',
              style: {
                'background-color': '#064E3B',
                'border-color': '#10B981',
                'border-width': 2.5,
              },
            },
            {
              selector: 'node[type = "standard"][status = "OBSOLETE"]',
              style: {
                'background-color': '#881337',
                'border-color': '#F43F5E',
                'border-width': 2.5,
              },
            },
            {
              selector: 'node[type = "qco"]',
              style: {
                'background-color': '#78350F',
                'border-color': '#F59E0B',
                'border-width': 2.5,
                'shape': 'diamond',
                'width': 70,
                'height': 70,
              },
            },
            {
              selector: 'node[type = "foreign"]',
              style: {
                'background-color': '#1E1B4B',
                'border-color': '#6366F1',
                'border-width': 2.5,
                'shape': 'hexagon',
                'width': 68,
                'height': 68,
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#334155',
                'target-arrow-color': '#64748B',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '9px',
                'font-family': 'JetBrains Mono, monospace',
                'color': '#94A3B8',
                'text-background-opacity': 0.9,
                'text-background-color': '#060B18',
                'text-background-padding': '3px',
              },
            },
          ],
          layout: {
            name: 'cose',
            animate: false,
            padding: 24,
            nodeRepulsion: () => 7000,
          },
        });

        cyRef.current.on('tap', 'node', (evt: any) => {
          setSelectedNode(evt.target.data());
        });

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize cytoscape', err);
        setLoading(false);
      }
    }

    initCytoscape();

    return () => {
      isMounted = false;
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [initialData, focusStandard]);

  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.25);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.8);
  const handleFit = () => cyRef.current?.fit();

  return (
    <div className="relative glass-panel rounded-3xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col h-[520px]">
      
      {/* Controls Header */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-800/80 bg-canvas-950/70 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-accent-cyan" />
          <h4 className="font-bold text-white text-xs uppercase tracking-wider font-mono">
            Standards Equivalence & Dependency Graph
          </h4>
        </div>

        {/* Zoom & Fit Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 rounded-lg bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Reset View"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Graph Visual Canvas */}
      <div className="relative flex-1 w-full h-full bg-canvas-950/40">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas-950/90 z-20">
            <div className="flex items-center gap-2 text-slate-400 animate-pulse text-xs font-mono">
              <RefreshCw className="w-4 h-4 animate-spin text-accent-cyan" />
              Synthesizing dependency subgraph...
            </div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Selected Node Details Drawer */}
        {selectedNode && (
          <div className="absolute bottom-3 left-3 right-3 sm:right-auto sm:w-80 p-4 rounded-2xl bg-canvas-900/95 border border-slate-700 shadow-2xl backdrop-blur-xl z-20 space-y-2 animate-fade-in-up">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent-cyan px-2 py-0.5 rounded bg-accent-blue/20">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white text-xs px-1.5 py-0.5 rounded bg-slate-800"
              >
                ✕
              </button>
            </div>
            
            <div className="text-sm font-black text-white font-mono">{selectedNode.label}</div>
            <div className="text-xs text-slate-300 leading-snug">{selectedNode.title}</div>
            
            {selectedNode.status && (
              <div className={`mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold ${
                selectedNode.status === 'ACTIVE'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                Status: {selectedNode.status}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graph Legend */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-t border-slate-800/80 bg-canvas-950/60 text-[11px] text-slate-400 overflow-x-auto font-mono">
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/30"></span> Active BIS Standard
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-500/30"></span> Obsolete / Superseded
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 bg-amber-500 rotate-45"></span> Mandatory QCO Order
        </span>
        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Foreign Standard (ASTM/DIN)
        </span>
      </div>

    </div>
  );
};
