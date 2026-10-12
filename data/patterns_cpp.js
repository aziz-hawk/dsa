// 36 Core C++ STL Algorithmic Patterns & Templates (Mobile-optimized <= 42 chars/line)
window.PATTERNS_CPP = {
  "pat-kadane": {
    id: "pat-kadane",
    name: "Kadane's & Subarray Max/Product",
    category: "Arrays",
    trigger: "Contiguous subarray with max sum, max product, or circular wrap.",
    intuition: [
      "Extend current subarray or start fresh at nums[i]: cur = max(x, cur + x).",
      "For Max Product: track both (mn, mx) since a negative flips min to max.",
      "For Circular Subarray: max(normalKadane, totalSum - minSubarray)."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Initializing ans = 0 fails when all elements are negative; always init ans = nums[0].",
    code: `// 1. Max Subarray Sum (Kadane)
int maxSubArray(vector<int>& a) {
  int cur = a[0], ans = a[0];
  for (int i = 1; i < a.size(); i++) {
    cur = max(a[i], cur + a[i]);
    ans = max(ans, cur);
  }
  return ans;
}

// 2. Max Product Subarray
int maxProduct(vector<int>& a) {
  int mx = a[0], mn = a[0], ans = a[0];
  for (int i = 1; i < a.size(); i++) {
    if (a[i] < 0) swap(mx, mn);
    mx = max(a[i], mx * a[i]);
    mn = min(a[i], mn * a[i]);
    ans = max(ans, mx);
  }
  return ans;
}`
  },

  "pat-dutch-flag": {
    id: "pat-dutch-flag",
    name: "Dutch National Flag (3-Way Partition)",
    category: "Arrays",
    trigger: "Sort 0s/1s/2s in-place in 1 pass, or 3-way partition around a pivot.",
    intuition: [
      "Maintain 3 pointers: [0..lo-1]=0, [lo..mid-1]=1, [mid..hi]=unknown, [hi+1..n-1]=2.",
      "If a[mid]==0: swap(lo++, mid++). If a[mid]==1: mid++.",
      "If a[mid]==2: swap(mid, hi--) — do NOT increment mid yet (swapped val is uninspected)."
    ],
    tc: "O(N) — single pass",
    sc: "O(1)",
    trap: "Incrementing mid after swapping with hi skips checking the newly swapped element.",
    code: `void sortColors(vector<int>& a) {
  int lo = 0, mid = 0;
  int hi = (int)a.size() - 1;
  while (mid <= hi) {
    if (a[mid] == 0)
      swap(a[lo++], a[mid++]);
    else if (a[mid] == 1)
      mid++;
    else
      swap(a[mid], a[hi--]);
  }
}`
  },

  "pat-merge-intervals": {
    id: "pat-merge-intervals",
    name: "Intervals: Merge, Insert & Sweep",
    category: "Arrays",
    trigger: "Overlapping time ranges, meeting rooms, min arrows, or interval scheduling.",
    intuition: [
      "Sort by start time for merging; sort by end time for max non-overlapping (greedy).",
      "Overlap condition: next.start <= cur.end -> merge via cur.end = max(cur.end, next.end).",
      "For concurrent rooms/platforms: sort start[] & end[] separately or use map<int,int> delta."
    ],
    tc: "O(N log N)",
    sc: "O(N) output",
    trap: "Sorting by start time instead of end time when counting max non-overlapping intervals.",
    code: `vector<vector<int>> merge(
    vector<vector<int>>& iv) {
  sort(iv.begin(), iv.end());
  vector<vector<int>> res = {iv[0]};
  for (int i = 1; i < iv.size(); i++) {
    if (iv[i][0] <= res.back()[1]) {
      res.back()[1] = max(
        res.back()[1], iv[i][1]);
    } else {
      res.push_back(iv[i]);
    }
  }
  return res;
}`
  },

  "pat-boyer-moore": {
    id: "pat-boyer-moore",
    name: "Boyer-Moore Majority Voting",
    category: "Arrays",
    trigger: "Find element appearing > N/2 or > N/3 times in O(1) space.",
    intuition: [
      "Pair up distinct elements and cancel them out; the majority element survives.",
      "For > N/2: keep 1 candidate & count. For > N/3: keep 2 candidates & 2 counts.",
      "Always do a 2nd verification pass if majority existence isn't guaranteed."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "For N/3 (2 candidates), check c1==x and c2==x BEFORE checking cnt1==0 or cnt2==0.",
    code: `int majorityElement(vector<int>& a) {
  int cand = 0, cnt = 0;
  for (int x : a) {
    if (cnt == 0) cand = x;
    cnt += (x == cand) ? 1 : -1;
  }
  return cand;
}`
  },

  "pat-prefix-hash": {
    id: "pat-prefix-hash",
    name: "Prefix Sum / XOR + Hash Map",
    category: "Hashing",
    trigger: "Count/longest subarray with sum == K, sum divisible by K, or XOR == K.",
    intuition: [
      "pref[R] - pref[L-1] == K  ==>  pref[L-1] == pref[R] - K.",
      "Store frequency (for count) or earliest index (for max length) in unordered_map.",
      "For divisible by K: normalize negative mod via ((sum % k) + k) % k."
    ],
    tc: "O(N)",
    sc: "O(N)",
    trap: "Forgetting mp[0] = 1 (for count) or mp[0] = -1 (for max length) before the loop!",
    code: `int subarraySum(vector<int>& a, int k) {
  unordered_map<long long, int> mp;
  mp[0] = 1; // base prefix = 0
  long long sum = 0;
  int ans = 0;
  for (int x : a) {
    sum += x;
    if (mp.count(sum - k))
      ans += mp[sum - k];
    mp[sum]++;
  }
  return ans;
}`
  },

  "pat-two-pointers": {
    id: "pat-two-pointers",
    name: "Two Pointers (Inward & Sorted Scan)",
    category: "Sliding Window & Two Pointers",
    trigger: "3Sum/4Sum, Container With Most Water, Trapping Rain Water, Next Permutation.",
    intuition: [
      "Sort array first for 2Sum/3Sum/4Sum; move L++ if sum < target, R-- if sum > target.",
      "Skip duplicate values on i, L, and R to avoid duplicate triplets.",
      "For Trapping Rain Water: advance the smaller side (h[L] < h[R]) and accumulate lMax - h[L]."
    ],
    tc: "O(N) or O(N²)",
    sc: "O(1) aux",
    trap: "Not skipping duplicates after finding a valid triplet in 3Sum causes TLE/wrong output.",
    code: `// Trapping Rain Water O(N), O(1)
int trap(vector<int>& h) {
  int l = 0, r = (int)h.size() - 1;
  int lMax = 0, rMax = 0, ans = 0;
  while (l < r) {
    if (h[l] < h[r]) {
      lMax = max(lMax, h[l]);
      ans += lMax - h[l++];
    } else {
      rMax = max(rMax, h[r]);
      ans += rMax - h[r--];
    }
  }
  return ans;
}`
  },

  "pat-sliding-window": {
    id: "pat-sliding-window",
    name: "Sliding Window (Variable & At-Most-K)",
    category: "Sliding Window & Two Pointers",
    trigger: "Longest/shortest substring or subarray satisfying a monotonic window condition.",
    intuition: [
      "Expand R every step; while window is invalid, shrink L++ to restore validity.",
      "For 'Exactly K distinct/odd': return atMost(K) - atMost(K - 1).",
      "For Min Window Substring: decrement need[c], track missing count == 0, shrink L."
    ],
    tc: "O(N) — L & R move at most N times",
    sc: "O(U) charset/map",
    trap: "Using Sliding Window on arrays with negative numbers for sum queries (use Prefix+Map/Deque instead).",
    code: `// Longest Substring w/o Repeating Chars
int lengthOfLongestSubstring(string s) {
  vector<int> last(256, -1);
  int l = 0, ans = 0;
  for (int r = 0; r < s.size(); r++) {
    if (last[s[r]] >= l)
      l = last[s[r]] + 1;
    last[s[r]] = r;
    ans = max(ans, r - l + 1);
  }
  return ans;
}`
  },

  "pat-bs-answer": {
    id: "pat-bs-answer",
    name: "Binary Search on Answer Space",
    category: "Binary Search",
    trigger: "'Minimize the maximum' or 'Maximize the minimum' (Ship Packages, Koko, Cows, Split Array).",
    intuition: [
      "Define search bounds: lo = minPossible (e.g. max(a)), hi = maxPossible (e.g. sum(a)).",
      "Write a greedy O(N) check(mid) returning true if capacity/limit 'mid' is feasible.",
      "If check(mid) is true: record ans = mid and tighten bound (hi = mid - 1 or lo = mid + 1)."
    ],
    tc: "O(N log(Range))",
    sc: "O(1)",
    trap: "Wrong lo bound (e.g. lo = 0 instead of *max_element) causes greedy check(mid) to loop/fail.",
    code: `int shipWithinDays(vector<int>& w, int D){
  int lo = *max_element(w.begin(),w.end());
  int hi = accumulate(w.begin(),w.end(),0);
  auto ok = [&](int cap) {
    int days = 1, cur = 0;
    for (int x : w) {
      if (cur + x > cap) { days++; cur=0; }
      cur += x;
    }
    return days <= D;
  };
  while (lo < hi) {
    int mid = lo + (hi - lo) / 2;
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}`
  },

  "pat-binary-search": {
    id: "pat-binary-search",
    name: "Modified Binary Search (Rotated / Peak)",
    category: "Binary Search",
    trigger: "Sorted or rotated array lookup in O(log N), peak element, or STL lower_bound.",
    intuition: [
      "In Rotated Array: at least one half [lo..mid] or [mid..hi] is strictly sorted.",
      "Check if a[lo] <= a[mid] (left sorted); then check if target lies inside the sorted half.",
      "With duplicates (Rotated II): if a[lo] == a[mid] == a[hi], do lo++, hi-- first."
    ],
    tc: "O(log N)",
    sc: "O(1)",
    trap: "Using < instead of <= in (a[lo] <= a[mid]) fails when lo == mid (2 elements left).",
    code: `int search(vector<int>& a, int t) {
  int lo = 0, hi = (int)a.size() - 1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (a[mid] == t) return mid;
    if (a[lo] <= a[mid]) { // Left sorted
      if (a[lo] <= t && t < a[mid])
        hi = mid - 1;
      else lo = mid + 1;
    } else { // Right sorted
      if (a[mid] < t && t <= a[hi])
        lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}`
  },

  "pat-monotonic-stack": {
    id: "pat-monotonic-stack",
    name: "Monotonic Stack (NGE & Histogram)",
    category: "Stacks & Queues",
    trigger: "Next Greater/Smaller Element, Largest Rectangle in Histogram, Subarray Mins.",
    intuition: [
      "Store indices in stack; pop while current element violates monotonic order.",
      "When i pops top = st.top(): i is the Next Smaller (right boundary), new st.top() is Prev Smaller (left boundary).",
      "Width of rectangle with height h[top] is (i - prevSmallerIdx - 1)."
    ],
    tc: "O(N) — each index pushed/popped once",
    sc: "O(N)",
    trap: "In Sum of Subarray Minimums with duplicates, use < on one side and <= on the other to avoid double-counting.",
    code: `int largestRectangleArea(vector<int>& h) {
  stack<int> st;
  int ans = 0, n = h.size();
  for (int i = 0; i <= n; i++) {
    int cur = (i == n) ? 0 : h[i];
    while (!st.empty() && h[st.top()]>=cur){
      int ht = h[st.top()]; st.pop();
      int w = st.empty() ? i : i-st.top()-1;
      ans = max(ans, ht * w);
    }
    st.push(i);
  }
  return ans;
}`
  },

  "pat-monotonic-deque": {
    id: "pat-monotonic-deque",
    name: "Monotonic Deque (Sliding Window Max)",
    category: "Stacks & Queues",
    trigger: "Max/Min in sliding window of size K, or DP with bounded jump/prefix sum.",
    intuition: [
      "Maintain deque<int> of indices with strictly decreasing values: a[dq.front()] is always max.",
      "1) Pop front if dq.front() <= i - k (out of window).",
      "2) Pop back while a[dq.back()] <= a[i] (useless smaller elements), then push_back(i)."
    ],
    tc: "O(N)",
    sc: "O(K)",
    trap: "Storing values instead of indices in the deque makes it impossible to evict out-of-window elements.",
    code: `vector<int> maxSlidingWindow(
    vector<int>& a, int k) {
  deque<int> dq;
  vector<int> res;
  for (int i = 0; i < a.size(); i++) {
    if (!dq.empty() && dq.front() <= i - k)
      dq.pop_front();
    while (!dq.empty() && a[dq.back()]<=a[i])
      dq.pop_back();
    dq.push_back(i);
    if (i >= k - 1)
      res.push_back(a[dq.front()]);
  }
  return res;
}`
  },

  "pat-stack-design": {
    id: "pat-stack-design",
    name: "Stack Simulation & LRU Cache",
    category: "Stacks & Queues",
    trigger: "Valid parentheses, Min Stack, Asteroid Collision, Decode String, LRU Cache.",
    intuition: [
      "For LRU Cache: combine std::list<pair<int,int>> (MRU at front) + unordered_map<int, list::iterator>.",
      "list::splice(cache.begin(), cache, it) moves any node to front in O(1) without invalidating iterators.",
      "For Min Stack: push pair {val, min(val, st.top().second)}."
    ],
    tc: "O(1) per op",
    sc: "O(Capacity)",
    trap: "Forgetting to update the value when put(key, val) is called on an already-existing key in LRU.",
    code: `// LRU Cache O(1) with list::splice
list<pair<int,int>> li;
unordered_map<int, decltype(li.begin())> mp;
int get(int k) {
  if (!mp.count(k)) return -1;
  li.splice(li.begin(), li, mp[k]);
  return mp[k]->second;
}`
  },

  "pat-fast-slow": {
    id: "pat-fast-slow",
    name: "Floyd's Fast & Slow Pointers",
    category: "Linked List",
    trigger: "Linked list cycle start, middle node, or duplicate number in [1..N] array.",
    intuition: [
      "slow moves 1 step, fast moves 2 steps. If they meet, a cycle exists.",
      "Reset one pointer to head and move both 1 step at a time: they meet at the exact cycle entrance.",
      "For Array Duplicate (LC 287): treat index -> nums[index] as a linked list!"
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "For Palindrome Linked List / Merge Sort split, start fast = head->next so slow stops at end of 1st half.",
    code: `ListNode* detectCycle(ListNode *head) {
  auto *s = head, *f = head;
  while (f && f->next) {
    s = s->next;
    f = f->next->next;
    if (s == f) {
      s = head;
      while (s != f) {
        s = s->next; f = f->next;
      }
      return s;
    }
  }
  return nullptr;
}`
  },

  "pat-linked-list-rev": {
    id: "pat-linked-list-rev",
    name: "Linked List Reversal & K-Group",
    category: "Linked List",
    trigger: "Reverse list, reverse [L..R], reverse in K-groups, or flatten multilevel list.",
    intuition: [
      "Always use a dummy node (ListNode dummy(0, head)) when head might change.",
      "3-pointer reversal: nxt = cur->next; cur->next = prev; prev = cur; cur = nxt;",
      "In K-Group: check if K nodes remain first, reverse them, and wire tail->next to recursive result."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Losing the pointer to cur->next before overwriting cur->next = prev.",
    code: `ListNode* reverseList(ListNode* head) {
  ListNode *prev = nullptr, *cur = head;
  while (cur) {
    ListNode* nxt = cur->next;
    cur->next = prev;
    prev = cur;
    cur = nxt;
  }
  return prev;
}`
  },

  "pat-subsets-backtrack": {
    id: "pat-subsets-backtrack",
    name: "Backtracking: Subsets, Perms & Combos",
    category: "Recursion & Backtracking",
    trigger: "Generate all subsets, permutations, or combinations summing to target.",
    intuition: [
      "Sort input first when duplicates exist!",
      "Skip duplicate branches at the same recursion depth: if (i > idx && a[i] == a[i-1]) continue;",
      "Reuse element allowed (Combination Sum I) -> recurse(i); single use -> recurse(i + 1)."
    ],
    tc: "O(2^N) or O(N!)",
    sc: "O(N) recursion stack",
    trap: "Writing (i > 0 && a[i] == a[i-1]) instead of (i > startIdx && a[i] == a[i-1]) prunes valid multi-uses.",
    code: `void dfs(int idx, int rem, vector<int>& a,
    vector<int>& cur, vector<vector<int>>& res){
  if (rem == 0) { res.push_back(cur); return; }
  for (int i = idx; i < a.size(); i++) {
    if (i > idx && a[i] == a[i-1]) continue;
    if (a[i] > rem) break; // sorted prune
    cur.push_back(a[i]);
    dfs(i + 1, rem - a[i], a, cur, res);
    cur.pop_back();
  }
}`
  },

  "pat-grid-backtrack": {
    id: "pat-grid-backtrack",
    name: "Grid Backtracking (N-Queens / Sudoku)",
    category: "Recursion & Backtracking",
    trigger: "Place items on board with row/col/diag constraints, or find word path in grid.",
    intuition: [
      "For N-Queens: row-by-row DFS; track occupied cols, (r+c) anti-diags, and (r-c+n) main-diags with bitmasks or bool arrays.",
      "For Word Search: temporarily mark board[r][c] = '#' before recursing, then restore afterward.",
      "Prune early before making recursive calls."
    ],
    tc: "O(N!) or O(4^L)",
    sc: "O(N) stack",
    trap: "Using a separate visited[][] allocation on every Word Search cell causes TLE; mutate board[r][c] in-place.",
    code: `bool dfs(int r, int c, int k,
    vector<string>& b, string& w) {
  if (k == w.size()) return true;
  if (r<0 || c<0 || r>=b.size() ||
      c>=b[0].size() || b[r][c] != w[k])
    return false;
  char tmp = b[r][c]; b[r][c] = '#';
  bool ok = dfs(r+1,c,k+1,b,w) ||
            dfs(r-1,c,k+1,b,w) ||
            dfs(r,c+1,k+1,b,w) ||
            dfs(r,c-1,k+1,b,w);
  b[r][c] = tmp;
  return ok;
}`
  },

  "pat-tree-dp": {
    id: "pat-tree-dp",
    name: "Post-Order Tree DP (Diameter / Max Path)",
    category: "Binary Trees",
    trigger: "Diameter, Max Path Sum, Balanced Tree, Distribute Coins, House Robber III.",
    intuition: [
      "Each node computes two things: 1) Best path passing THROUGH it as highest point (updates global ans).",
      "2) Best single-branch downward path returned to its parent.",
      "Clamp negative child contributions to 0: int L = max(0, dfs(u->left))."
    ],
    tc: "O(N)",
    sc: "O(H) stack",
    trap: "Returning (u->val + L + R) to the parent—a path cannot fork at two places!",
    code: `int maxPathSum(TreeNode* root) {
  int ans = INT_MIN;
  auto dfs = [&](auto& self, TreeNode* u){
    if (!u) return 0;
    int l = max(0, self(self, u->left));
    int r = max(0, self(self, u->right));
    ans = max(ans, u->val + l + r);
    return u->val + max(l, r);
  };
  dfs(dfs, root);
  return ans;
}`
  },

  "pat-tree-lca": {
    id: "pat-tree-lca",
    name: "Lowest Common Ancestor & Distance K",
    category: "Binary Trees",
    trigger: "LCA of 2 nodes, LCA of deepest leaves, or All Nodes at Distance K.",
    intuition: [
      "If root is null or p or q, return root.",
      "Recurse L and R: if both L and R are non-null, current root is the LCA!",
      "For Distance K from target: do 1 DFS to record parent[u], then run standard BFS up/left/right."
    ],
    tc: "O(N)",
    sc: "O(H)",
    trap: "In BST, don't use generic O(N) LCA—just walk down while both p,q < cur or both > cur in O(H).",
    code: `TreeNode* lowestCommonAncestor(
    TreeNode* u, TreeNode* p, TreeNode* q){
  if (!u || u == p || u == q) return u;
  auto* l = lowestCommonAncestor(u->left,p,q);
  auto* r = lowestCommonAncestor(u->right,p,q);
  if (l && r) return u;
  return l ? l : r;
}`
  },

  "pat-tree-bfs": {
    id: "pat-tree-bfs",
    name: "Tree Level Order, Views & Coordinates",
    category: "Binary Trees",
    trigger: "Right/Left View, Zigzag Level Order, Top/Bottom View, Vertical Order.",
    intuition: [
      "Snapshot int sz = q.size() at the start of each BFS level.",
      "Right Side View = last node of each level (i == sz - 1) or Preorder (Root -> Right -> Left).",
      "Vertical/Top/Bottom View: track horizontal coordinate (col - 1 for left, col + 1 for right) in map<int, ...>."
    ],
    tc: "O(N) or O(N log N)",
    sc: "O(N)",
    trap: "Using DFS for Top/Bottom view without tracking depth can overwrite a shallower node with a deeper node.",
    code: `vector<int> rightSideView(TreeNode* root) {
  if (!root) return {};
  vector<int> res;
  queue<TreeNode*> q({root});
  while (!q.empty()) {
    int sz = q.size();
    for (int i = 0; i < sz; i++) {
      auto* u = q.front(); q.pop();
      if (i == sz - 1) res.push_back(u->val);
      if (u->left) q.push(u->left);
      if (u->right) q.push(u->right);
    }
  }
  return res;
}`
  },

  "pat-bst": {
    id: "pat-bst",
    name: "BST Inorder, Validation & Bounds",
    category: "Binary Search Trees (BST)",
    trigger: "Validate BST, Kth Smallest, Recover BST, Construct BST from Preorder.",
    intuition: [
      "Inorder traversal of a BST is strictly sorted!",
      "Pass (long minVal, long maxVal) bounds down when validating or building BST from preorder.",
      "In Recover BST: find the 1st and 2nd inorder inversions (prev->val > cur->val) and swap their values."
    ],
    tc: "O(N)",
    sc: "O(H)",
    trap: "Using INT_MIN / INT_MAX instead of LONG_MIN / LONG_MAX fails when node value is INT_MIN.",
    code: `bool isValid(TreeNode* u, long lo, long hi){
  if (!u) return true;
  if (u->val <= lo || u->val >= hi)
    return false;
  return isValid(u->left, lo, u->val) &&
         isValid(u->right, u->val, hi);
}`
  },

  "pat-tree-traversal": {
    id: "pat-tree-traversal",
    name: "Tree Construction & Morris Traversal",
    category: "Binary Trees",
    trigger: "Build Tree from Preorder + Inorder, Flatten Tree, or O(1) space traversal.",
    intuition: [
      "Preorder[preIdx++] gives the root; Inorder index splits left and right subtrees.",
      "Store Inorder value -> index in an unordered_map for O(1) lookup.",
      "For Flatten Tree to Linked List: wire rightmost node of left subtree to root->right."
    ],
    tc: "O(N)",
    sc: "O(N)",
    trap: "Passing inorder index map by value instead of by reference (unordered_map<int,int>&) causes O(N^2) TLE.",
    code: `TreeNode* build(int& preIdx, int l, int r,
    vector<int>& pre,
    unordered_map<int,int>& inPos) {
  if (l > r) return nullptr;
  int v = pre[preIdx++];
  auto* u = new TreeNode(v);
  int m = inPos[v];
  u->left = build(preIdx, l, m-1, pre, inPos);
  u->right= build(preIdx, m+1, r, pre, inPos);
  return u;
}`
  },

  "pat-two-heaps": {
    id: "pat-two-heaps",
    name: "Two Heaps (Running Median / IPO)",
    category: "Heaps & Priority Queue",
    trigger: "Find Median from Data Stream, Sliding Window Median, or IPO capital/profit.",
    intuition: [
      "Max-heap 'lo' holds smaller half; Min-heap 'hi' holds larger half.",
      "Keep sizes balanced: lo.size() == hi.size() or lo.size() == hi.size() + 1.",
      "Push to lo -> move lo.top() to hi -> if hi.size() > lo.size(), move hi.top() back to lo."
    ],
    tc: "O(log N) insert, O(1) median",
    sc: "O(N)",
    trap: "Pushing directly into lo without routing through hi breaks the ordering invariant lo.top() <= hi.top().",
    code: `priority_queue<int> lo; // max-heap
priority_queue<int,vector<int>,greater<int>> hi;
void addNum(int x) {
  lo.push(x);
  hi.push(lo.top()); lo.pop();
  if (hi.size() > lo.size()) {
    lo.push(hi.top()); hi.pop();
  }
}
double findMedian() {
  return lo.size() > hi.size() ? lo.top()
    : (lo.top() + hi.top()) / 2.0;
}`
  },

  "pat-top-k-heap": {
    id: "pat-top-k-heap",
    name: "Min/Max Heap: Top-K & K-Way Merge",
    category: "Heaps & Priority Queue",
    trigger: "Kth Largest, Top-K Frequent, Merge K Sorted Lists, Reorganize String.",
    intuition: [
      "For Kth Largest / Top-K Largest: maintain a MIN-heap of size K (pop whenever pq.size() > K).",
      "For Kth Smallest / K Closest: maintain a MAX-heap of size K.",
      "For K-Way Merge: push {val, listIdx, elemIdx} into min-heap; pop min and push its next element."
    ],
    tc: "O(N log K)",
    sc: "O(K)",
    trap: "In C++, priority_queue<int> is a MAX-heap by default! Use greater<int> for a MIN-heap.",
    code: `int findKthLargest(vector<int>& a, int k) {
  priority_queue<int, vector<int>,
                 greater<int>> pq;
  for (int x : a) {
    pq.push(x);
    if (pq.size() > k) pq.pop();
  }
  return pq.top();
}`
  },

  "pat-topo-sort": {
    id: "pat-topo-sort",
    name: "Topological Sort (Kahn's BFS & Cycle)",
    category: "Graphs",
    trigger: "Course Schedule, Prerequisites, Alien Dictionary, Directed Graph Cycle / DP on DAG.",
    intuition: [
      "Compute indegree[v] for all nodes; push all nodes with indegree == 0 into queue.",
      "Pop u, append to topo order, and decrement indegree[v] for each neighbor; if indegree[v] == 0, push v.",
      "If topo.size() < N, a directed cycle exists!"
    ],
    tc: "O(V + E)",
    sc: "O(V + E)",
    trap: "Using a single visited[] array instead of 3 states (0=unvisited, 1=in-stack, 2=done) for DFS directed cycle detection.",
    code: `vector<int> topoSort(int n,
    vector<vector<int>>& adj) {
  vector<int> indeg(n, 0), res;
  for (int u = 0; u < n; u++)
    for (int v : adj[u]) indeg[v]++;
  queue<int> q;
  for (int i = 0; i < n; i++)
    if (indeg[i] == 0) q.push(i);
  while (!q.empty()) {
    int u = q.front(); q.pop();
    res.push_back(u);
    for (int v : adj[u])
      if (--indeg[v] == 0) q.push(v);
  }
  return res.size() == n ? res : vector<int>{};
}`
  },

  "pat-dijkstra": {
    id: "pat-dijkstra",
    name: "Shortest Path: Dijkstra & 0-1 BFS",
    category: "Graphs",
    trigger: "Weighted shortest path, Min Effort Path, Network Delay, Cheapest Flights.",
    intuition: [
      "Use min-heap of {dist, u}. Always skip stale heap entries: if (d > dist[u]) continue;",
      "Relax edges: if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; pq.push({dist[v], v}); }",
      "If edge weights are only 0 or 1: use deque (push_front for 0-weight, push_back for 1-weight) in O(V+E)."
    ],
    tc: "O((V + E) log V)",
    sc: "O(V + E)",
    trap: "Forgetting `if (d > dist[u]) continue;` causes exponential TLE on dense graphs!",
    code: `using P = pair<long long, int>;
priority_queue<P, vector<P>, greater<P>> pq;
vector<long long> dist(n, LLONG_MAX);
dist[src] = 0;
pq.push({0, src});
while (!pq.empty()) {
  auto [d, u] = pq.top(); pq.pop();
  if (d > dist[u]) continue; // crucial!
  for (auto [v, w] : adj[u]) {
    if (d + w < dist[v]) {
      dist[v] = d + w;
      pq.push({dist[v], v});
    }
  }
}`
  },

  "pat-dsu-mst": {
    id: "pat-dsu-mst",
    name: "Disjoint Set Union (DSU) & Kruskal MST",
    category: "Graphs",
    trigger: "Dynamic connectivity, Accounts Merge, Redundant Connection, Min Cost to Connect Points.",
    intuition: [
      "Path compression in find(x) + union by size/rank gives O(alpha(N)) ~ O(1) per operation.",
      "unite(u, v) returns false if u and v are already in the same component (cycle detected!).",
      "For Kruskal MST: sort edges by weight ascending and unite(u, v) greedily."
    ],
    tc: "O(E log E) or O(N α(N))",
    sc: "O(N)",
    trap: "Doing path compression without union-by-size/rank or forgetting iota(p.begin(), p.end(), 0).",
    code: `struct DSU {
  vector<int> p, sz;
  DSU(int n) : p(n), sz(n, 1) {
    iota(p.begin(), p.end(), 0);
  }
  int find(int x) {
    return p[x]==x ? x : p[x]=find(p[x]);
  }
  bool unite(int a, int b) {
    a = find(a); b = find(b);
    if (a == b) return false;
    if (sz[a] < sz[b]) swap(a, b);
    p[b] = a; sz[a] += sz[b];
    return true;
  }
};`
  },

  "pat-graph-advanced": {
    id: "pat-graph-advanced",
    name: "Bipartite Coloring & Tarjan Bridges",
    category: "Graphs",
    trigger: "Possible Bipartition, Is Graph Bipartite, or Critical Connections (Bridges).",
    intuition: [
      "Bipartite: 2-color BFS/DFS (color[v] = 1 - color[u]); odd-length cycle -> not bipartite.",
      "Tarjan Bridges: track tin[u] (discovery time) and low[u] (lowest reachable ancestor).",
      "Edge (u, v) is a bridge iff low[v] > tin[u] (v cannot reach u or above without (u,v))."
    ],
    tc: "O(V + E)",
    sc: "O(V)",
    trap: "In Tarjan's, only ignore the immediate parent edge, not all back-edges to parent in multigraphs.",
    code: `// Tarjan's Bridges: low[v] > tin[u]
void dfs(int u, int p, int& timer) {
  tin[u] = low[u] = ++timer;
  for (int v : adj[u]) {
    if (v == p) continue;
    if (tin[v]) low[u] = min(low[u], tin[v]);
    else {
      dfs(v, u, timer);
      low[u] = min(low[u], low[v]);
      if (low[v] > tin[u])
        bridges.push_back({u, v});
    }
  }
}`
  },

  "pat-graph-bfs-dfs": {
    id: "pat-graph-bfs-dfs",
    name: "Multi-Source BFS & Grid Components",
    category: "Graphs",
    trigger: "Rotting Oranges, 01 Matrix, Number of Islands, Word Ladder, Flood Fill.",
    intuition: [
      "For Multi-Source BFS (Rotting Oranges / 01 Matrix): push ALL initial sources (all 2s or all 0s) into queue at dist = 0 before starting BFS.",
      "Mark visited AT THE TIME OF PUSHING into queue, never when popping!",
      "Use static const int dirs[5] = {-1, 0, 1, 0, -1}; for clean 4-directional neighbor loops."
    ],
    tc: "O(R * C)",
    sc: "O(R * C)",
    trap: "Marking visited when popping from the queue instead of when pushing causes duplicate pushes and TLE/MLE.",
    code: `int dirs[5] = {-1, 0, 1, 0, -1};
while (!q.empty()) {
  auto [r, c] = q.front(); q.pop();
  for (int d = 0; d < 4; d++) {
    int nr = r + dirs[d], nc = c + dirs[d+1];
    if (nr>=0 && nc>=0 && nr<R && nc<C &&
        dist[nr][nc] == -1) {
      dist[nr][nc] = dist[r][c] + 1;
      q.push({nr, nc});
    }
  }
}`
  },

  "pat-knapsack-dp": {
    id: "pat-knapsack-dp",
    name: "0/1 & Unbounded Knapsack / Subset Sum",
    category: "Dynamic Programming",
    trigger: "Partition Equal Subset Sum, Target Sum, Coin Change I & II, Rod Cutting.",
    intuition: [
      "0/1 Knapsack (each item used at most once): iterate weight w BACKWARDS (W down to wt[i]).",
      "Unbounded Knapsack (infinite supply, e.g. Coin Change): iterate w FORWARDS (wt[i] up to W).",
      "Target Sum (+ / - signs): reduces to counting subsets with sum = (total + target) / 2."
    ],
    tc: "O(N * W)",
    sc: "O(W) 1D space-optimized",
    trap: "Iterating w forwards in 0/1 Knapsack reuses the same item multiple times!",
    code: `// 0/1 Subset Sum (iterate w backwards!)
bool canPartition(vector<int>& a) {
  int sum = accumulate(a.begin(),a.end(),0);
  if (sum % 2) return false;
  int W = sum / 2;
  vector<bool> dp(W + 1, false);
  dp[0] = true;
  for (int x : a)
    for (int w = W; w >= x; w--)
      dp[w] = dp[w] || dp[w - x];
  return dp[W];
}`
  },

  "pat-lcs-string-dp": {
    id: "pat-lcs-string-dp",
    name: "2-String DP: LCS & Edit Distance",
    category: "Dynamic Programming",
    trigger: "Longest Common Subsequence, Edit Distance, Longest Palindromic Subseq, Wildcard.",
    intuition: [
      "If s1[i-1] == s2[j-1]: dp[i][j] = 1 + dp[i-1][j-1] (or dp[i-1][j-1] for Edit Distance).",
      "Else take best of transition choices: max(dp[i-1][j], dp[i][j-1]) for LCS; 1 + min({insert, delete, replace}) for Edit Distance.",
      "Longest Palindromic Subsequence(s) = LCS(s, reverse(s))."
    ],
    tc: "O(N * M)",
    sc: "O(min(N, M))",
    trap: "Confusing Longest Common Substring (reset dp[i][j] = 0 on mismatch) with Subsequence (max(dp[i-1][j], dp[i][j-1])).",
    code: `int longestCommonSubsequence(
    string a, string b) {
  int n = a.size(), m = b.size();
  vector<int> dp(m + 1, 0);
  for (int i = 1; i <= n; i++) {
    int prev = 0; // dp[i-1][j-1]
    for (int j = 1; j <= m; j++) {
      int tmp = dp[j];
      if (a[i-1] == b[j-1]) dp[j] = 1 + prev;
      else dp[j] = max(dp[j], dp[j-1]);
      prev = tmp;
    }
  }
  return dp[m];
}`
  },

  "pat-lis-dp": {
    id: "pat-lis-dp",
    name: "LIS: O(N log N) Binary Search & Chains",
    category: "Dynamic Programming",
    trigger: "Longest Increasing Subsequence, Russian Doll Envelopes, Mountain Array.",
    intuition: [
      "Maintain sorted `tails` where tails[k] = smallest tail of any increasing subseq of length k+1.",
      "For each x: find lower_bound in tails; if at end, push_back(x), else overwrite *it = x.",
      "For 2D Russian Doll Envelopes: sort by width ASC, and by height DESC on ties, then run LIS on heights!"
    ],
    tc: "O(N log N)",
    sc: "O(N)",
    trap: "In Russian Doll Envelopes, sorting height ASC on equal widths allows picking two envelopes of the same width.",
    code: `int lengthOfLIS(vector<int>& a) {
  vector<int> tails;
  for (int x : a) {
    auto it = lower_bound(
      tails.begin(), tails.end(), x);
    if (it == tails.end())
      tails.push_back(x);
    else *it = x;
  }
  return tails.size();
}`
  },

  "pat-mcm-partition-dp": {
    id: "pat-mcm-partition-dp",
    name: "Interval / Partition DP (MCM & Balloons)",
    category: "Dynamic Programming",
    trigger: "Burst Balloons, Min Cost to Cut Stick, Matrix Chain Multiplication, Merge Stones.",
    intuition: [
      "Iterate by interval length `len` from Smallest to Largest (or `i` from N-1 down to 1, `j` from i to N).",
      "Try every split point `k` in [i..j]: think 'Which operation happens LAST in range [i..j]?'",
      "In Burst Balloons: if k is popped LAST in (i, j), its neighbors at pop time are boundary balloons a[i-1] and a[j+1]!"
    ],
    tc: "O(N³)",
    sc: "O(N²)",
    trap: "Thinking 'which balloon is popped first' makes subproblems dependent; always think 'popped LAST'.",
    code: `// Burst Balloons: pad a with 1 at both ends
int maxCoins(vector<int>& nums) {
  vector<int> a = {1};
  for (int x : nums) a.push_back(x);
  a.push_back(1);
  int n = nums.size();
  vector<vector<int>> dp(n+2,vector<int>(n+2,0));
  for (int len = 1; len <= n; len++) {
    for (int i = 1; i <= n-len+1; i++) {
      int j = i + len - 1;
      for (int k = i; k <= j; k++)
        dp[i][j] = max(dp[i][j], dp[i][k-1]
          + a[i-1]*a[k]*a[j+1] + dp[k+1][j]);
    }
  }
  return dp[1][n];
}`
  },

  "pat-stock-dp": {
    id: "pat-stock-dp",
    name: "Stock Buy & Sell State Machine DP",
    category: "Dynamic Programming",
    trigger: "Buy/Sell Stock with K transactions, Cooldown, or Transaction Fee.",
    intuition: [
      "Track two states per transaction: `hold` (max profit holding a share) and `cash` (max profit not holding).",
      "hold = max(hold, prevCash - price);  cash = max(cash, hold + price - fee).",
      "With 1-day Cooldown: buying transitions from cash[i - 2] instead of cash[i - 1]."
    ],
    tc: "O(N) or O(N * K)",
    sc: "O(1) or O(K)",
    trap: "Initializing `hold = 0` instead of `-prices[0]` or `INT_MIN / 2` allows selling without buying.",
    code: `// Stock with Transaction Fee O(N), O(1)
int maxProfit(vector<int>& p, int fee) {
  int hold = -p[0], cash = 0;
  for (int i = 1; i < p.size(); i++) {
    hold = max(hold, cash - p[i]);
    cash = max(cash, hold + p[i] - fee);
  }
  return cash;
}`
  },

  "pat-grid-dp": {
    id: "pat-grid-dp",
    name: "2D Grid DP (Paths, Min Sum & Squares)",
    category: "Dynamic Programming",
    trigger: "Unique Paths, Min Path Sum, Maximal Square, Count Square Submatrices, Dungeon Game.",
    intuition: [
      "Path DP: dp[r][c] depends on top dp[r-1][c] and left dp[r][c-1] (can compress to 1D row).",
      "Maximal Square / Count All-1 Squares: if grid[r][c] == 1, dp[r][c] = 1 + min({top, left, topLeft}).",
      "Dungeon Game (reverse DP from bottom-right): need = max(1, min(right, down) - grid[r][c])."
    ],
    tc: "O(R * C)",
    sc: "O(C)",
    trap: "For Dungeon Game, forward DP fails because you need both max sum and min prefix drop simultaneously; always go bottom-up from destination.",
    code: `// Count Square Submatrices with All 1s
int countSquares(vector<vector<int>>& g) {
  int ans = 0;
  for (int r = 0; r < g.size(); r++) {
    for (int c = 0; c < g[0].size(); c++) {
      if (g[r][c] && r > 0 && c > 0)
        g[r][c] += min({g[r-1][c],
                        g[r][c-1],
                        g[r-1][c-1]});
      ans += g[r][c];
    }
  }
  return ans;
}`
  },

  "pat-1d-dp": {
    id: "pat-1d-dp",
    name: "1D Linear DP (Robber, Word Break, Jumps)",
    category: "Dynamic Programming",
    trigger: "House Robber I/II, Decode Ways, Word Break, Count Good Numbers, Catalan.",
    intuition: [
      "House Robber: cur = max(prev1, prev2 + a[i]). For circular (Robber II): max(solve(0..n-2), solve(1..n-1)).",
      "Word Break: dp[i] = true if any j < i has dp[j] == true and s.substr(j, i-j) in dict.",
      "Unique BSTs (Catalan): G[n] += G[i-1] * G[n-i] for each root i in [1..n]."
    ],
    tc: "O(N) or O(N²)",
    sc: "O(1) or O(N)",
    trap: "In House Robber II, forgetting the edge case n == 1 when slicing [0..n-2] and [1..n-1].",
    code: `int rob(vector<int>& a) {
  int p2 = 0, p1 = 0;
  for (int x : a) {
    int cur = max(p1, p2 + x);
    p2 = p1;
    p1 = cur;
  }
  return p1;
}`
  },

  "pat-trie": {
    id: "pat-trie",
    name: "Trie (Prefix Tree)",
    category: "Tries",
    trigger: "Fast prefix search, autocomplete, Word Search II, Concatenated Words.",
    intuition: [
      "Each Node has int ch[26] (or Node* ch[26]) and bool isEnd.",
      "Use a flat vector<Node> pool in competitive/OA C++ for zero memory leaks and cache locality.",
      "In Word Search II: walk the Trie simultaneously with grid DFS to prune dead prefixes immediately."
    ],
    tc: "O(L) per word",
    sc: "O(Total Chars * 26)",
    trap: "Not marking isEnd = false after finding a word in Word Search II pushes duplicate words.",
    code: `struct Node {
  int ch[26] = {};
  bool end = false;
};
vector<Node> tr(1);
void insert(const string& s) {
  int u = 0;
  for (char c : s) {
    int i = c - 'a';
    if (!tr[u].ch[i]) {
      tr[u].ch[i] = tr.size();
      tr.emplace_back();
    }
    u = tr[u].ch[i];
  }
  tr[u].end = true;
}`
  },

  "pat-trie-xor": {
    id: "pat-trie-xor",
    name: "Bitwise Binary Trie (Max XOR)",
    category: "Tries",
    trigger: "Maximum XOR of Two Numbers, Max XOR With Element From Array, Subarray XOR.",
    intuition: [
      "Insert numbers bit-by-bit from MSB (bit 30) down to LSB (bit 0) into a 2-child Trie.",
      "To maximize (x ^ y): at each bit b, greedily try to take child (1 ^ bit); if absent, take child (bit).",
      "For offline queries (x, limit m): sort queries by m and insert array elements <= m incrementally."
    ],
    tc: "O(31 * N)",
    sc: "O(31 * N)",
    trap: "Starting from bit 0 instead of MSB (bit 30) — high bits always dominate all lower bits combined!",
    code: `int maxXor(int x) {
  int u = 0, ans = 0;
  for (int b = 30; b >= 0; b--) {
    int bit = (x >> b) & 1;
    int want = bit ^ 1;
    if (tr[u][want]) {
      ans |= (1 << b);
      u = tr[u][want];
    } else u = tr[u][bit];
  }
  return ans;
}`
  },

  "pat-segment-bit": {
    id: "pat-segment-bit",
    name: "Fenwick Tree (BIT) & Coordinate Compress",
    category: "Segment Tree & BIT",
    trigger: "Point update + Range sum query, Count Smaller Numbers After Self, Reverse Pairs.",
    intuition: [
      "Fenwick Tree is 10 lines of code and 4x faster than a Segment Tree for prefix sums/counts.",
      "add(i, delta): i += i & -i;   query(i): i -= i & -i; (1-indexed!).",
      "For Count Smaller / Inversions: coordinate-compress values via sort + unique + lower_bound."
    ],
    tc: "O(log N) per update/query",
    sc: "O(N)",
    trap: "Passing index 0 to Fenwick Tree causes an infinite loop because (0 & -0) == 0; always use 1-based indexing!",
    code: `struct BIT {
  int n; vector<int> bit;
  BIT(int n) : n(n), bit(n + 1, 0) {}
  void add(int i, int v) {
    for (; i <= n; i += i & -i) bit[i] += v;
  }
  int sum(int i) {
    int s = 0;
    for (; i > 0; i -= i & -i) s += bit[i];
    return s;
  }
};`
  },

  "pat-bit-manip": {
    id: "pat-bit-manip",
    name: "Bit Manipulation & XOR Tricks",
    category: "Bit Manipulation",
    trigger: "Single Number I/II/III, Count Set Bits, Power of 2, Bitwise AND of Range.",
    intuition: [
      "n & (n - 1) clears the lowest set bit. n & -n isolates the lowest set bit (`1 << __builtin_ctz(n)`).",
      "Single Number III (2 unique numbers): xorAll = a ^ b; diffBit = xorAll & -xorAll splits array into 2 groups.",
      "Bitwise AND of Range [m, n]: shift both right until m == n (finds common MSB prefix), then shift back."
    ],
    tc: "O(N) or O(1)",
    sc: "O(1)",
    trap: "Doing `-xorAll` on `INT_MIN` overflows signed `int` in C++; cast `unsigned int` first!",
    code: `// Single Number III: split by lowest bit
vector<int> singleNumber(vector<int>& a) {
  unsigned int xr = 0;
  for (int x : a) xr ^= x;
  unsigned int lowBit = xr & -xr;
  int x = 0, y = 0;
  for (int v : a) {
    if (v & lowBit) x ^= v;
    else y ^= v;
  }
  return {x, y};
}`
  },

  "pat-greedy": {
    id: "pat-greedy",
    name: "Greedy: Jump Game, Gas Station & Candy",
    category: "Greedy Algorithms",
    trigger: "Min Jumps, Gas Station circular tour, Candy distribution, Partition Labels.",
    intuition: [
      "Jump Game II (BFS levels in 1D): track `curEnd` of current jump and `farthest` reachable; when i == curEnd, jumps++, curEnd = farthest.",
      "Gas Station: if total gas < total cost, return -1; otherwise reset start = i + 1 whenever tank < 0.",
      "Candy: 2 passes — Left-to-Right for left neighbor, then Right-to-Left (`max(c[i], c[i+1]+1)`)."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Using O(N^2) DP for Jump Game II when greedy BFS-range tracking solves it in O(N) time and O(1) space.",
    code: `int jump(vector<int>& a) {
  int jumps = 0, curEnd = 0, far = 0;
  for (int i = 0; i < (int)a.size()-1; i++){
    far = max(far, i + a[i]);
    if (i == curEnd) {
      jumps++;
      curEnd = far;
    }
  }
  return jumps;
}`
  },

  "pat-matrix-traversal": {
    id: "pat-matrix-traversal",
    name: "Matrix: Spiral, Rotate 90° & Zeroes",
    category: "Matrix / Grid",
    trigger: "Spiral Matrix, Rotate Image 90° in-place, Set Matrix Zeroes O(1) space.",
    intuition: [
      "Rotate 90° Clockwise in-place: 1) Transpose (`swap(m[i][j], m[j][i])` for i < j), 2) Reverse each row.",
      "Spiral Matrix: maintain 4 boundaries (top, bot, left, right) and check `top <= bot && left <= right` after shrinking.",
      "Set Matrix Zeroes O(1): use row 0 and col 0 as markers, plus a single `bool col0` flag."
    ],
    tc: "O(R * C)",
    sc: "O(1) aux",
    trap: "In Transpose, looping j from 0 to N-1 instead of i+1 to N-1 swaps every element twice (back to original!).",
    code: `void rotate(vector<vector<int>>& m) {
  int n = m.size();
  for (int i = 0; i < n; i++)
    for (int j = i + 1; j < n; j++)
      swap(m[i][j], m[j][i]);
  for (auto& row : m)
    reverse(row.begin(), row.end());
}`
  },

  "pat-string-algo": {
    id: "pat-string-algo",
    name: "Strings: Palindrome Expand & KMP LPS",
    category: "Strings",
    trigger: "Longest Palindromic Substring, Palindromic Substrings, KMP Substring Search, Shortest Palindrome.",
    intuition: [
      "Palindrome Expand Around Center: expand from both odd centers (i, i) and even centers (i, i+1) in O(N^2) time, O(1) space.",
      "KMP LPS array: lps[i] = longest proper prefix of pat[0..i] that is also a suffix.",
      "Shortest Palindrome: compute KMP LPS of `s + '#' + reverse(s)` to find longest palindromic prefix."
    ],
    tc: "O(N) KMP / O(N²) Expand",
    sc: "O(N) or O(1)",
    trap: "Forgetting even-length palindrome centers (i, i+1) like 'abba'.",
    code: `// KMP LPS Table Construction O(N)
vector<int> buildLPS(const string& p) {
  int n = p.size();
  vector<int> lps(n, 0);
  for (int i = 1, len = 0; i < n; ) {
    if (p[i] == p[len]) lps[i++] = ++len;
    else if (len) len = lps[len - 1];
    else lps[i++] = 0;
  }
  return lps;
}`
  },

  "pat-stl-essentials": {
    id: "pat-stl-essentials",
    name: "C++ STL & Fast Math Essentials",
    category: "Beginner & Fundamentals",
    trigger: "Binary Exponentiation, GCD/Sieve, Custom Comparator, Fast STL idioms.",
    intuition: [
      "Binary Exponentiation: compute a^b % MOD in O(log b) by squaring `a` and checking `if (b & 1)`.",
      "Use `std::gcd(a, b)`, `__builtin_popcountll(x)`, `nth_element`, `lower_bound`.",
      "Custom lambda comparator in priority_queue or sort avoids verbose struct boilerplate."
    ],
    tc: "O(log N)",
    sc: "O(1)",
    trap: "Integer overflow in `a * a % MOD` when `a` is `int`—always promote `long long` before multiplying!",
    code: `long long modPow(long long a, long long b,
                 long long m = 1e9 + 7) {
  long long res = 1;
  a %= m;
  while (b > 0) {
    if (b & 1) res = res * a % m;
    a = a * a % m;
    b >>= 1;
  }
  return res;
}`
  }
};
