'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { GraphData, fetchStandardsGraph } from '@/lib/api';
import { 
  Network, 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  Search, 
  Copy, 
  Check, 
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Layers,
  Sun,
  Moon,
  Maximize2
} from 'lucide-react';

interface StandardsGraphProps {
  initialData?: GraphData;
  focusStandard?: string;
}

type LayoutType = 'concentric' | 'cose' | 'breadthfirst';

export const StandardsGraph: React.FC<StandardsGraphProps> = ({ initialData, focusStandard }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [layoutType, setLayoutType] = useState<LayoutType>('concentric');
  const [copied, setCopied] = useState<boolean>(false);
  const [isDarkCanvas, setIsDarkCanvas] = useState<boolean>(false);
  const [graphRawData, setGraphRawData] = useState<GraphData | null>(null);

  // Load graph data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      try {
        let data = initialData;
        if (!data) {
          if (focusStandard) {
            const { fetchStandardsSubgraph } = await import('@/lib/api');
            data = await fetchStandardsSubgraph(focusStandard, 2);
          } else {
            data = await fetchStandardsGraph();
          }
        }
        if (isMounted) {
          setGraphRawData(data);
        }
      } catch (err) {
        console.error('Failed to load standards graph data', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [initialData, focusStandard]);

  // Cytoscape Layout Configuration generator
  const getLayoutConfig = (type: LayoutType) => {
    switch (type) {
      case 'concentric':
        return {
          name: 'concentric',
          concentric: (node: any) => {
            const nodeType = node.data('type');
            if (node.data('is_root') || nodeType === 'Primary_Standard') return 10;
            if (nodeType === 'QCO') return 7;
            if (nodeType === 'Material_Standard' || nodeType === 'Testing_Standard' || nodeType === 'Allied_Standard') return 4;
            return 1; // Obsolete, Foreign
          },
          levelWidth: () => 2.5,
          padding: 40,
          minNodeSpacing: 65,
          spacingFactor: 1.4,
          avoidOverlap: true,
          animate: true,
          animationDuration: 500,
        };
      case 'cose':
        return {
          name: 'cose',
          animate: true,
          animationDuration: 600,
          padding: 40,
          nodeRepulsion: () => 140000,
          idealEdgeLength: () => 190,
          edgeElasticity: () => 32,
          gravity: 0.15,
          numIter: 1000,
          avoidOverlap: true,
        };
      case 'breadthfirst':
        return {
          name: 'breadthfirst',
          directed: true,
          padding: 40,
          spacingFactor: 1.5,
          animate: true,
          animationDuration: 500,
        };
    }
  };

  // Initialize and Render Cytoscape
  useEffect(() => {
    if (!containerRef.current || !graphRawData) return;

    let cyInstance: any = null;
    let isCancelled = false;

    async function initCy() {
      const cytoscape = (await import('cytoscape')).default;
      if (isCancelled || !containerRef.current || !graphRawData) return;

      const cyElements = [
        ...graphRawData.nodes.map((n: any) => ({
          data: {
            id: n.id,
            label: n.label,
            type: n.type,
            status: n.status,
            title: n.title,
            is_root: n.is_root || n.type === 'Primary_Standard',
            category: n.category || n.type,
            color: n.color,
          },
        })),
        ...graphRawData.edges.map((e: any) => ({
          data: {
            id: e.id || `${e.source}->${e.target}`,
            source: e.source,
            target: e.target,
            label: e.label,
            relationship: e.relationship || e.label,
          },
        })),
      ];

      // Theme colors depending on isDarkCanvas
      const textLabelColor = isDarkCanvas ? '#0F172A' : '#1E293B';
      const edgeLineDefault = isDarkCanvas ? '#64748B' : '#94A3B8';

      cyInstance = cytoscape({
        container: containerRef.current,
        elements: cyElements,
        style: [
          // Base Node Style
          {
            selector: 'node',
            style: {
              label: 'data(label)',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-family': 'Inter, system-ui, -apple-system, sans-serif',
              'font-weight': 700,
              'font-size': '11px',
              'text-wrap': 'wrap',
              'text-max-width': '78px',
              'color': '#FFFFFF',
              'border-width': 3,
              'border-opacity': 1,
              'transition-property': 'background-color, border-color, width, height, opacity',
              'transition-duration': 0.25,
            } as any,
          },

          // 1. Primary Target Standard (Royal Blue Anchor)
          {
            selector: 'node[type = "Primary_Standard"], node[?is_root]',
            style: {
              'shape': 'ellipse',
              'width': 96,
              'height': 96,
              'background-color': '#0F4C81', // Classical National Indian Standard Blue
              'border-color': '#38BDF8', // Cyan-Blue border ring
              'border-width': 4.5,
              'color': '#FFFFFF',
              'font-size': '12.5px',
              'font-weight': 800,
              'text-max-width': '84px',
              'z-index': 100,
            },
          },

          // 2. Mandatory Quality Control Orders (Royal Purple Diamond)
          {
            selector: 'node[type = "QCO"], node[type = "qco"]',
            style: {
              'shape': 'round-diamond',
              'width': 98,
              'height': 98,
              'background-color': '#6D28D9', // Deep Purple
              'border-color': '#C084FC',
              'border-width': 4,
              'color': '#FFFFFF',
              'font-size': '10px',
              'font-weight': 800,
              'text-max-width': '82px',
              'z-index': 90,
            },
          },

          // 3. Testing Protocols (Emerald Green Rounded Rectangle)
          {
            selector: 'node[type = "Testing_Standard"], node[type = "testing"]',
            style: {
              'shape': 'round-rectangle',
              'width': 84,
              'height': 76,
              'background-color': '#047857', // Emerald
              'border-color': '#34D399',
              'border-width': 3,
              'color': '#FFFFFF',
              'font-size': '10.5px',
              'font-weight': 700,
              'text-max-width': '76px',
              'z-index': 80,
            },
          },

          // 4. Raw Material Standards (Amber / Saffron Circle)
          {
            selector: 'node[type = "Material_Standard"], node[type = "material"]',
            style: {
              'shape': 'ellipse',
              'width': 80,
              'height': 80,
              'background-color': '#D97706', // Warm Amber
              'border-color': '#FDE68A',
              'border-width': 3,
              'color': '#FFFFFF',
              'font-size': '10.5px',
              'font-weight': 700,
              'text-max-width': '72px',
              'z-index': 80,
            },
          },

          // 5. Allied & Jointing Standards (Sky Blue Circle)
          {
            selector: 'node[type = "Allied_Standard"], node[type = "allied"]',
            style: {
              'shape': 'ellipse',
              'width': 78,
              'height': 78,
              'background-color': '#0284C7', // Vivid Sky
              'border-color': '#7DD3FC',
              'border-width': 3,
              'color': '#FFFFFF',
              'font-size': '10.5px',
              'font-weight': 700,
              'text-max-width': '70px',
              'z-index': 80,
            },
          },

          // 6. Foreign Equivalent Standards (Rose Hexagon - Alert GFR 144)
          {
            selector: 'node[type = "Foreign_Standard"], node[type = "foreign"]',
            style: {
              'shape': 'hexagon',
              'width': 82,
              'height': 82,
              'background-color': '#BE123C', // Rose/Crimson
              'border-color': '#FDA4AF',
              'border-width': 3.5,
              'color': '#FFFFFF',
              'font-size': '10.5px',
              'font-weight': 700,
              'text-max-width': '72px',
              'z-index': 85,
            },
          },

          // 7. Superseded / Obsolete Standards (High-contrast Red-dashed Alert)
          {
            selector: 'node[type = "Obsolete_Standard"], node[status = "SUPERSEDED"], node[status = "OBSOLETE"]',
            style: {
              'shape': 'ellipse',
              'width': 76,
              'height': 76,
              'background-color': '#FEF2F2', // Soft red warning background
              'border-color': '#DC2626', // Bold red
              'border-width': 3,
              'border-style': 'dashed', // Dashed border clearly communicates obsolescence
              'color': '#991B1B', // Dark red text for maximum legibility
              'font-size': '10px',
              'font-weight': 800,
              'text-max-width': '68px',
              'z-index': 75,
            },
          },

          // Selected Node Glow
          {
            selector: 'node:selected',
            style: {
              'border-width': 6,
              'border-color': '#F59E0B', // Golden selection ring
              'overlay-opacity': 0.15,
              'overlay-color': '#F59E0B',
            },
          },

          // Base Edge Style
          {
            selector: 'edge',
            style: {
              'width': 2,
              'curve-style': 'bezier',
              'target-arrow-shape': 'triangle',
              'arrow-scale': 1.25,
              'line-color': edgeLineDefault,
              'target-arrow-color': edgeLineDefault,
              'label': 'data(label)',
              'font-size': '9px',
              'font-weight': 700,
              'font-family': 'Inter, system-ui, sans-serif',
              'color': textLabelColor,
              'text-rotation': 'autorotate', // Critical: follows edge angle to eliminate horizontal clumping
              'text-background-opacity': 0.96,
              'text-background-color': '#FFFFFF',
              'text-background-padding': '3px',
              'text-background-shape': 'roundrectangle',
              'text-border-opacity': 0.8,
              'text-border-width': 1,
              'text-border-color': '#CBD5E1',
              'text-margin-y': -8,
            },
          },

          // Relationship-specific Edge Color Coding
          {
            selector: 'edge[relationship = "SUPERSEDES"]',
            style: {
              'line-color': '#EF4444',
              'target-arrow-color': '#EF4444',
              'line-style': 'dashed',
              'color': '#991B1B',
              'text-border-color': '#FCA5A5',
            },
          },
          {
            selector: 'edge[relationship = "GOVERNED_BY_QCO"]',
            style: {
              'line-color': '#7C3AED',
              'target-arrow-color': '#7C3AED',
              'width': 2.5,
              'color': '#5B21B6',
              'text-border-color': '#D8B4FE',
            },
          },
          {
            selector: 'edge[relationship = "REQUIRES_TEST"]',
            style: {
              'line-color': '#059669',
              'target-arrow-color': '#059669',
              'color': '#065F46',
              'text-border-color': '#A7F3D0',
            },
          },
          {
            selector: 'edge[relationship = "REQUIRES_MATERIAL"]',
            style: {
              'line-color': '#D97706',
              'target-arrow-color': '#D97706',
              'color': '#92400E',
              'text-border-color': '#FDE68A',
            },
          },
          {
            selector: 'edge[relationship = "ALLIED_WITH"]',
            style: {
              'line-color': '#0284C7',
              'target-arrow-color': '#0284C7',
              'color': '#0369A1',
              'text-border-color': '#BAE6FD',
            },
          },
          {
            selector: 'edge[relationship = "EQUIVALENT_TO"]',
            style: {
              'line-color': '#E11D48',
              'target-arrow-color': '#E11D48',
              'line-style': 'dotted',
              'color': '#9F1239',
              'text-border-color': '#FECDD3',
            },
          },

          // Dimmed elements when filtering or searching
          {
            selector: '.dimmed',
            style: {
              'opacity': 0.15,
            },
          },
          {
            selector: '.highlighted',
            style: {
              'opacity': 1,
              'border-width': 5,
              'border-color': '#F59E0B',
            },
          },
        ],
        layout: getLayoutConfig(layoutType),
      });

      // Interactive Events
      cyInstance.on('tap', 'node', (evt: any) => {
        setSelectedNode(evt.target.data());
      });

      cyInstance.on('tap', (evt: any) => {
        if (evt.target === cyInstance) {
          setSelectedNode(null);
        }
      });

      cyRef.current = cyInstance;
    }

    initCy();

    return () => {
      isCancelled = true;
      if (cyRef.current) {
        cyRef.current.destroy();
        cyRef.current = null;
      }
    };
  }, [graphRawData, isDarkCanvas]);

  // Dynamic Layout Switcher
  const handleLayoutChange = (newLayout: LayoutType) => {
    setLayoutType(newLayout);
    if (cyRef.current) {
      const config = getLayoutConfig(newLayout);
      cyRef.current.layout(config).run();
    }
  };

  // Zoom and Fit Handlers
  const handleZoomIn = () => cyRef.current?.zoom({ level: cyRef.current.zoom() * 1.3, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } });
  const handleZoomOut = () => cyRef.current?.zoom({ level: cyRef.current.zoom() * 0.75, renderedPosition: { x: cyRef.current.width() / 2, y: cyRef.current.height() / 2 } });
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleCenterRoot = () => {
    if (!cyRef.current) return;
    const rootNode = cyRef.current.nodes('[?is_root], [type = "Primary_Standard"]');
    if (rootNode.length > 0) {
      cyRef.current.center(rootNode);
      cyRef.current.zoom(1.15);
      setSelectedNode(rootNode[0].data());
    }
  };

  // Search & Filter Effect on Cytoscape Elements
  useEffect(() => {
    if (!cyRef.current) return;
    const cy = cyRef.current;

    cy.batch(() => {
      const allNodes = cy.nodes();
      const allEdges = cy.edges();

      allNodes.removeClass('dimmed highlighted');
      allEdges.removeClass('dimmed highlighted');

      const isFilterActive = activeFilter !== 'ALL';
      const isSearchActive = searchQuery.trim().length > 0;

      if (!isFilterActive && !isSearchActive) return;

      const q = searchQuery.toLowerCase().trim();

      allNodes.forEach((node: any) => {
        const data = node.data();
        const type = data.type || '';
        const label = (data.label || '').toLowerCase();
        const title = (data.title || '').toLowerCase();

        let matchesFilter = true;
        if (activeFilter === 'QCO') matchesFilter = type === 'QCO';
        else if (activeFilter === 'TEST') matchesFilter = type === 'Testing_Standard';
        else if (activeFilter === 'MAT') matchesFilter = type === 'Material_Standard';
        else if (activeFilter === 'SUPERSEDED') matchesFilter = type === 'Obsolete_Standard' || data.status === 'SUPERSEDED';
        else if (activeFilter === 'FOREIGN') matchesFilter = type === 'Foreign_Standard';
        else if (activeFilter === 'ALLIED') matchesFilter = type === 'Allied_Standard';

        const matchesSearch = !isSearchActive || label.includes(q) || title.includes(q);

        if (matchesFilter && matchesSearch) {
          node.addClass('highlighted');
          node.connectedEdges().addClass('highlighted');
        } else {
          node.addClass('dimmed');
        }
      });

      // Dim disconnected edges
      allEdges.forEach((edge: any) => {
        if (!edge.hasClass('highlighted')) {
          edge.addClass('dimmed');
        }
      });
    });
  }, [activeFilter, searchQuery]);

  // Copy standard code helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Node Category Counts
  const counts = useMemo(() => {
    if (!graphRawData?.nodes) return { total: 0, qco: 0, test: 0, mat: 0, sup: 0, foreign: 0, allied: 0 };
    return {
      total: graphRawData.nodes.length,
      qco: graphRawData.nodes.filter(n => n.type === 'QCO').length,
      test: graphRawData.nodes.filter(n => n.type === 'Testing_Standard').length,
      mat: graphRawData.nodes.filter(n => n.type === 'Material_Standard').length,
      sup: graphRawData.nodes.filter(n => n.type === 'Obsolete_Standard' || n.status === 'SUPERSEDED').length,
      foreign: graphRawData.nodes.filter(n => n.type === 'Foreign_Standard').length,
      allied: graphRawData.nodes.filter(n => n.type === 'Allied_Standard').length,
    };
  }, [graphRawData]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-outline-variant/80 shadow-md flex flex-col h-full min-h-[580px] bg-surface-container-lowest font-sans">
      
      {/* Top Controls Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-outline-variant/60 bg-surface-container-low/70 z-10">
        
        {/* Left: Title & Quick Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center text-primary">
              <Network className="w-4 h-4" />
            </div>
            <div>
              <div className="font-headline-md font-bold text-xs uppercase tracking-wider text-primary">
                BIS Normative Knowledge Graph
              </div>
              <div className="text-[11px] text-on-surface-variant">
                Interactive ontology of statutory QCOs, testing methods & superseded editions
              </div>
            </div>
          </div>

          {/* Quick Find Input */}
          <div className="relative ml-2">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search standard or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 text-xs rounded border border-outline-variant bg-surface-container-lowest text-on-surface placeholder:text-outline/70 focus:outline-none focus:border-primary w-48 transition"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-outline hover:text-on-surface"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Right: Layout Switcher & Canvas Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          
          {/* Layout Mode Segmented Control */}
          <div className="inline-flex rounded-md border border-outline-variant/80 bg-surface-container-lowest p-0.5 text-xs font-medium">
            <button
              onClick={() => handleLayoutChange('concentric')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                layoutType === 'concentric'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Radial concentric layout centered on primary standard"
            >
              Radial Rings
            </button>
            <button
              onClick={() => handleLayoutChange('cose')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                layoutType === 'cose'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Force-directed spring layout"
            >
              Force Directed
            </button>
            <button
              onClick={() => handleLayoutChange('breadthfirst')}
              className={`px-2.5 py-1 rounded transition text-[11px] ${
                layoutType === 'breadthfirst'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Hierarchical tree layout"
            >
              Hierarchical
            </button>
          </div>

          <div className="h-4 w-px bg-outline-variant" />

          {/* Theme Canvas Toggle */}
          <button
            onClick={() => setIsDarkCanvas(!isDarkCanvas)}
            className="p-1.5 rounded border border-outline-variant/80 bg-surface-container-lowest text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
            title={isDarkCanvas ? "Switch to Light Canvas" : "Switch to Dark Canvas"}
          >
            {isDarkCanvas ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
          </button>

          {/* Zoom & Fit Actions */}
          <div className="flex items-center rounded border border-outline-variant/80 bg-surface-container-lowest overflow-hidden">
            <button
              onClick={handleZoomIn}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition border-r border-outline-variant/60"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition border-r border-outline-variant/60"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFit}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition border-r border-outline-variant/60"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCenterRoot}
              className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
              title="Center Target Standard"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Pills Bar */}
      <div className="flex items-center gap-1.5 px-4 py-2 border-b border-outline-variant/40 bg-surface-container-lowest overflow-x-auto text-[11px]">
        <span className="text-outline font-medium mr-1 text-[10px] uppercase tracking-wider">Highlight:</span>
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap ${
            activeFilter === 'ALL'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface-container-low text-on-surface-variant border-outline-variant/60 hover:border-outline'
          }`}
        >
          All ({counts.total})
        </button>
        <button
          onClick={() => setActiveFilter('QCO')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'QCO'
              ? 'bg-purple-700 text-white border-purple-800 font-bold'
              : 'bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>
          Mandatory QCOs ({counts.qco})
        </button>
        <button
          onClick={() => setActiveFilter('TEST')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'TEST'
              ? 'bg-emerald-700 text-white border-emerald-800 font-bold'
              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Testing Protocols ({counts.test})
        </button>
        <button
          onClick={() => setActiveFilter('MAT')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'MAT'
              ? 'bg-amber-700 text-white border-amber-800 font-bold'
              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
          Raw Materials ({counts.mat})
        </button>
        <button
          onClick={() => setActiveFilter('ALLIED')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'ALLIED'
              ? 'bg-sky-700 text-white border-sky-800 font-bold'
              : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
          Allied Standards ({counts.allied})
        </button>
        <button
          onClick={() => setActiveFilter('SUPERSEDED')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'SUPERSEDED'
              ? 'bg-rose-700 text-white border-rose-800 font-bold'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
          Superseded Editions ({counts.sup})
        </button>
        <button
          onClick={() => setActiveFilter('FOREIGN')}
          className={`px-2 py-0.5 rounded-full border transition font-medium whitespace-nowrap flex items-center gap-1 ${
            activeFilter === 'FOREIGN'
              ? 'bg-red-700 text-white border-red-800 font-bold'
              : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
          Foreign Standards ({counts.foreign})
        </button>
      </div>

      {/* Main Graph Visual Canvas */}
      <div 
        className={`relative flex-1 w-full h-full min-h-[440px] transition-colors duration-300 ${
          isDarkCanvas 
            ? 'bg-[#0B132B]' 
            : 'bg-[#F8FAFC]'
        }`}
        style={{
          backgroundImage: isDarkCanvas
            ? 'radial-gradient(#1E293B 1.5px, transparent 1.5px)'
            : 'radial-gradient(#CBD5E1 1.2px, transparent 1.2px)',
          backgroundSize: '22px 22px',
        }}
      >
        {/* Loading Spinner Overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-xs z-30">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant shadow-lg text-primary text-xs font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-primary" />
              Traversing Bureau of Indian Standards graph ontology...
            </div>
          </div>
        )}

        {/* Cytoscape Rendering Mount */}
        <div ref={containerRef} className="w-full h-full min-h-[440px]" />

        {/* Selected Node Details Floating Card */}
        {selectedNode && (
          <div className="absolute top-4 right-4 w-88 max-w-[calc(100%-2rem)] p-4 rounded-lg bg-surface-container-lowest border border-outline-variant/80 shadow-xl backdrop-blur-md z-20 space-y-3 animate-fade-in-up font-sans">
            
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                selectedNode.is_root || selectedNode.type === 'Primary_Standard'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : selectedNode.type === 'QCO'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : selectedNode.type === 'Testing_Standard'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : selectedNode.type === 'Material_Standard'
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : selectedNode.type === 'Obsolete_Standard' || selectedNode.status === 'SUPERSEDED'
                  ? 'bg-rose-100 text-rose-800 border border-rose-200'
                  : selectedNode.type === 'Foreign_Standard'
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}>
                {selectedNode.is_root ? 'Target Indian Standard' : selectedNode.type?.replace('_', ' ')}
              </span>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-outline hover:text-on-surface text-xs p-1 rounded hover:bg-surface-container transition"
                title="Close Drawer"
              >
                ✕
              </button>
            </div>
            
            <div>
              <div className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                {selectedNode.label}
                <button
                  onClick={() => handleCopy(selectedNode.label)}
                  className="text-outline hover:text-primary transition p-0.5"
                  title="Copy Standard Code"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
              {selectedNode.title && (
                <div className="text-xs text-on-surface-variant leading-relaxed mt-1 line-clamp-3">
                  {selectedNode.title}
                </div>
              )}
            </div>

            {/* Regulatory Advice & Guidance Box */}
            <div className="p-2.5 rounded bg-surface-container-low border border-outline-variant/60 text-[11px] space-y-1">
              <div className="font-semibold text-primary flex items-center gap-1.5">
                {selectedNode.status === 'SUPERSEDED' || selectedNode.type === 'Obsolete_Standard' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span className="text-rose-700">Superseded / Banned Edition</span>
                  </>
                ) : selectedNode.type === 'QCO' ? (
                  <>
                    <ShieldAlert className="w-3.5 h-3.5 text-purple-700" />
                    <span className="text-purple-800">Statutory Mandatory Order</span>
                  </>
                ) : selectedNode.type === 'Foreign_Standard' ? (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-amber-800">GFR Rule 144(vii) Priority</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-800">Compliant Specification</span>
                  </>
                )}
              </div>
              
              <p className="text-on-surface-variant text-[11px] leading-snug">
                {selectedNode.status === 'SUPERSEDED' || selectedNode.type === 'Obsolete_Standard'
                  ? 'This edition is superseded. Tender specifications must cite the latest revision with all active amendments.'
                  : selectedNode.type === 'QCO'
                  ? 'Governed by DPIIT Quality Control Order under BIS Act Section 16. ISI mark certification is legally mandatory.'
                  : selectedNode.type === 'Foreign_Standard'
                  ? 'Foreign reference detected. Under GFR Rule 144(vii), Indian Standards must take statutory precedence.'
                  : selectedNode.type === 'Testing_Standard'
                  ? 'Mandatory testing protocol prescribed by the primary Indian Standard to verify quality compliance.'
                  : selectedNode.type === 'Material_Standard'
                  ? 'Raw material specification required for manufacturing conforming goods.'
                  : 'Active National Standard published by Bureau of Indian Standards.'}
              </p>
            </div>

            {/* Status Pill */}
            {selectedNode.status && (
              <div className="flex items-center justify-between pt-1 border-t border-outline-variant/40 text-[10px]">
                <span className="text-outline">Regulatory Status:</span>
                <span className={`font-mono font-bold px-1.5 py-0.5 rounded ${
                  selectedNode.status === 'CURRENT' || selectedNode.status === 'ACTIVE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : selectedNode.status === 'SUPERSEDED' || selectedNode.status === 'OBSOLETE'
                    ? 'bg-rose-100 text-rose-800'
                    : selectedNode.status === 'MANDATORY_REGULATION'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {selectedNode.status}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* High-Visibility Visual Legend Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-t border-outline-variant/60 bg-surface-container-low text-[11px] text-on-surface-variant">
        
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-semibold text-on-surface text-[10px] uppercase tracking-wider">Legend:</span>
          
          <span className="flex items-center gap-1.5" title="Central target Indian Standard being drafted">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0F4C81] border-2 border-[#38BDF8] inline-block shadow-xs"></span>
            <span className="font-medium text-on-surface">Primary IS (Target)</span>
          </span>

          <span className="flex items-center gap-1.5" title="Statutory Quality Control Order">
            <span className="w-3.5 h-3.5 bg-[#6D28D9] border-2 border-[#C084FC] rotate-45 inline-block shadow-xs"></span>
            <span className="font-medium text-purple-900">Mandatory QCO</span>
          </span>

          <span className="flex items-center gap-1.5" title="Mandatory destructive/non-destructive testing methods">
            <span className="w-3.5 h-3.5 rounded bg-[#047857] border-2 border-[#34D399] inline-block shadow-xs"></span>
            <span className="font-medium text-emerald-900">Testing Protocol</span>
          </span>

          <span className="flex items-center gap-1.5" title="Mandatory raw material specification">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D97706] border-2 border-[#FDE68A] inline-block shadow-xs"></span>
            <span className="font-medium text-amber-900">Raw Material</span>
          </span>

          <span className="flex items-center gap-1.5" title="Allied jointing, fitting or accessories standard">
            <span className="w-3.5 h-3.5 rounded-full bg-[#0284C7] border-2 border-[#7DD3FC] inline-block shadow-xs"></span>
            <span className="font-medium text-sky-900">Allied Fittings</span>
          </span>

          <span className="flex items-center gap-1.5" title="Foreign equivalents (ASTM/DIN/ISO) to replace under GFR 144(vii)">
            <span className="w-3.5 h-3.5 bg-[#BE123C] border-2 border-[#FDA4AF] inline-block shadow-xs" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></span>
            <span className="font-medium text-red-900">Foreign Standard</span>
          </span>

          <span className="flex items-center gap-1.5" title="Obsolete or superseded standard (illegal to specify)">
            <span className="w-3.5 h-3.5 rounded-full bg-[#FEF2F2] border-2 border-dashed border-[#DC2626] inline-block shadow-xs"></span>
            <span className="font-medium text-rose-900">Superseded (Do Not Cite)</span>
          </span>
        </div>

        <div className="text-[10px] text-outline font-mono">
          Click any node for statutory advisory & details
        </div>
      </div>

    </div>
  );
};
