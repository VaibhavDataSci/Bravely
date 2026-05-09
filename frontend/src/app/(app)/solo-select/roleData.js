export const ROLE_CATEGORIES = {
  'Engineering': [
    { id: 'swe', name: 'Software Engineer', icon: '💻' },
    { id: 'be', name: 'Backend Engineer', icon: '⚙️' },
    { id: 'fe', name: 'Frontend Developer', icon: '🎨' },
    { id: 'fs', name: 'Full Stack Engineer', icon: '🔄' },
    { id: 'sde', name: 'Software Development Engineer', icon: '🛠️' },
    { id: 'mob', name: 'Mobile App Developer', icon: '📱' },
    { id: 'emb', name: 'Embedded Systems Engineer', icon: '🔌' },
  ],
  'Cloud / DevOps': [
    { id: 'cloud', name: 'Cloud Engineer', icon: '☁️' },
    { id: 'devops', name: 'DevOps Engineer', icon: '🚀' },
    { id: 'sre', name: 'Site Reliability Engineer', icon: '🔧' },
    { id: 'cloudarch', name: 'Cloud Architect', icon: '🏛️' },
    { id: 'clouddevops', name: 'Cloud DevOps Engineer', icon: '⛅' },
  ],
  'Data / AI': [
    { id: 'da', name: 'Data Analyst', icon: '📊' },
    { id: 'ds', name: 'Data Scientist', icon: '🔬' },
    { id: 'mle', name: 'Machine Learning Engineer', icon: '🤖' },
    { id: 'aie', name: 'AI Engineer', icon: '🧠' },
    { id: 'de', name: 'Data Engineer', icon: '🗄️' },
  ],
  'Security': [
    { id: 'secana', name: 'Security Analyst', icon: '🔍' },
    { id: 'cyber', name: 'Cybersecurity Engineer', icon: '🛡️' },
  ],
  'Management': [
    { id: 'pm', name: 'Product Manager', icon: '📋' },
    { id: 'projm', name: 'Project Manager', icon: '📅' },
    { id: 'em', name: 'Engineering Manager', icon: '👔' },
  ],
  'Business': [
    { id: 'ba', name: 'Business Analyst', icon: '💼' },
    { id: 'cons', name: 'Management Consultant', icon: '📈' },
  ],
  'Design': [
    { id: 'uiux', name: 'UI/UX Designer', icon: '🖌️' },
    { id: 'prod_des', name: 'Product Designer', icon: '✏️' },
  ],
};

export const ALL_ROLES = Object.values(ROLE_CATEGORIES).flat();

export const EXPERIENCE_LEVELS = [
  { id: 'fresher', name: 'Fresher / Entry Level', years: '0-1' },
  { id: 'junior', name: 'Junior Engineer', years: '1-2' },
  { id: 'mid', name: 'Mid-Level Engineer', years: '3-5' },
  { id: 'senior', name: 'Senior Engineer', years: '5-8' },
  { id: 'staff', name: 'Staff Engineer', years: '8-12' },
  { id: 'lead', name: 'Lead Engineer', years: '10+' },
  { id: 'principal', name: 'Principal Engineer', years: '12+' },
  { id: 'architect', name: 'Architect', years: '10+' },
  { id: 'manager', name: 'Manager', years: '8+' },
  { id: 'director', name: 'Director', years: '12+' },
];

export const INTERVIEW_ROUNDS = [
  { id: 'hr', name: 'HR / Behavioral', icon: '🤝', desc: 'STAR questions, conflict resolution, teamwork' },
  { id: 'technical', name: 'Technical', icon: '🔧', desc: 'Concept deep-dives, debugging, frameworks' },
  { id: 'coding', name: 'Coding', icon: '💻', desc: 'DSA, LeetCode-style problems, live coding' },
  { id: 'system_design', name: 'System Design', icon: '🏗️', desc: 'Scalability, architecture, distributed systems' },
];

