'use client'

import {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  MiniMap,
  type Node,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import { useMemo, useState } from 'react'
import '@xyflow/react/dist/style.css'
import type { RelationshipEdge, RelationshipNode } from '@/lib/landscape-data'

// Type for node data in ReactFlow
type NodeData = RelationshipNode['data'] & { type: RelationshipNode['type'] }

interface RelationshipGraphProps {
  graphData: {
    nodes: RelationshipNode[]
    edges: RelationshipEdge[]
  }
}

// Node type colors
const NODE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  vendor: {
    bg: 'bg-gradient-to-br from-slate-600/30 to-gray-700/30',
    border: 'border-slate-400',
    text: 'text-slate-100',
  },
  ide: {
    bg: 'bg-gradient-to-br from-blue-500/30 to-purple-500/30',
    border: 'border-blue-400',
    text: 'text-blue-100',
  },
  cli: {
    bg: 'bg-gradient-to-br from-green-500/30 to-emerald-500/30',
    border: 'border-green-400',
    text: 'text-green-100',
  },
  extension: {
    bg: 'bg-gradient-to-br from-pink-500/30 to-rose-500/30',
    border: 'border-pink-400',
    text: 'text-pink-100',
  },
  model: {
    bg: 'bg-gradient-to-br from-purple-500/30 to-indigo-500/30',
    border: 'border-purple-400',
    text: 'text-purple-100',
  },
  provider: {
    bg: 'bg-gradient-to-br from-indigo-500/30 to-violet-500/30',
    border: 'border-indigo-400',
    text: 'text-indigo-100',
  },
}

// Edge type colors
const EDGE_COLORS: Record<string, string> = {
  'vendor-product': '#64748b', // slate
  'extension-ide': '#ec4899', // pink
  'related-product': '#8b5cf6', // purple
}

// Custom node component
function CustomNode({ data }: { data: NodeData }) {
  const colors = NODE_COLORS[data.type] || NODE_COLORS.vendor
  const isVendor = data.type === 'vendor'

  return (
    <div
      className={`px-4 py-2 border-2 ${colors.bg} ${colors.border} ${colors.text} rounded-lg shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl ${
        isVendor ? 'min-w-[120px]' : 'min-w-[100px]'
      }`}
    >
      <div className="font-semibold text-sm text-center whitespace-nowrap">{data.label}</div>
      {data.category && (
        <div className="text-xs text-center opacity-75 mt-1">{data.category.toUpperCase()}</div>
      )}
    </div>
  )
}

const nodeTypes = {
  custom: CustomNode,
}

