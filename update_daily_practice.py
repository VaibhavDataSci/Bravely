import sys

with open('frontend/src/app/(app)/daily-practice/page.jsx', 'r') as f:
    content = f.read()

old_ai_conv = """    {
      id: 'ai-conversation',
      title: 'AI Conversation',
      subtitle: 'Practice real-world conversational fluency with AI personas.',
      path: '/daily-practice/ai-conversation',
      features: [
        'Hiring manager persona',
        'Friendly peer mode',
        'Founder mode',
        'Professor mode',
        'Real-time speaking feedback'
      ],
      visual: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, color: C.danger, fontSize: 48 }}>
          🤖
        </div>
      ),
      cta: 'Talk with AI'
    },"""

new_ai_conv = """    {
      id: 'ai-conversation',
      title: 'Phone Call with AI',
      subtitle: 'Practice natural voice conversations as if you\\'re on a real phone call.\\nImprove communication fluency, confidence, and impromptu speaking.',
      supportText: 'Just 10 minutes daily can significantly improve communication confidence.',
      path: '/daily-practice/ai-conversation',
      features: [
        'Real-time AI conversation practice',
        'Improve speaking confidence naturally',
        'Build conversational fluency daily',
        'Reduce hesitation and awkward pauses',
        'Practice professional communication safely',
        'Voice-to-voice interaction with instant feedback'
      ],
      customCheck: true,
      visual: (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 100, fontSize: 48 }}>
          📞
        </div>
      ),
      cta: 'Start Call'
    },"""

content = content.replace(old_ai_conv, new_ai_conv)

# We also need to render supportText and customCheck if it exists
old_render = """            <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 30px 0', flexGrow: 1 }}>
              {mod.features.map((feature, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '10px',
                  color: C.textMuted,
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: C.primary, fontSize: '0.8rem' }}>✦</span>
                  {feature}
                </li>
              ))}
            </ul>"""

new_render = """            <ul style={{ listStyleType: 'none', padding: 0, margin: '0 0 15px 0', flexGrow: 1 }}>
              {mod.features.map((feature, i) => (
                <li key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  marginBottom: '10px',
                  color: mod.customCheck ? '#F3F4F6' : C.textMuted,
                  fontSize: '0.95rem'
                }}>
                  <span style={{ color: mod.customCheck ? (C.success || '#10B981') : C.primary, fontSize: mod.customCheck ? '1.1rem' : '0.8rem' }}>
                    {mod.customCheck ? '✓' : '✦'}
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            {mod.supportText && (
              <div style={{ color: C.textSecondary, fontSize: '0.85rem', fontStyle: 'italic', marginBottom: '20px' }}>
                {mod.supportText}
              </div>
            )}"""

content = content.replace(old_render, new_render)

with open('frontend/src/app/(app)/daily-practice/page.jsx', 'w') as f:
    f.write(content)

