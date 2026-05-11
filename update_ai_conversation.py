import sys

with open('frontend/src/app/(app)/daily-practice/ai-conversation/page.jsx', 'r') as f:
    content = f.read()

# 1. Add keyframes
keyframes_old = """@keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }"""
keyframes_new = """@keyframes float-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.4); }
          50% { box-shadow: 0 0 30px rgba(167, 139, 250, 0.8); }
          100% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.4); }
        }"""
content = content.replace(keyframes_old, keyframes_new)

# 2. Replace intro block
intro_old = """{convState === 'intro' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
          <GlassCard style={{ 
            padding: '80px 40px', 
            position: 'relative', 
            overflow: 'hidden',
            width: '100%',
            maxWidth: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: `linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(17, 24, 39, 0.8))`,
            border: `1px solid ${C.primary}40`,
            boxShadow: `0 10px 50px ${C.primary}20`
          }}>
            <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: C.primary, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, background: C.secondary, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }} />
            
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 30, animation: 'breathe 4s infinite' }}>
              📞
            </div>
            
            <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: 20, color: '#fff', letterSpacing: '-0.02em' }}>Phone Call with AI</h1>
            <p style={{ color: '#D1D5DB', fontSize: '1.2rem', lineHeight: 1.6, maxWidth: 600, marginBottom: 16 }}>
              Practice natural voice conversations as if you're on a real phone call. Improve communication fluency, confidence, and impromptu speaking.
            </p>
            <p style={{ color: C.textSecondary, fontSize: '1.05rem', lineHeight: 1.6, maxWidth: 500, marginBottom: 50 }}>
              Speak freely for a few minutes and build stronger conversational confidence. No pressure. No judgment. Just real conversation practice.
            </p>
            
            <NeonButton variant="primary" onClick={handleStart} style={{ padding: '18px 48px', fontSize: '1.2rem', borderRadius: 40 }}>
              Start Call
            </NeonButton>
            <div style={{ fontSize: '0.85rem', color: C.textSecondary, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Voice-to-voice AI communication practice
            </div>
          </GlassCard>
        </div>
      )}"""

intro_new = """{convState === 'intro' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
          <GlassCard style={{ 
            padding: '60px 40px', 
            position: 'relative', 
            overflow: 'hidden',
            width: '100%',
            maxWidth: 800,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: `linear-gradient(135deg, rgba(30, 27, 75, 0.6), rgba(17, 24, 39, 0.8))`,
            border: `1px solid ${C.primary}40`,
            boxShadow: `0 10px 50px ${C.primary}20`
          }}>
            <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: C.primary, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, background: C.secondary, opacity: 0.15, filter: 'blur(100px)', borderRadius: '50%' }} />
            
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(167, 139, 250, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>
              📞
            </div>
            
            <h1 style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: 16, color: '#fff', letterSpacing: '-0.02em' }}>Phone Call with AI</h1>
            
            <div style={{ color: '#D1D5DB', fontSize: '1.15rem', lineHeight: 1.6, maxWidth: 600, marginBottom: 40 }}>
              <p style={{ margin: '0 0 8px 0' }}>Practice natural voice conversations as if you're on a real phone call.</p>
              <p style={{ margin: 0 }}>Improve communication fluency, confidence, and impromptu speaking.</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', maxWidth: 550, marginBottom: 30 }}>
              {[
                "Real-time AI conversation practice",
                "Improve speaking confidence naturally",
                "Build conversational fluency daily",
                "Reduce hesitation and awkward pauses",
                "Practice professional communication safely",
                "Voice-to-voice interaction with instant feedback"
              ].map((text, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px',
                  background: `linear-gradient(90deg, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.02))`,
                  border: `1px solid ${C.primary}30`,
                  borderRadius: 16,
                  boxShadow: `0 4px 15px rgba(0,0,0,0.1), inset 0 0 10px rgba(167, 139, 250, 0.05)`,
                  transition: 'all 0.3s ease'
                }}>
                  <div style={{ color: C.success || '#10B981', fontSize: '1.2rem', textShadow: `0 0 10px ${C.success || '#10B981'}` }}>✓</div>
                  <div style={{ color: '#F3F4F6', fontSize: '1rem', fontWeight: 500 }}>{text}</div>
                </div>
              ))}
            </div>

            <p style={{ color: C.textSecondary, fontSize: '0.95rem', fontStyle: 'italic', marginBottom: 40 }}>
              "Just 10 minutes daily can significantly improve communication confidence."
            </p>
            
            <NeonButton variant="primary" onClick={handleStart} style={{ padding: '18px 48px', fontSize: '1.2rem', borderRadius: 40, animation: 'pulse-glow 2s infinite' }}>
              Start Call
            </NeonButton>
            <div style={{ fontSize: '0.85rem', color: C.textSecondary, marginTop: 16, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Voice-to-voice AI communication practice
            </div>
          </GlassCard>
        </div>
      )}"""

# Replace
if intro_old in content:
    content = content.replace(intro_old, intro_new)
else:
    print("Error: Intro block not found")

# 3. Replace live block
live_old = """{convState === 'live' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30, marginTop: 20 }}>
          
          <div style={{ width: '100%', maxWidth: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>On a Call</h2>
              <p style={{ color: C.textSecondary, margin: '8px 0 0 0' }}>Speak naturally. Your AI companion is listening.</p>
            </div>
            <NeonButton variant="outline" onClick={handleEnd} style={{ borderColor: C.error || '#EF4444', color: C.error || '#EF4444' }}>
              End Call
            </NeonButton>
          </div>

          <GlassCard style={{ 
            width: '100%',
            maxWidth: 700,
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
        </div>
      )}"""

live_new = """{convState === 'live' && (
        <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginTop: 20 }}>
          
          <div style={{ width: '100%', maxWidth: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 10 }}>
            <div>
              <h2 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>On a Call</h2>
              <p style={{ color: C.textSecondary, margin: '8px 0 0 0' }}>Speak naturally. Your AI companion is listening.</p>
            </div>
            <NeonButton variant="outline" onClick={handleEnd} style={{ borderColor: C.error || '#EF4444', color: C.error || '#EF4444' }}>
              End Call
            </NeonButton>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 30, width: '100%', maxWidth: 1000 }}>
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
          </div>
        </div>
      )}"""

if live_old in content:
    content = content.replace(live_old, live_new)
else:
    print("Error: Live block not found")

content = content.replace("Get AI Feedback", "Generate AI Feedback")

with open('frontend/src/app/(app)/daily-practice/ai-conversation/page.jsx', 'w') as f:
    f.write(content)
print("Updated successfully")

