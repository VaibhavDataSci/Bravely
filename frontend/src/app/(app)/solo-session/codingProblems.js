// ─── CODING PROBLEM BANK ─────────────────────────────────────────────────────
// Each problem has: title, difficulty, description, examples, constraints,
// hints, expected complexity, starter code, test cases, and tags.

const PROBLEMS = [
  {
    id: 'two-sum', difficulty: 'Easy', tags: ['arrays','hashmap'],
    title: 'Two Sum',
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      { input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' },
      { input: 'nums = [3,2,4], target = 6', output: '[1,2]' },
    ],
    constraints: ['2 <= nums.length <= 10⁴', '-10⁹ <= nums[i] <= 10⁹', 'Only one valid answer exists.'],
    hints: ['Try using a hash map to store seen values.', 'For each number, check if target - num exists in the map.'],
    expectedComplexity: { time: 'O(n)', space: 'O(n)' },
    starterCode: { javascript: 'function twoSum(nums, target) {\n  // your code here\n}', python: 'def two_sum(nums, target):\n    # your code here\n    pass' },
    testCases: [
      { input: '[2,7,11,15], 9', expected: '[0,1]' },
      { input: '[3,2,4], 6', expected: '[1,2]' },
      { input: '[3,3], 6', expected: '[0,1]' },
    ],
  },
  {
    id: 'valid-parens', difficulty: 'Easy', tags: ['stack','strings'],
    title: 'Valid Parentheses',
    description: `Given a string \`s\` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10⁴', 's consists of parentheses only.'],
    hints: ['Use a stack to track opening brackets.', 'When you encounter a closing bracket, check if the top of stack matches.'],
    expectedComplexity: { time: 'O(n)', space: 'O(n)' },
    starterCode: { javascript: 'function isValid(s) {\n  // your code here\n}', python: 'def is_valid(s):\n    # your code here\n    pass' },
    testCases: [
      { input: '"()"', expected: 'true' },
      { input: '"()[]{}"', expected: 'true' },
      { input: '"(]"', expected: 'false' },
      { input: '"([)]"', expected: 'false' },
    ],
  },
  {
    id: 'max-subarray', difficulty: 'Medium', tags: ['arrays','dp','kadane'],
    title: 'Maximum Subarray',
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.\n\nA subarray is a contiguous non-empty sequence of elements within an array.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 10⁵', '-10⁴ <= nums[i] <= 10⁴'],
    hints: ["Think about Kadane's algorithm.", 'At each position, decide: extend the current subarray or start a new one?'],
    expectedComplexity: { time: 'O(n)', space: 'O(1)' },
    starterCode: { javascript: 'function maxSubArray(nums) {\n  // your code here\n}', python: 'def max_sub_array(nums):\n    # your code here\n    pass' },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[1]', expected: '1' },
      { input: '[5,4,-1,7,8]', expected: '23' },
    ],
  },
  {
    id: 'lru-cache', difficulty: 'Medium', tags: ['design','hashmap','linked-list'],
    title: 'LRU Cache',
    description: `Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the \`LRUCache\` class:\n- \`LRUCache(int capacity)\` Initialize the cache with positive size capacity.\n- \`int get(int key)\` Return the value if the key exists, otherwise return -1.\n- \`void put(int key, int value)\` Update or insert the value. When the cache reaches capacity, evict the least recently used key.`,
    examples: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1); put(3,3); get(2)', output: '1, -1', explanation: 'Cache evicts key 2 when putting 3.' },
    ],
    constraints: ['1 <= capacity <= 3000', '0 <= key <= 10⁴', '0 <= value <= 10⁵', 'At most 2 * 10⁵ calls to get and put.'],
    hints: ['Combine a hash map with a doubly-linked list.', 'The hash map gives O(1) lookup, the linked list gives O(1) eviction.'],
    expectedComplexity: { time: 'O(1) per operation', space: 'O(capacity)' },
    starterCode: { javascript: 'class LRUCache {\n  constructor(capacity) {\n    // your code here\n  }\n  get(key) {\n    // your code here\n  }\n  put(key, value) {\n    // your code here\n  }\n}', python: 'class LRUCache:\n    def __init__(self, capacity):\n        # your code here\n        pass\n    def get(self, key):\n        # your code here\n        pass\n    def put(self, key, value):\n        # your code here\n        pass' },
    testCases: [
      { input: 'LRUCache(2); put(1,1); put(2,2); get(1)', expected: '1' },
      { input: 'LRUCache(2); put(1,1); put(2,2); put(3,3); get(2)', expected: '-1' },
    ],
  },
  {
    id: 'merge-intervals', difficulty: 'Medium', tags: ['arrays','sorting'],
    title: 'Merge Intervals',
    description: `Given an array of intervals where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.`,
    examples: [
      { input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap → [1,6]' },
    ],
    constraints: ['1 <= intervals.length <= 10⁴', 'intervals[i].length == 2'],
    hints: ['Sort intervals by start time.', 'Iterate and merge if the current interval overlaps with the previous.'],
    expectedComplexity: { time: 'O(n log n)', space: 'O(n)' },
    starterCode: { javascript: 'function merge(intervals) {\n  // your code here\n}', python: 'def merge(intervals):\n    # your code here\n    pass' },
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expected: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expected: '[[1,5]]' },
    ],
  },
  {
    id: 'longest-substring', difficulty: 'Medium', tags: ['strings','sliding-window','hashmap'],
    title: 'Longest Substring Without Repeating Characters',
    description: `Given a string \`s\`, find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with length 3.' },
      { input: 's = "bbbbb"', output: '1' },
    ],
    constraints: ['0 <= s.length <= 5 * 10⁴', 's consists of English letters, digits, symbols and spaces.'],
    hints: ['Use a sliding window with two pointers.', 'Use a set or map to track characters in the current window.'],
    expectedComplexity: { time: 'O(n)', space: 'O(min(m, n))' },
    starterCode: { javascript: 'function lengthOfLongestSubstring(s) {\n  // your code here\n}', python: 'def length_of_longest_substring(s):\n    # your code here\n    pass' },
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' },
    ],
  },
  {
    id: 'cycle-detection', difficulty: 'Medium', tags: ['graph','dfs','bfs'],
    title: 'Detect Cycle in Directed Graph',
    description: `Given a directed graph with \`n\` nodes (0 to n-1) and an edge list, determine if the graph contains a cycle.\n\nReturn \`true\` if the graph has a cycle, otherwise return \`false\`.`,
    examples: [
      { input: 'n = 4, edges = [[0,1],[1,2],[2,3]]', output: 'false' },
      { input: 'n = 4, edges = [[0,1],[1,2],[2,0]]', output: 'true' },
    ],
    constraints: ['1 <= n <= 10⁵', '0 <= edges.length <= 5 * 10⁴'],
    hints: ['Use DFS with three coloring states: white, gray, black.', 'If you encounter a gray node during DFS, a cycle exists.'],
    expectedComplexity: { time: 'O(V + E)', space: 'O(V)' },
    starterCode: { javascript: 'function hasCycle(n, edges) {\n  // your code here\n}', python: 'def has_cycle(n, edges):\n    # your code here\n    pass' },
    testCases: [
      { input: '4, [[0,1],[1,2],[2,3]]', expected: 'false' },
      { input: '4, [[0,1],[1,2],[2,0]]', expected: 'true' },
    ],
  },
  {
    id: 'min-window', difficulty: 'Hard', tags: ['strings','sliding-window','hashmap'],
    title: 'Minimum Window Substring',
    description: `Given two strings \`s\` and \`t\`, return the minimum window substring of \`s\` such that every character in \`t\` (including duplicates) is included in the window.\n\nIf there is no such substring, return the empty string "".`,
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "a"', output: '"a"' },
    ],
    constraints: ['1 <= s.length, t.length <= 10⁵', 's and t consist of uppercase and lowercase English letters.'],
    hints: ['Use a sliding window with character frequency counts.', 'Expand the window until all characters are included, then contract from the left.'],
    expectedComplexity: { time: 'O(|s| + |t|)', space: 'O(|s| + |t|)' },
    starterCode: { javascript: 'function minWindow(s, t) {\n  // your code here\n}', python: 'def min_window(s, t):\n    # your code here\n    pass' },
    testCases: [
      { input: '"ADOBECODEBANC", "ABC"', expected: '"BANC"' },
      { input: '"a", "a"', expected: '"a"' },
      { input: '"a", "aa"', expected: '""' },
    ],
  },
];