// ── DYNAMIC INTERVIEW CONTEXTS BY ROLE CATEGORY ──
export const CONTEXT_BY_ROLE = {
  // Engineering
  swe:  ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  be:   ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  fe:   ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  fs:   ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  sde:  ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  mob:  ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  emb:  ['General','FAANG','Startup','Product-Based','Service-Based','Remote Hiring'],
  // Cloud / DevOps
  cloud:      ['AWS','Azure','DevOps','Enterprise','Startup','SRE'],
  devops:     ['AWS','Azure','DevOps','Enterprise','Startup','SRE'],
  sre:        ['AWS','Azure','DevOps','Enterprise','Startup','SRE'],
  cloudarch:  ['AWS','Azure','DevOps','Enterprise','Startup','SRE'],
  clouddevops:['AWS','Azure','DevOps','Enterprise','Startup','SRE'],
  // Data / AI
  da:  ['SQL Focus','Analytics','Dashboarding','ML Basics','Startup','Enterprise'],
  ds:  ['SQL Focus','Analytics','Dashboarding','ML Basics','Startup','Enterprise'],
  mle: ['SQL Focus','Analytics','Dashboarding','ML Basics','Startup','Enterprise'],
  aie: ['SQL Focus','Analytics','Dashboarding','ML Basics','Startup','Enterprise'],
  de:  ['SQL Focus','Analytics','Dashboarding','ML Basics','Startup','Enterprise'],
  // Management
  pm:    ['Product Sense','Strategy','Execution','FAANG PM','Startup PM'],
  projm: ['Product Sense','Strategy','Execution','FAANG PM','Startup PM'],
  em:    ['Product Sense','Strategy','Execution','FAANG PM','Startup PM'],
  // Security
  secana: ['General','Enterprise','Government','Cloud Security','Penetration Testing'],
  cyber:  ['General','Enterprise','Government','Cloud Security','Penetration Testing'],
  // Business
  ba:   ['General','Enterprise','Startup','Consulting','FAANG'],
  cons: ['General','Enterprise','Startup','Consulting','FAANG'],
  // Design
  uiux:     ['General','Product Design','Startup','Enterprise','FAANG'],
  prod_des: ['General','Product Design','Startup','Enterprise','FAANG'],
};

// HR / Behavioral contexts (used when round is 'hr')
export const HR_CONTEXTS = ['Leadership','Conflict Resolution','Teamwork','Managerial','Culture Fit'];

// System Design contexts (used when round is 'system_design')
export const SYSTEM_DESIGN_CONTEXTS = ['Scalability','Distributed Systems','High-Level Design','Backend Architecture','API Design'];

// Tooltips for popular contexts
export const CONTEXT_TOOLTIPS = {
  'General':           'Standard interview format covering all basics.',
  'FAANG':             'High-pressure product company interview style.',
  'Startup':           'Practical engineering, ownership, and speed.',
  'Product-Based':     'Focus on product thinking and user impact.',
  'Service-Based':     'Fundamentals, communication, client-facing scenarios.',
  'Remote Hiring':     'Async communication, self-management, remote tools.',
  'AWS':               'Amazon Web Services architecture and services.',
  'Azure':             'Microsoft Azure cloud platform focus.',
  'DevOps':            'CI/CD, automation, infrastructure as code.',
  'Enterprise':        'Large-scale corporate environment scenarios.',
  'SRE':               'Reliability, monitoring, incident management.',
  'SQL Focus':         'Deep SQL querying and database design.',
  'Analytics':         'Business analytics and data interpretation.',
  'Dashboarding':      'Data visualization and reporting.',
  'ML Basics':         'Fundamental machine learning concepts.',
  'Product Sense':     'User empathy, feature prioritization, metrics.',
  'Strategy':          'Market analysis, competitive positioning.',
  'Execution':         'Shipping products, project management.',
  'FAANG PM':          'High-bar product management interviews.',
  'Startup PM':        'Scrappy, fast-paced product development.',
  'Leadership':        'Leading teams through challenges.',
  'Conflict Resolution':'Handling disagreements professionally.',
  'Teamwork':          'Collaboration and cross-functional work.',
  'Managerial':        'Managing direct reports and performance.',
  'Culture Fit':       'Alignment with company values.',
  'Scalability':       'Designing for millions of users.',
  'Distributed Systems':'CAP theorem, consensus, replication.',
  'High-Level Design': 'Architecture diagrams and component design.',
  'Backend Architecture':'Server-side systems and APIs.',
  'API Design':        'RESTful/GraphQL API best practices.',
};

