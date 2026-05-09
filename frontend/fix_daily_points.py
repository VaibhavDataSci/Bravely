import sys

filepath = 'src/app/(app)/daily-practice/page.jsx'
with open(filepath, 'r') as f:
    content = f.read()

old_block = """    {
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
      visual: ("""

new_block = """    {
      id: 'ai-conversation',
      title: 'Phone Call with AI',
      subtitle: 'Practice natural voice conversations to improve fluency and confidence.',
      supportText: 'Just 10 mins daily builds confidence.',
      path: '/daily-practice/ai-conversation',
      features: [
        'Real-time AI conversation',
        'Improve speaking confidence',
        'Build conversational fluency',
        'Reduce hesitation and pauses',
        'Voice-to-voice interaction'
      ],
      customCheck: true,
      visual: ("""

if old_block in content:
    content = content.replace(old_block, new_block)
    with open(filepath, 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Not found! Trying line by line approach...")

