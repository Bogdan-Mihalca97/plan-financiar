
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ERDiagram = () => {
  return (
    <div className="w-full h-screen bg-gray-50 p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Schema Bazei de Date - BugetControl
        </h1>
        
        <div className="relative">
          {/* SVG Container for connections */}
          <svg 
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ minHeight: '800px' }}
          >
            {/* Connections between tables */}
            {/* profiles to transactions */}
            <line x1="200" y1="120" x2="400" y2="200" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* profiles to budgets */}
            <line x1="200" y1="140" x2="400" y2="320" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* profiles to goals */}
            <line x1="200" y1="160" x2="400" y2="440" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* profiles to investments */}
            <line x1="200" y1="180" x2="400" y2="560" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* profiles to family_memberships */}
            <line x1="300" y1="100" x2="600" y2="100" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* family_groups to family_memberships */}
            <line x1="800" y1="100" x2="700" y2="100" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* family_groups to family_invitations */}
            <line x1="850" y1="150" x2="850" y2="220" stroke="#374151" strokeWidth="2" markerEnd="url(#arrowhead)" />
            {/* family_groups to transactions (family) */}
            <line x1="800" y1="130" x2="500" y2="200" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            {/* family_groups to budgets (family) */}
            <line x1="800" y1="140" x2="500" y2="320" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            {/* family_groups to goals (family) */}
            <line x1="800" y1="150" x2="500" y2="440" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            {/* family_groups to investments (family) */}
            <line x1="800" y1="160" x2="500" y2="560" stroke="#374151" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead)" />
            
            {/* Arrow marker definition */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#374151" />
              </marker>
            </defs>
          </svg>

          {/* Tables */}
          <div className="relative z-10">
            {/* profiles - Main user table */}
            <Card className="absolute" style={{ top: '50px', left: '50px', width: '200px' }}>
              <CardHeader className="pb-2 bg-blue-100">
                <CardTitle className="text-lg text-blue-800">profiles</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-blue-700">🔑 id (UUID)</div>
                  <div>first_name</div>
                  <div>last_name</div>
                  <div>email</div>
                  <div className="text-xs text-gray-500">created_at, updated_at</div>
                </div>
              </CardContent>
            </Card>

            {/* transactions */}
            <Card className="absolute" style={{ top: '150px', left: '350px', width: '200px' }}>
              <CardHeader className="pb-2 bg-green-100">
                <CardTitle className="text-lg text-green-800">transactions</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-green-700">🔑 id (UUID)</div>
                  <div className="text-blue-600">👤 user_id</div>
                  <div>amount</div>
                  <div>type</div>
                  <div>category</div>
                  <div>description</div>
                  <div>date</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                </div>
              </CardContent>
            </Card>

            {/* budgets */}
            <Card className="absolute" style={{ top: '270px', left: '350px', width: '200px' }}>
              <CardHeader className="pb-2 bg-yellow-100">
                <CardTitle className="text-lg text-yellow-800">budgets</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-yellow-700">🔑 id (UUID)</div>
                  <div className="text-blue-600">👤 user_id</div>
                  <div>category</div>
                  <div>limit_amount</div>
                  <div>period</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                </div>
              </CardContent>
            </Card>

            {/* goals */}
            <Card className="absolute" style={{ top: '390px', left: '350px', width: '200px' }}>
              <CardHeader className="pb-2 bg-purple-100">
                <CardTitle className="text-lg text-purple-800">goals</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-purple-700">🔑 id (UUID)</div>
                  <div className="text-blue-600">👤 user_id</div>
                  <div>title</div>
                  <div>target_amount</div>
                  <div>current_amount</div>
                  <div>deadline</div>
                  <div>priority</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                </div>
              </CardContent>
            </Card>

            {/* investments */}
            <Card className="absolute" style={{ top: '510px', left: '350px', width: '200px' }}>
              <CardHeader className="pb-2 bg-indigo-100">
                <CardTitle className="text-lg text-indigo-800">investments</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-indigo-700">🔑 id (UUID)</div>
                  <div className="text-blue-600">👤 user_id</div>
                  <div>name</div>
                  <div>type</div>
                  <div>symbol</div>
                  <div>purchase_price</div>
                  <div>current_price</div>
                  <div>quantity</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                </div>
              </CardContent>
            </Card>

            {/* family_memberships */}
            <Card className="absolute" style={{ top: '50px', left: '600px', width: '200px' }}>
              <CardHeader className="pb-2 bg-orange-100">
                <CardTitle className="text-lg text-orange-800">family_memberships</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-orange-700">🔑 id (UUID)</div>
                  <div className="text-blue-600">👤 user_id</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                  <div>role</div>
                  <div>joined_at</div>
                </div>
              </CardContent>
            </Card>

            {/* family_groups */}
            <Card className="absolute" style={{ top: '50px', left: '850px', width: '200px' }}>
              <CardHeader className="pb-2 bg-red-100">
                <CardTitle className="text-lg text-red-800">family_groups</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-red-700">🔑 id (UUID)</div>
                  <div>name</div>
                  <div className="text-blue-600">👤 created_by</div>
                  <div className="text-xs text-gray-500">created_at, updated_at</div>
                </div>
              </CardContent>
            </Card>

            {/* family_invitations */}
            <Card className="absolute" style={{ top: '200px', left: '850px', width: '200px' }}>
              <CardHeader className="pb-2 bg-pink-100">
                <CardTitle className="text-lg text-pink-800">family_invitations</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-pink-700">🔑 id (UUID)</div>
                  <div className="text-purple-600">👥 family_group_id</div>
                  <div>email</div>
                  <div className="text-blue-600">👤 invited_by</div>
                  <div>status</div>
                  <div>expires_at</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-8 bg-white p-4 rounded-lg shadow-sm border">
          <h3 className="font-semibold mb-3">Legenda:</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Tabele utilizatori</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span>Tranzacții</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-100 border border-purple-300 rounded"></div>
              <span>Familie</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600">👤</span>
              <span>Legătură la utilizator</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-purple-600">👥</span>
              <span>Legătură la familie</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-gray-600"></div>
              <span>Relație directă</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-0.5 bg-gray-600" style={{ backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 2px, #374151 2px, #374151 4px)' }}></div>
              <span>Relație opțională</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ERDiagram;