// Get contexts for a given role + round combination
export function getContextsForRole(roleId, roundId) {
  if (roundId === 'hr') return HR_CONTEXTS;
  if (roundId === 'system_design') return SYSTEM_DESIGN_CONTEXTS;
  return CONTEXT_BY_ROLE[roleId] || ['General','FAANG','Startup'];
}

// Suggest contexts based on resume skills
export function suggestContextsFromResume(resume, roleId) {
  if (!resume?.skills) return [];
  const skills = new Set(resume.skills.map(s => s.toLowerCase()));
  const suggestions = [];
  if (skills.has('aws') || skills.has('lambda') || skills.has('cloudformation')) suggestions.push('AWS');
  if (skills.has('azure')) suggestions.push('Azure');
  if (skills.has('kubernetes') || skills.has('docker') || skills.has('terraform')) suggestions.push('DevOps');
  if (skills.has('react') || skills.has('next.js') || skills.has('tailwind')) suggestions.push('Startup','Product-Based');
  if (skills.has('sql') || skills.has('pandas') || skills.has('tableau')) suggestions.push('SQL Focus','Analytics');
  if (skills.has('tensorflow') || skills.has('pytorch') || skills.has('scikit-learn')) suggestions.push('ML Basics');
  if (skills.has('kubernetes') || skills.has('prometheus') || skills.has('grafana')) suggestions.push('SRE');
  // Deduplicate & keep only contexts valid for this role
  const available = new Set(CONTEXT_BY_ROLE[roleId] || []);
  return [...new Set(suggestions)].filter(c => available.has(c)).slice(0, 3);
}

// Suggest roles based on resume skills
export function suggestRolesFromResume(resume) {
  if (!resume?.skills) return [];
  const skillSet = new Set(resume.skills.map(s => s.toLowerCase()));
  const scores = {};
  const mapping = {
    'swe': ['react','node.js','javascript','typescript','java','python','c++','golang'],
    'be': ['node.js','java','python','golang','postgresql','mongodb','redis','kafka'],
    'fe': ['react','vue','angular','css','html','javascript','typescript','tailwind'],
    'fs': ['react','node.js','typescript','postgresql','mongodb','docker'],
    'cloud': ['aws','azure','gcp','terraform','cloudformation','lambda'],
    'devops': ['docker','kubernetes','jenkins','terraform','ansible','ci/cd','github actions'],
    'sre': ['kubernetes','prometheus','grafana','docker','linux','aws'],
    'da': ['sql','python','pandas','excel','tableau','power bi','statistics'],
    'ds': ['python','tensorflow','pytorch','scikit-learn','statistics','r','pandas'],
    'mle': ['tensorflow','pytorch','python','mlops','aws sagemaker','docker'],
    'aie': ['tensorflow','pytorch','llm','nlp','python','transformers'],
    'de': ['sql','spark','airflow','kafka','python','aws','etl'],
    'cyber': ['networking','linux','penetration testing','firewalls','siem'],
    'pm': ['product','strategy','analytics','roadmap','stakeholder'],
    'uiux': ['figma','sketch','user research','prototyping','css'],
  };
  for (const [roleId, keywords] of Object.entries(mapping)) {
    const matches = keywords.filter(k => skillSet.has(k));
    if (matches.length > 0) scores[roleId] = matches.length;
  }
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([id]) => ALL_ROLES.find(r => r.id === id))
    .filter(Boolean);
}
