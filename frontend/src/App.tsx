import { useState } from 'react';
import './index.css';

type SimulationType = 'audio' | 'video' | 'photo' | 'live';

function App() {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready'>('idle');
  const [logs, setLogs] = useState<any[]>([]);
  const [activeType, setActiveType] = useState<SimulationType | null>(null);
  
  const [liveModeType, setLiveModeType] = useState<'text' | 'audio'>('text');
  const [liveText, setLiveText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSimulateIntake = (type: SimulationType) => {
    if (type === 'live' && !liveText && liveModeType === 'text') return; // Prevent empty simulation

    setActiveType(type);
    setStatus('uploading');
    setLogs([]);
    
    const mediaType = type === 'live' ? liveModeType.toUpperCase() : type.toUpperCase();
    addLog('System', `Initiating secure ${mediaType} intake transmission to Google Cloud Storage...`);
    
    setTimeout(() => {
      setStatus('processing');
      addLog('AetherBridge', `Media vaulted. Handing off to Gemini 1.5 Pro Multi-Modal model...`);
      
      setTimeout(() => {
        addLog('Vertex AI', `Analyzing unstructured ${mediaType} data for chaotic crisis indicators...`);
        

        setTimeout(async () => {
           let intent, entities, conf;
           
           if (type === 'audio' || type === 'video' || type === 'photo') {
              // Static preset mocks
              if (type === 'audio') {
                 intent = 'MEDICAL_EMERGENCY';
                 entities = { patient: "[REDACTED_BY_DLP]", location: "Main Highway 42", severity: "CRITICAL", recommended_actions: ["Dispatch ALS Ambulance", "Prepare Trauma Bay"] };
                 conf = 0.94;
              } else if (type === 'video') {
                 intent = 'INFRASTRUCTURE_ISSUE';
                 entities = { structure: "Bridge A", damage: "Structural failure detected", recommended_actions: ["Close structural traffic", "Dispatch Engineering Inspection"] };
                 conf = 0.89;
              } else {
                 intent = 'SOS_UNKNOWN';
                 entities = { reporter: "[REDACTED_BY_DLP]", location: "Sector 7G", recommended_actions: ["Attempt communication with reporter", "Dispatch scouting drone"] };
                 conf = 0.72;
              }
           } else {
              try {
                addLog('AetherBridge Server', 'Securely relaying payload to Google Cloud backend...');
                
                // Hitting the secure backend proxy instead of exposing keys in the React client!
                const response = await fetch(`/api/v1/live-evaluate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ liveText })
                });

                const data = await response.json();
                
                if (data.error) throw new Error(data.error.message);
                if (!data.candidates || data.candidates.length === 0) throw new Error("Safety Block or Empty Candidate");
                
                const rawJson = data.candidates[0].content.parts[0].text;
                const parsed = JSON.parse(rawJson.replace(/```json/g, '').replace(/```/g, '').trim());

                intent = parsed.intent || 'TEXT_OBSERVATION';
                entities = parsed.entities || { transcript: liveText, recommended_actions: ["Review report"] };
                conf = parsed.confidence || 0.98;
                addLog('Gemini 1.5 API', 'Analysis complete. Output structure locked successfully.');
              } catch (err: any) {
                console.error("Gemini failed:", err);
                intent = "API_ERROR";
                conf = 0.0;
                entities = { transcript: liveText, error: err.message, recommended_actions: ["Ensure API key is valid"] };
              }
           }

           addLog('Cloud DLP (Mock)', `PII Scrubbed successfully. Sensitive entities masked.`);
           
           setTimeout(() => {
             setStatus('ready');
             const isVerified = conf >= 0.85;
             addLog('System', `Instantly converts them into structured, verified, and life-saving actions.`);
             setLogs(prev => [...prev, {
                source: 'System',
                actionPack: {
                  intent,
                  confidence: conf,
                  entities,
                  verification: { 
                    status: isVerified ? "VERIFIED" : "REQUIRES_REVIEW", 
                    ground_truth_source: isVerified ? "Vertex AI Evaluator" : "Human-In-The-Loop Required" 
                  }
                }
             }]);
           }, 800);
        }, 1500);
      }, 1500);
    }, 1500);
  };

  const addLog = (source: string, msg: string) => {
    setLogs(prev => [...prev, { source, msg, time: new Date().toLocaleTimeString() }]);
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      handleSimulateIntake('live'); // Trigger evaluation upon stopping recording
    } else {
      setIsRecording(true);
      setLiveModeType('audio');
      setActiveType('live');
    }
  };

  return (
    <>
      <div className="ambient-orb orb-primary"></div>
      <div className="ambient-orb orb-danger"></div>

      <main>
        <header style={{ marginBottom: '2rem' }}>
          <h1 className="title">AetherBridge Console</h1>
          <p className="subtitle">Instantly converts them into structured, verified, and life-saving actions.</p>
        </header>

        <div className="dashboard">
          {/* Left Column: Intake */}
          <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <h2>
              <span className={`status-indicator ${status !== 'idle' ? 'status-active' : 'status-pending'}`}></span>
              Multi-Modal Intake Simulator
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              Select a transmission type or input live data to trigger the Vertex AI pipeline.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
              
              {/* Live Interactive Intake Box */}
              <div style={{ background: 'hsla(0,0%,0%,0.3)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--accent-glow)' }}>
                 <h3 style={{color: '#fff', fontWeight: 500, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                   ⚡ Interactive Live Evaluation
                 </h3>
                 
                 <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button 
                      onClick={() => setLiveModeType('text')} 
                      style={{ 
                        background: liveModeType === 'text' ? 'hsla(210, 80%, 60%, 0.3)' : 'hsla(210, 80%, 60%, 0.1)',
                        border: '1px solid hsla(210, 80%, 60%, 0.4)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                      ⌨️ Type Text
                    </button>
                    <button 
                      onClick={() => setLiveModeType('audio')} 
                      style={{ 
                        background: liveModeType === 'audio' ? 'hsla(0, 80%, 60%, 0.3)' : 'hsla(0, 80%, 60%, 0.1)',
                        border: '1px solid hsla(0, 80%, 60%, 0.4)', color: '#fff', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer'
                      }}
                    >
                       🎙️ Record Audio
                    </button>
                 </div>

                 {liveModeType === 'text' ? (
                   <>
                    <textarea 
                      placeholder="Type a chaotic emergency report (e.g., 'There's a massive leak on 5th avenue and 3 cars are trapped!')"
                      value={liveText}
                      onChange={(e) => setLiveText(e.target.value)}
                      style={{ 
                        width: '100%', minHeight: '100px', background: 'hsla(0,0%,100%,0.05)', border: '1px solid hsla(0,0%,100%,0.1)',
                        color: 'white', padding: '1rem', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1rem'
                      }}
                    />
                    <button className="btn-primary" onClick={() => handleSimulateIntake('live')} disabled={!liveText || status !== 'idle'} style={{ width: '100%', justifyContent: 'center' }}>
                      Analyze Live Text
                    </button>
                   </>
                 ) : (
                   <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                     <button 
                       className="btn-danger" 
                       onClick={toggleRecording} 
                       disabled={status !== 'idle' && !isRecording}
                       style={{ 
                         width: '100%', justifyContent: 'center', padding: '1.5rem', fontSize: '1.2rem',
                         animation: isRecording ? 'pulse 1s infinite' : 'none',
                         background: isRecording ? 'hsla(0, 80%, 60%, 0.4)' : undefined
                       }}
                     >
                       {isRecording ? '🛑 Stop Recording & Analyze' : '🔴 Start Audio Broadcast'}
                     </button>
                     {isRecording && <p style={{ marginTop: '1rem', color: 'var(--accent-emergency)' }}>Listening... Model active.</p>}
                   </div>
                 )}
              </div>

               <div className={`dropzone ${activeType === 'audio' ? 'active' : ''}`} onClick={() => status === 'idle' && handleSimulateIntake('audio')}>
                 <h3 style={{color: '#fff', fontWeight: 500, marginBottom: '0.5rem'}}>🎙️ Preset: Audio SOS (Medical)</h3>
                 <p>Simulates a panicked 911 voice call. Triggers high-confidence extraction.</p>
               </div>
               <div className={`dropzone ${activeType === 'video' ? 'active' : ''}`} onClick={() => status === 'idle' && handleSimulateIntake('video')}>
                 <h3 style={{color: '#fff', fontWeight: 500, marginBottom: '0.5rem'}}>🚁 Preset: Drone Video (Infrastructure)</h3>
                 <p>Visual stream of damage. Multi-modal spatial analysis.</p>
               </div>
               <div className={`dropzone ${activeType === 'photo' ? 'active' : ''}`} onClick={() => status === 'idle' && handleSimulateIntake('photo')}>
                 <h3 style={{color: '#fff', fontWeight: 500, marginBottom: '0.5rem'}}>📷 Preset: Photo Report (Low Config)</h3>
                 <p>A blurry image. Tests the &lt; 0.85 Verification Threshold routing.</p>
               </div>
            </div>

            {status !== 'idle' && (
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <button className="btn-danger" onClick={() => { setStatus('idle'); setLogs([]); setActiveType(null); setIsRecording(false); }}>
                  Reset Pipeline State
                </button>
              </div>
            )}
          </section>

          {/* Right Column: Ground Truth & Relay */}
          <section className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>Neural Processing Logs</h2>
              <div style={{ fontSize: '0.8rem', background: 'hsla(0,0%,100%,0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px', color: 'var(--text-secondary)' }}>
                DLP Active | Threshold: 0.85
              </div>
            </div>

            <div className="log-box" style={{ flexGrow: 1, minHeight: '400px' }}>
              {logs.length === 0 ? (
                <div style={{ opacity: 0.5, textAlign: 'center', marginTop: '2rem' }}>Awaiting transmission...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="log-entry">
                    <span style={{ color: 'hsla(0,0%,100%,0.4)' }}>[{log.time}] </span>
                    <strong style={{ color: 'var(--accent-glow)' }}>{log.source}: </strong>
                    {log.msg}
                    
                    {log.actionPack && (
                      <div style={{ marginTop: '1rem', padding: '1.2rem', background: 'hsla(240, 20%, 15%, 0.8)', borderRadius: '8px', border: '1px solid hsla(0,0%,100%,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid hsla(0,0%,100%,0.1)', paddingBottom: '0.5rem', marginBottom: '0.8rem' }}>
                           <strong style={{ color: '#fff', fontSize: '1.1rem' }}>⚡ {log.actionPack.intent}</strong>
                           <span style={{ color: log.actionPack.confidence >= 0.85 ? 'var(--accent-success)' : 'var(--accent-emergency)' }}>
                              Conf: {(log.actionPack.confidence * 100).toFixed(0)}%
                           </span>
                        </div>
                        
                        <div style={{ display: 'grid', gap: '0.5rem', marginBottom: '1rem' }}>
                           {Object.entries(log.actionPack.entities).map(([k, v]) => (
                             <div key={k} style={{ display: 'flex' }}>
                               <span style={{ color: 'var(--text-secondary)', width: '100px', flexShrink: 0 }}>{k}:</span>
                               <span style={{ color: String(v).includes('[REDACTED') ? 'var(--accent-emergency)' : '#fff', wordBreak: 'break-word', flex: 1 }}>
                                 {Array.isArray(v) ? (
                                   <ul style={{ paddingLeft: '1.2rem', margin: 0 }}>
                                     {v.map((item, idx) => <li key={idx} style={{ color: 'var(--accent-success)', marginBottom: '0.2rem' }}>{item}</li>)}
                                   </ul>
                                 ) : (
                                   String(v)
                                 )}
                               </span>
                             </div>
                           ))}
                        </div>

                        <div className={`intent-badge ${log.actionPack.verification.status === 'VERIFIED' ? 'verified' : 'review'}`} style={{ display: 'inline-block', padding: '0.4rem 0.8rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                          {log.actionPack.verification.status} 
                          <span style={{ fontWeight: 400, opacity: 0.8, marginLeft: '0.5rem' }}>
                            via {log.actionPack.verification.ground_truth_source}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