// ─── TAG-TO-ROLE MAPPING ─────────────────────────────────────────────────────
const roleTagWeights = {
  swe: ['arrays','hashmap','strings','stack','dp','graph','design','sliding-window','linked-list','sorting'],
  fe:  ['arrays','strings','hashmap','stack','dom','async'],
  be:  ['arrays','hashmap','design','graph','sorting','strings','linked-list'],
  fs:  ['arrays','hashmap','strings','design','stack','dp'],
  da:  ['arrays','hashmap','strings','sorting','dp'],
  ds:  ['arrays','dp','hashmap','graph','strings'],
  mle: ['arrays','dp','graph','hashmap','sorting'],
  cloud: ['arrays','hashmap','design','graph'],
  devops: ['arrays','hashmap','strings','design'],
};

// ─── PICK PROBLEMS FOR A SESSION ─────────────────────────────────────────────
export function getProblemsForSession(config, resume) {
  const roleId = config?.roleId || 'swe';
  const level = config?.experienceLevel || 'mid';
  const preferredTags = roleTagWeights[roleId] || roleTagWeights.swe;

  // Score each problem by tag relevance
  const scored = PROBLEMS.map(p => {
    let score = 0;
    p.tags.forEach(tag => {
      const idx = preferredTags.indexOf(tag);
      if (idx !== -1) score += (preferredTags.length - idx);
    });
    // Boost resume-matching tags
    if (resume?.skills) {
      const skills = new Set(resume.skills.map(s => s.toLowerCase()));
      if (skills.has('react') || skills.has('javascript')) score += p.tags.includes('strings') ? 2 : 0;
      if (skills.has('python')) score += 1;
      if (skills.has('sql')) score += p.tags.includes('hashmap') ? 1 : 0;
    }
    return { ...p, score };
  });

  // Filter by experience-appropriate difficulty
  const diffFilter = {
    fresher: ['Easy'],
    junior: ['Easy', 'Medium'],
    mid: ['Easy', 'Medium'],
    senior: ['Medium', 'Hard'],
    staff: ['Medium', 'Hard'],
    lead: ['Medium', 'Hard'],
    principal: ['Hard'],
    architect: ['Medium', 'Hard'],
    manager: ['Medium'],
    director: ['Medium'],
  };
  const allowed = diffFilter[level] || ['Easy', 'Medium'];
  const filtered = scored.filter(p => allowed.includes(p.difficulty));

  // Sort by score descending, pick top 3
  filtered.sort((a, b) => b.score - a.score);
  return filtered.slice(0, 3);
}

