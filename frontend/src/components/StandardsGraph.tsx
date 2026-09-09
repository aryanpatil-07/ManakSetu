'use client';

import React, { useEffect, useRef, useState } from 'react';
import { GraphData, fetchStandardsGraph } from '@/lib/api';
import { Network, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';

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

        // Dynamic import cytoscape to prevent SSR window issues
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
                'color': '#f8fafc',
                'font-size': '11px',
                'text-valign': 'center',
                'text-halign': 'center',
                'background-color': '#334155',
                'border-width': 2,
                'border-color': '#64748b',
                'width': 60,
                'height': 60,
                'text-wrap': 'wrap',
                'text-max-width': '75px',
              },
            },
            {
              selector: 'node[type = "standard"][status = "ACTIVE"]',
              style: {
                'background-color': '#065f46',
                'border-color': '#10b981',
              },
            },
            {
              selector: 'node[type = "standard"][status = "OBSOLETE"]',
              style: {
                'background-color': '#881337',
                'border-color': '#f43f5e',
              },
            },
            {
              selector: 'node[type = "qco"]',
              style: {
                'background-color': '#78350f',
                'border-color': '#f59e0b',
                'shape': 'diamond',
                'width': 65,
                'height': 65,
              },
            },
            {
              selector: 'node[type = "foreign"]',
              style: {
                'background-color': '#312e81',
                'border-color': '#6366f1',
                'shape': 'hexagon',
              },
            },
            {
              selector: 'edge',
              style: {
                'width': 2,
                'line-color': '#475569',
                'target-arrow-color': '#64748b',
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '9px',
                'color': '#94a3b8',
                'text-background-opacity': 0.8,
                'text-background-color': '#0f172a',
                'text-background-padding': '2px',
              },
            },
          ],
          layout: {
            name: 'cose',
            animate: false,
            padding: 30,
            nodeRepulsion: () => 6000,
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
    <div className="relative bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[500px]">
      {/* Controls Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60 z-10">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-emerald-400" />
          <h4 className="font-semibold text-white">BIS Dependency & Equivalence Network</h4>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
            title="Reset View"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Network Canvas */}
      <div className="relative flex-1 w-full h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/80 z-20">
            <div className="text-slate-400 animate-pulse text-sm">Building standards knowledge graph...</div>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />

        {/* Selected Node Drawer */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 md:right-auto md:w-80 p-4 rounded-xl bg-slate-950/95 border border-slate-800 shadow-xl backdrop-blur-lg z-20">
            <div className="flex justify-between items-start">
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400">
                {selectedNode.type}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-500 hover:text-slate-300 text-sm"
              >
                ✕
              </button>
            </div>
            <div className="text-base font-bold text-white mt-1">{selectedNode.label}</div>
            <div className="text-xs text-slate-400 mt-1">{selectedNode.title}</div>
            {selectedNode.status && (
              <div className="mt-2 inline-block px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-300">
                Status: {selectedNode.status}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Graph Legend */}
      <div className="flex items-center gap-4 px-6 py-2.5 border-t border-slate-800/80 bg-slate-950/40 text-xs text-slate-400 overflow-x-auto">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Active BIS
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Obsolete / Superseded
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 bg-amber-500 rotate-45"></span> Mandatory QCO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500"></span> Foreign Standard
        </span>
      </div>
    </div>
  );
};