export default function RelationshipGraph({ graphData }: RelationshipGraphProps) {
  const [visibleNodeTypes, setVisibleNodeTypes] = useState<Set<string>>(
    new Set(['vendor', 'ide', 'cli', 'extension', 'model', 'provider'])
  )

  // Convert graph data to React Flow format with layout
  const { initialNodes, initialEdges } = useMemo(() => {
    // Simple force-directed layout approximation
    const vendors = graphData.nodes.filter(n => n.type === 'vendor')
    const products = graphData.nodes.filter(n => n.type !== 'vendor')

    const nodes: Node[] = []
    const addedNodeIds = new Set<string>()
    const productRadius = 200

    // Layout vendors in a circle
    vendors.forEach((vendor, i) => {
      const angle = (i / vendors.length) * 2 * Math.PI
      const x = 500 + Math.cos(angle) * 400
      const y = 400 + Math.sin(angle) * 400

      if (!addedNodeIds.has(vendor.id)) {
        nodes.push({
          id: vendor.id,
          type: 'custom',
          position: { x, y },
          data: {
            label: vendor.data.label,
            type: vendor.type,
            description: vendor.data.description,
          },
          sourcePosition: Position.Right,
          targetPosition: Position.Left,
        })
        addedNodeIds.add(vendor.id)
      }
    })

    // Layout products around their vendors
    const productsByVendor = new Map<string, RelationshipNode[]>()
    products.forEach(product => {
      const vendorId = product.data.vendorId
      if (vendorId) {
        const vendorNodeId = `vendor-${vendorId}`
        if (!productsByVendor.has(vendorNodeId)) {
          productsByVendor.set(vendorNodeId, [])
        }
        productsByVendor.get(vendorNodeId)!.push(product)
      }
    })

    productsByVendor.forEach((prods, vendorId) => {
      const vendorNode = nodes.find(n => n.id === vendorId)
      if (!vendorNode) return

      prods.forEach((product, i) => {
        const angle = (i / prods.length) * 2 * Math.PI
        const x = vendorNode.position.x + Math.cos(angle) * productRadius
        const y = vendorNode.position.y + Math.sin(angle) * productRadius

        if (!addedNodeIds.has(product.id)) {
          nodes.push({
            id: product.id,
            type: 'custom',
            position: { x, y },
            data: {
              label: product.data.label,
              type: product.type,
              category: product.data.category,
              description: product.data.description,
            },
            sourcePosition: Position.Right,
            targetPosition: Position.Left,
          })
          addedNodeIds.add(product.id)
        }
      })
    })

    const edges: Edge[] = graphData.edges.map(edge => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: edge.type === 'extension-ide',
      style: {
        stroke: EDGE_COLORS[edge.type] || '#64748b',
        strokeWidth: edge.type === 'vendor-product' ? 2 : 1,
        opacity: edge.type === 'vendor-product' ? 0.6 : 0.4,
      },
      label: edge.label,
      labelStyle: {
        fill: '#94a3b8',
        fontSize: 10,
      },
    }))

    return { initialNodes: nodes, initialEdges: edges }
  }, [graphData])

  const [nodes, , onNodesChange] = useNodesState(initialNodes)
  const [edges, , onEdgesChange] = useEdgesState(initialEdges)

  // Filter nodes and edges based on visible types
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeData = node.data as NodeData
      return visibleNodeTypes.has(nodeData.type)
    })
  }, [nodes, visibleNodeTypes])

  const filteredEdges = useMemo(() => {
    const visibleNodeIds = new Set(filteredNodes.map(n => n.id))
    return edges.filter(edge => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target))
  }, [edges, filteredNodes])

  const toggleNodeType = (type: string) => {
    const newSet = new Set(visibleNodeTypes)
    if (newSet.has(type)) {
      // Don't allow hiding vendors
      if (type === 'vendor') return
      newSet.delete(type)
    } else {
      newSet.add(type)
    }
    setVisibleNodeTypes(newSet)
  }

  const nodeTypeCategories: { key: string; label: string; icon: string }[] = [
    { key: 'vendor', label: 'Vendors', icon: '🏢' },
    { key: 'ide', label: 'IDEs', icon: '📝' },
    { key: 'cli', label: 'CLIs', icon: '💻' },
    { key: 'extension', label: 'Extensions', icon: '🔌' },
    { key: 'model', label: 'Models', icon: '🤖' },
    { key: 'provider', label: 'Providers', icon: '🔑' },
  ]

  return (
    <div className="space-y-[var(--spacing-md)]">
      {/* Controls */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-[var(--color-text-secondary)] mr-2">Show:</span>
        {nodeTypeCategories.map(cat => (
          <button
            key={cat.key}
            type="button"
            onClick={() => toggleNodeType(cat.key)}
            disabled={cat.key === 'vendor'}
            className={`px-3 py-1 text-xs border transition-all flex items-center gap-1 ${
              visibleNodeTypes.has(cat.key)
                ? 'border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)]'
                : 'border-[var(--color-border)] opacity-50'
            } ${cat.key === 'vendor' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Graph Container */}
      <div className="h-[700px] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] rounded-lg overflow-hidden">
        <ReactFlow
          nodes={filteredNodes}
          edges={filteredEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#334155" />
          <Controls className="bg-[var(--color-bg)] border border-[var(--color-border)]" />
          <MiniMap
            className="bg-[var(--color-bg)] border border-[var(--color-border)]"
            nodeColor={node => {
              const nodeData = node.data as NodeData
              const colors = NODE_COLORS[nodeData.type]
              return colors?.border || '#64748b'
            }}
          />
        </ReactFlow>
      </div>

      {/* Legend */}
      <div className="border-t border-[var(--color-border)] pt-[var(--spacing-md)]">
        <p className="text-xs text-[var(--color-text-muted)] mb-2">Relationship Types:</p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px]" style={{ background: EDGE_COLORS['vendor-product'] }} />
            <span className="text-[var(--color-text-secondary)]">Vendor → Product</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px]" style={{ background: EDGE_COLORS['extension-ide'] }} />
            <span className="text-[var(--color-text-secondary)]">Extension → IDE (Animated)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-[2px]" style={{ background: EDGE_COLORS['related-product'] }} />
            <span className="text-[var(--color-text-secondary)]">Related Products</span>
          </div>
        </div>
      </div>
    </div>
  )
}