// ─── AI INTERVIEWER MESSAGES ─────────────────────────────────────────────────
export const CODING_AI_MESSAGES = {
  intro: [
    "Let's start with a coding problem. Take your time to understand it, then explain your approach before writing code.",
    "Here's your first problem. I'd like you to think out loud as you solve it.",
    "Ready for the coding round? Read through the problem carefully, then talk me through your approach.",
  ],
  askApproach: [
    "Before you start coding, can you walk me through your approach?",
    "What data structure would you use here, and why?",
    "Can you explain your thought process before writing the solution?",
  ],
  duringCoding: [
    "I see you're working through it. Take your time.",
    "Good progress. Keep going.",
    "Interesting approach. Continue.",
  ],
  askOptimize: [
    "This works, but can you optimize it? What's the current time complexity?",
    "Good solution. Can you do it with less space?",
    "Nice. What if the input was 10x larger — would your solution still work?",
  ],
  hintGentle: [
    "Think about what data structure gives you O(1) lookups...",
    "Have you considered using a two-pointer approach?",
    "What if you sorted the input first?",
  ],
  goodSolution: [
    "Excellent! That's an optimal solution.",
    "Great job. Clean code and good complexity.",
    "Very well done. Let's move to a harder problem.",
  ],
  wrongAnswer: [
    "Hmm, some test cases are failing. Can you check your edge cases?",
    "Close, but there's an issue. Think about empty inputs or duplicates.",
    "Not quite right. Let me give you a hint...",
  ],
  followUp: [
    "Good. Let's try a harder variant of this problem.",
    "Now let me give you a follow-up challenge.",
    "Excellent. Here's a more complex version.",
  ],
};

