import sys

with open('frontend/src/app/(app)/daily-practice/ai-conversation/page.jsx', 'r') as f:
    content = f.read()

# Change initial state
old_state = "const [convState, setConvState] = useState('intro'); // 'intro', 'live', 'ended', 'feedback'"
new_state = "const [convState, setConvState] = useState('live'); // 'live', 'ended', 'feedback'"
content = content.replace(old_state, new_state)

# Remove intro block
# We will use regex or string replace to remove the `{convState === 'intro' && (...)}` block
intro_start = "{convState === 'intro' && ("
live_start = "{convState === 'live' && ("

idx_intro = content.find(intro_start)
idx_live = content.find(live_start)

if idx_intro != -1 and idx_live != -1:
    content = content[:idx_intro] + content[idx_live:]

# Remove unused functions if needed, but not strictly necessary

# Ensure the live call screen does not show metrics, side panels, etc.
# Requirements: "STEP 1 - LIVE CALL SCREEN: Immediately show ONLY glowing microphone orb, animated waveform bars, AI listening text, End call button."
# "DO NOT SHOW: live communication metrics, feedback side panels, live score cards"

live_content_old = """          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 30, width: '100%', maxWidth: 1000 }}>
            <GlassCard style={{ 
              padding: '60px 40px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 500,
              background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
            }}>
              <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                {isUserSpeaking ? (
                  <>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: C.textPrimary, marginBottom: 8, animation: 'shimmer 2s infinite' }}>The AI is listening...</h3>
                    <p style={{ color: C.textSecondary, fontSize: '0.95rem' }}>Speak without any pressure.</p>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.success || '#10B981', fontWeight: 600, marginBottom: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success || '#10B981', animation: 'pulse 1s infinite' }} />
                      AI Responding
                    </div>
                  </>
                )}
              </div>

              <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                  border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite', pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                  border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(167, 139, 250, 0.15)'}`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s', pointerEvents: 'none'
                }} />

                <div 
                  className={isAiSpeaking ? 'mic-ai' : 'mic-user'}
                  style={{ 
                    width: 150, height: 150, borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', color: '#fff', transition: 'all 0.4s ease', zIndex: 10,
                    boxShadow: `0 0 40px ${isAiSpeaking ? 'rgba(16, 185, 129, 0.5)' : 'rgba(167, 139, 250, 0.5)'}`
                  }}>
                  {isAiSpeaking ? '📞' : '🎙️'}
                </div>
              </div>

              <div style={{ height: 60, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 40, opacity: 1, transition: 'opacity 0.4s ease' }}>
                <MicWave active={true} color={isAiSpeaking ? '#10B981' : undefined} />
              </div>
            </GlassCard>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <GlassCard style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: C.textPrimary, marginBottom: 16 }}>Live Communication Metrics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 'auto', marginBottom: 'auto' }}>
                  <ProgressBar label="Fluency" value={88} color={C.primary} />
                  <ProgressBar label="Clarity" value={92} color={C.secondary} />
                  <ProgressBar label="Confidence" value={85} color="#3B82F6" />
                  <ProgressBar label="Pace" value={76} color={C.success || '#10B981'} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    <span style={{ fontSize: '0.85rem', color: C.textSecondary, fontWeight: 500 }}>Filler Usage</span>
                    <span style={{ fontSize: '0.9rem', color: C.error || '#EF4444', fontWeight: 700 }}>Low (2)</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard style={{ padding: '24px', background: `linear-gradient(to bottom right, rgba(167, 139, 250, 0.05), transparent)`, borderLeft: `4px solid ${C.primary}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.primary, animation: 'pulse 2s infinite' }} />
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: C.textSecondary, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>AI Live Insight</h3>
                </div>
                <div style={{ fontSize: '1.05rem', color: C.textPrimary, lineHeight: 1.5, fontStyle: 'italic' }}>
                  "You're speaking confidently. Nice pacing between thoughts."
                </div>
              </GlassCard>
            </div>
          </div>"""

live_content_new = """          <div style={{ width: '100%', maxWidth: 700 }}>
            <GlassCard style={{ 
              padding: '80px 40px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              minHeight: 500,
              background: `radial-gradient(circle at center, rgba(167, 139, 250, 0.05) 0%, transparent 70%)`
            }}>
              <div style={{ height: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
                {isUserSpeaking ? (
                  <>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 600, color: C.textPrimary, marginBottom: 8, animation: 'shimmer 2s infinite' }}>The AI is listening...</h3>
                    <p style={{ color: C.textSecondary, fontSize: '0.95rem' }}>Speak without any pressure.</p>
                  </>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: C.success || '#10B981', fontWeight: 600, marginBottom: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: C.success || '#10B981', animation: 'pulse 1s infinite' }} />
                      AI Responding
                    </div>
                  </>
                )}
              </div>

              <div style={{ position: 'relative', width: 260, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                  border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite', pointerEvents: 'none'
                }} />
                <div style={{
                  position: 'absolute', width: '100%', height: '100%', borderRadius: '50%', 
                  border: `1px solid ${isAiSpeaking ? 'rgba(16, 185, 129, 0.15)' : 'rgba(167, 139, 250, 0.15)'}`,
                  animation: 'pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite 1.5s', pointerEvents: 'none'
                }} />

                <div 
                  className={isAiSpeaking ? 'mic-ai' : 'mic-user'}
                  style={{ 
                    width: 150, height: 150, borderRadius: '50%', 
                    background: `linear-gradient(135deg, ${C.primary}, ${C.secondary})`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3.5rem', color: '#fff', transition: 'all 0.4s ease', zIndex: 10,
                    boxShadow: `0 0 40px ${isAiSpeaking ? 'rgba(16, 185, 129, 0.5)' : 'rgba(167, 139, 250, 0.5)'}`
                  }}>
                  {isAiSpeaking ? '📞' : '🎙️'}
                </div>
              </div>

              <div style={{ height: 60, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 40, opacity: 1, transition: 'opacity 0.4s ease' }}>
                <MicWave active={true} color={isAiSpeaking ? '#10B981' : undefined} />
              </div>
            </GlassCard>
          </div>"""

content = content.replace(live_content_old, live_content_new)

# Make sure "Start Another Call" button goes to router.push('/daily-practice')
import re
content = re.sub(r"onClick=\{\(\) => setConvState\('intro'\)\}", "onClick={() => window.location.href = '/daily-practice'}", content)

with open('frontend/src/app/(app)/daily-practice/ai-conversation/page.jsx', 'w') as f:
    f.write(content)

