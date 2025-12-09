import React, { useState } from 'react';
import { Play, Code, GitBranch, CheckCircle, AlertCircle } from 'lucide-react';
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('intro');
  const [symbolicResult, setSymbolicResult] = useState(null);
  const [concolicResult, setConcolicResult] = useState(null);
  const [hoareResult, setHoareResult] = useState(null);

  const runSymbolic = () => {
    setSymbolicResult({
      paths: [
        { condition: 'x > 0 && y > 0', result: 'x + y', constraints: ['x > 0', 'y > 0'] },
        { condition: 'x > 0 && y ≤ 0', result: 'x - y', constraints: ['x > 0', 'y ≤ 0'] },
        { condition: 'x ≤ 0 && y > 0', result: 'y - x', constraints: ['x ≤ 0', 'y > 0'] },
        { condition: 'x ≤ 0 && y ≤ 0', result: '0', constraints: ['x ≤ 0', 'y ≤ 0'] }
      ]
    });
  };

  const runConcolic = () => {
    setConcolicResult({
      executions: [
        { input: 'x=5, y=3', path: 'x > 0 && y > 0', output: 8, newConstraints: ['x > 0', 'y ≤ 0'] },
        { input: 'x=5, y=-2', path: 'x > 0 && y ≤ 0', output: 7, newConstraints: ['x ≤ 0', 'y > 0'] },
        { input: 'x=-3, y=4', path: 'x ≤ 0 && y > 0', output: 7, newConstraints: ['x ≤ 0', 'y ≤ 0'] },
        { input: 'x=-2, y=-5', path: 'x ≤ 0 && y ≤ 0', output: 0, newConstraints: [] }
      ]
    });
  };

  const verifyHoare = (program) => {
    const results = {
      linear: {
        precondition: '{ x ≥ 0 }',
        code: 'y = x + 5;\nz = y * 2;',
        postcondition: '{ z = 2x + 10 }',
        proof: [
          '{ x ≥ 0 } // Précondition',
          'y = x + 5;',
          '{ y = x + 5 } // Substitution arrière',
          'z = y * 2;',
          '{ z = 2y = 2(x + 5) = 2x + 10 } // Postcondition',
          '✓ Preuve valide'
        ]
      },
      conditional: {
        precondition: '{ x ≥ 0 }',
        code: 'if (x > 10) {\n  y = x - 10;\n} else {\n  y = x;\n}',
        postcondition: '{ y ≥ 0 && y ≤ x }',
        proof: [
          '{ x ≥ 0 } // Précondition',
          'Branche 1: x > 10',
          '  { x ≥ 0 && x > 10 }',
          '  y = x - 10;',
          '  { y = x - 10 && x > 10 } ⟹ { y ≥ 0 && y ≤ x } ✓',
          'Branche 2: x ≤ 10',
          '  { x ≥ 0 && x ≤ 10 }',
          '  y = x;',
          '  { y = x && x ≥ 0 } ⟹ { y ≥ 0 && y ≤ x } ✓',
          '✓ Les deux branches valident la postcondition'
        ]
      },
      loop: {
        precondition: '{ n ≥ 0 }',
        code: 'sum = 0;\ni = 0;\nwhile (i < n) {\n  sum = sum + i;\n  i = i + 1;\n}',
        postcondition: '{ sum = n(n-1)/2 }',
        invariant: '{ sum = i(i-1)/2 && i ≤ n }',
        proof: [
          '{ n ≥ 0 } // Précondition',
          'sum = 0; i = 0;',
          '{ sum = 0 && i = 0 } ⟹ { sum = i(i-1)/2 } // Invariant initial',
          'while (i < n) {',
          '  { sum = i(i-1)/2 && i < n } // Invariant + garde',
          '  sum = sum + i;',
          '  { sum = i(i-1)/2 + i = i(i+1)/2 }',
          '  i = i + 1;',
          '  { sum = (i-1)i/2 = i(i-1)/2 } // Invariant préservé',
          '}',
          '{ sum = i(i-1)/2 && i ≥ n } ⟹ { sum = n(n-1)/2 } ✓',
          '✓ Invariant prouvé, postcondition valide'
        ]
      }
    };
    setHoareResult(results[program]);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Vérification Formelle: Guide Pratique
        </h1>
        <p className="text-gray-600">
          Model Checking, Exécution Symbolique/Concolique, et Logique de Hoare
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { id: 'intro', label: 'Introduction' },
          { id: 'symbolic', label: 'Exécution Symbolique' },
          { id: 'concolic', label: 'Exécution Concolique' },
          { id: 'hoare', label: 'Logique de Hoare' },
          { id: 'tools', label: 'Outils' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'intro' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Model Checking</h2>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-gray-700 mb-2">
                <strong>Définition:</strong> Technique automatique pour vérifier qu'un système satisfait des propriétés formelles.
              </p>
              <p className="text-gray-700">
                Le model checker explore tous les états possibles du système pour vérifier les propriétés.
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded font-mono text-sm">
              Propriété: □(request → ◇grant)<br/>
              "Toute requête sera éventuellement accordée"
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">2. Différences Clés</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border-2 border-purple-300 rounded-lg p-4">
                <h3 className="font-bold text-purple-700 mb-2">Exécution Symbolique</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Utilise des symboles au lieu de valeurs concrètes</li>
                  <li>• Explore tous les chemins simultanément</li>
                  <li>• Génère des contraintes sur les symboles</li>
                  <li>• Problème: explosion des chemins</li>
                </ul>
              </div>
              <div className="border-2 border-green-300 rounded-lg p-4">
                <h3 className="font-bold text-green-700 mb-2">Exécution Concolique</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Combine exécution concrète et symbolique</li>
                  <li>• Commence avec des valeurs concrètes</li>
                  <li>• Génère des contraintes en parallèle</li>
                  <li>• Plus scalable, explore progressivement</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'symbolic' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <GitBranch className="text-purple-600" />
            Exécution Symbolique
          </h2>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Programme d'exemple:</h3>
            <pre className="font-mono text-sm">
{`int compute(int x, int y) {
  if (x > 0) {
    if (y > 0) {
      return x + y;
    } else {
      return x - y;
    }
  } else {
    if (y > 0) {
      return y - x;
    } else {
      return 0;
    }
  }
}`}
            </pre>
          </div>

          <button
            onClick={runSymbolic}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2 mb-4"
          >
            <Play size={20} />
            Exécuter Symboliquement
          </button>

          {symbolicResult && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Arbres d'Exécution Symbolique:</h3>
              {symbolicResult.paths.map((path, idx) => (
                <div key={idx} className="border-l-4 border-purple-500 pl-4 py-2 bg-purple-50 rounded">
                  <div className="font-bold text-purple-700">Chemin {idx + 1}:</div>
                  <div className="text-sm mt-1">
                    <div><strong>Condition:</strong> {path.condition}</div>
                    <div><strong>Résultat:</strong> {path.result}</div>
                    <div><strong>Contraintes:</strong> {path.constraints.join(', ')}</div>
                  </div>
                </div>
              ))}
              <div className="bg-green-50 border border-green-300 p-4 rounded-lg">
                <CheckCircle className="inline text-green-600 mr-2" />
                <strong>Tous les chemins explorés:</strong> {symbolicResult.paths.length} chemins possibles
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'concolic' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Play className="text-green-600" />
            Exécution Concolique (Concrete + Symbolic)
          </h2>
          
          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-bold mb-2">Même programme:</h3>
            <p className="text-sm text-gray-600 mb-2">
              L'exécution concolique commence avec des valeurs concrètes et explore progressivement les chemins.
            </p>
            <pre className="font-mono text-sm">
{`int compute(int x, int y) {
  // Démarre avec x=5, y=3
  if (x > 0) {      // true
    if (y > 0) {    // true, explore ensuite false
      return x + y;
    } ...
  }
}`}
            </pre>
          </div>

          <button
            onClick={runConcolic}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 mb-4"
          >
            <Play size={20} />
            Exécuter en Mode Concolique
          </button>

          {concolicResult && (
            <div className="space-y-4">
              <h3 className="font-bold text-lg">Exécutions Successives:</h3>
              {concolicResult.executions.map((exec, idx) => (
                <div key={idx} className="border-l-4 border-green-500 pl-4 py-2 bg-green-50 rounded">
                  <div className="font-bold text-green-700">Exécution {idx + 1}:</div>
                  <div className="text-sm mt-1">
                    <div><strong>Entrée concrète:</strong> {exec.input}</div>
                    <div><strong>Chemin pris:</strong> {exec.path}</div>
                    <div><strong>Sortie:</strong> {exec.output}</div>
                    <div><strong>Nouvelles contraintes générées:</strong> {exec.newConstraints.join(', ') || 'Aucune (tous les chemins explorés)'}</div>
                  </div>
                </div>
              ))}
              <div className="bg-blue-50 border border-blue-300 p-4 rounded-lg">
                <strong>Avantage:</strong> Exploration progressive et guidée par des valeurs concrètes, plus efficace pour les grands programmes.
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'hoare' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Logique de Hoare</h2>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Triple de Hoare:</h3>
            <div className="font-mono text-lg text-center my-4">
              {'{P}'} C {'{Q}'}
            </div>
            <p className="text-sm text-gray-700">
              Si la précondition P est vraie avant l'exécution de C, alors la postcondition Q sera vraie après.
            </p>
          </div>

          <div className="grid gap-4 mb-6">
            <button
              onClick={() => verifyHoare('linear')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-left"
            >
              <div className="font-bold">1. Programme Linéaire (séquence)</div>
              <div className="text-sm opacity-90">Sans branchement ni boucle</div>
            </button>
            <button
              onClick={() => verifyHoare('conditional')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-left"
            >
              <div className="font-bold">2. Programme avec Condition</div>
              <div className="text-sm opacity-90">Instruction if-else</div>
            </button>
            <button
              onClick={() => verifyHoare('loop')}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 text-left"
            >
              <div className="font-bold">3. Programme avec Boucle</div>
              <div className="text-sm opacity-90">Nécessite un invariant de boucle</div>
            </button>
          </div>

          {hoareResult && (
            <div className="space-y-4">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Code du Programme:</h3>
                <pre className="font-mono text-sm whitespace-pre-wrap">{hoareResult.code}</pre>
              </div>

              <div className="border-2 border-blue-300 rounded-lg p-4">
                <div className="font-bold text-blue-700 mb-2">Spécification:</div>
                <div className="space-y-1 text-sm">
                  <div><strong>Précondition:</strong> <span className="font-mono">{hoareResult.precondition}</span></div>
                  <div><strong>Postcondition:</strong> <span className="font-mono">{hoareResult.postcondition}</span></div>
                  {hoareResult.invariant && (
                    <div><strong>Invariant de boucle:</strong> <span className="font-mono">{hoareResult.invariant}</span></div>
                  )}
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4">
                <h3 className="font-bold text-green-700 mb-2">Preuve:</h3>
                <div className="space-y-1 font-mono text-sm">
                  {hoareResult.proof.map((line, idx) => (
                    <div key={idx} className={line.includes('✓') ? 'text-green-700 font-bold' : 'text-gray-700'}>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tools' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Code />
            Outils de Vérification
          </h2>

          <div className="space-y-6">
            <div className="border-2 border-blue-300 rounded-lg p-4">
              <h3 className="text-xl font-bold text-blue-700 mb-3">Model Checkers</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-bold">SPIN</div>
                  <div className="text-sm text-gray-600">Pour systèmes concurrents, langage Promela</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">spin -a model.pml && gcc -o pan pan.c && ./pan</code>
                </div>
                <div>
                  <div className="font-bold">NuSMV / nuXmv</div>
                  <div className="text-sm text-gray-600">Model checker symbolique, logique temporelle CTL/LTL</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">NuSMV model.smv</code>
                </div>
                <div>
                  <div className="font-bold">TLA+</div>
                  <div className="text-sm text-gray-600">Spécification de systèmes distribués</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">java -jar tla2tools.jar Model.tla</code>
                </div>
              </div>
            </div>

            <div className="border-2 border-purple-300 rounded-lg p-4">
              <h3 className="text-xl font-bold text-purple-700 mb-3">Exécution Symbolique</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-bold">KLEE</div>
                  <div className="text-sm text-gray-600">Pour programmes C/C++, basé sur LLVM</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">clang -emit-llvm -c program.c && klee program.bc</code>
                </div>
                <div>
                  <div className="font-bold">angr</div>
                  <div className="text-sm text-gray-600">Framework Python pour analyse binaire</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">pip install angr</code>
                </div>
                <div>
                  <div className="font-bold">Symbolic PathFinder (SPF)</div>
                  <div className="text-sm text-gray-600">Pour programmes Java</div>
                </div>
              </div>
            </div>

            <div className="border-2 border-green-300 rounded-lg p-4">
              <h3 className="text-xl font-bold text-green-700 mb-3">Exécution Concolique</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-bold">CUTE / DART</div>
                  <div className="text-sm text-gray-600">Pionniers de l'exécution concolique</div>
                </div>
                <div>
                  <div className="font-bold">SAGE (Microsoft)</div>
                  <div className="text-sm text-gray-600">Fuzzing à grande échelle</div>
                </div>
                <div>
                  <div className="font-bold">jCUTE / CATG</div>
                  <div className="text-sm text-gray-600">Pour programmes Java</div>
                </div>
              </div>
            </div>

            <div className="border-2 border-indigo-300 rounded-lg p-4">
              <h3 className="text-xl font-bold text-indigo-700 mb-3">Prouveurs / Logique de Hoare</h3>
              <div className="space-y-3">
                <div>
                  <div className="font-bold">Frama-C</div>
                  <div className="text-sm text-gray-600">Framework pour analyse de code C avec WP (Weakest Precondition)</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">frama-c -wp program.c</code>
                </div>
                <div>
                  <div className="font-bold">Dafny</div>
                  <div className="text-sm text-gray-600">Langage avec vérification intégrée</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">dafny /compile:0 program.dfy</code>
                </div>
                <div>
                  <div className="font-bold">Why3</div>
                  <div className="text-sm text-gray-600">Plateforme de preuve déductive</div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">why3 prove program.mlw</code>
                </div>
                <div>
                  <div className="font-bold">Coq</div>
                  <div className="text-sm text-gray-600">Assistant de preuve interactif</div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
              <h3 className="font-bold text-yellow-800 mb-2">Installation Recommandée</h3>
              <pre className="text-xs bg-gray-800 text-green-400 p-3 rounded overflow-x-auto">
{`# KLEE (Docker recommandé)
docker pull klee/klee
docker run --rm -ti klee/klee

# Frama-C
sudo apt-get install frama-c

# SPIN
sudo apt-get install spin

# Dafny
wget https://github.com/dafny-lang/dafny/releases/latest`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App