export const LANGUAGES = [
  // Frontend / General
  { id: 'javascript', name: 'JavaScript', icon: 'JS', aliases: ['js','node','es6'], ext: '.js',
    starter: 'function solve() {\n  // your code here\n}' },
  { id: 'typescript', name: 'TypeScript', icon: 'TS', aliases: ['ts'], ext: '.ts',
    starter: 'function solve(): void {\n  // your code here\n}' },
  // Backend
  { id: 'python', name: 'Python', icon: 'PY', aliases: ['py','python3'], ext: '.py',
    starter: 'def solve():\n    # your code here\n    pass' },
  { id: 'java', name: 'Java', icon: 'JV', aliases: ['jv'], ext: '.java',
    starter: 'class Solution {\n    public static void main(String[] args) {\n        // your code here\n    }\n}' },
  { id: 'csharp', name: 'C#', icon: 'C#', aliases: ['cs','dotnet','csharp'], ext: '.cs',
    starter: 'using System;\n\npublic class Solution {\n    public static void Main(string[] args) {\n        // your code here\n    }\n}' },
  { id: 'go', name: 'Go', icon: 'GO', aliases: ['golang'], ext: '.go',
    starter: 'package main\n\nimport "fmt"\n\nfunc main() {\n    // your code here\n    fmt.Println("Hello")\n}' },
  { id: 'rust', name: 'Rust', icon: 'RS', aliases: ['rs'], ext: '.rs',
    starter: 'fn main() {\n    // your code here\n}' },
  { id: 'php', name: 'PHP', icon: 'PH', aliases: ['php8'], ext: '.php',
    starter: '<?php\n\nfunction solve() {\n    // your code here\n}\n\nsolve();' },
  { id: 'ruby', name: 'Ruby', icon: 'RB', aliases: ['rb'], ext: '.rb',
    starter: 'def solve()\n  # your code here\nend\n\nsolve()' },
  // Systems
  { id: 'c', name: 'C', icon: ' C', aliases: ['clang'], ext: '.c',
    starter: '#include <stdio.h>\n\nint main() {\n    // your code here\n    return 0;\n}' },
  { id: 'cpp', name: 'C++', icon: '++', aliases: ['cplusplus','cc'], ext: '.cpp',
    starter: '#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    // your code here\n    return 0;\n}' },
  { id: 'kotlin', name: 'Kotlin', icon: 'KT', aliases: ['kt'], ext: '.kt',
    starter: 'fun main() {\n    // your code here\n}' },
  { id: 'swift', name: 'Swift', icon: 'SW', aliases: ['ios'], ext: '.swift',
    starter: 'import Foundation\n\nfunc solve() {\n    // your code here\n}\n\nsolve()' },
  // Database
  { id: 'sql', name: 'SQL', icon: 'SQ', aliases: ['mysql','postgres','sqlite'], ext: '.sql',
    starter: '-- Write your SQL query below\nSELECT *\nFROM table_name\nWHERE condition;' },
  // Advanced
  { id: 'scala', name: 'Scala', icon: 'SC', aliases: ['sc'], ext: '.scala',
    starter: 'object Solution {\n  def main(args: Array[String]): Unit = {\n    // your code here\n  }\n}' },
  { id: 'dart', name: 'Dart', icon: 'DT', aliases: ['flutter'], ext: '.dart',
    starter: 'void main() {\n  // your code here\n}' },
  { id: 'r', name: 'R', icon: ' R', aliases: ['rlang'], ext: '.R',
    starter: '# your code here\nsolve <- function() {\n  \n}\n\nsolve()' },
];
