// Problem-specific C++ STL cards for top placement classics across all 5 sheets
window.CARDS_CPP = {
  "gfg-write-a-program-to-reverse-an-array-or-string": {
    gist: "Reverse an array or string in-place using O(1) extra space.",
    trigger: "Inward Two Pointers (l = 0, r = n - 1) swapping elements, or std::reverse.",
    intuition: [
      "Initialize two pointers l = 0 and r = n - 1.",
      "Swap a[l++] and a[r--] while l < r.",
      "In C++ STL, use reverse(a.begin(), a.end()) directly in O(N) time."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Looping i from 0 to n-1 instead of n/2 swaps the array twice and restores the original order.",
    code: `void reverseArray(vector<int>& a) {
  int l = 0, r = (int)a.size() - 1;
  while (l < r) {
    swap(a[l++], a[r--]);
  }
  // Or STL: reverse(a.begin(), a.end());
}`
  },

  "gfg-maximum-and-minimum-in-an-array": {
    gist: "Find minimum and maximum elements in an array with minimum number of comparisons.",
    trigger: "Compare elements in pairs (i, i+1) or use std::minmax_element.",
    intuition: [
      "Comparing in pairs takes 3 comparisons per 2 elements -> ~1.5N total comparisons.",
      "In C++ STL, minmax_element(a.begin(), a.end()) uses this exact 1.5N pairwise algorithm.",
      "Returns a pair of iterators {min_it, max_it}."
    ],
    tc: "O(N) — 1.5N comps",
    sc: "O(1)",
    trap: "Naive independent min and max checks do 2N - 2 comparisons instead of 1.5N.",
    code: `pair<int, int> getMinMax(const vector<int>& a) {
  auto [mnIt, mxIt] = minmax_element(
      a.begin(), a.end());
  return {*mnIt, *mxIt};
}`
  },

  "gfg-kth-smallest-element": {
    gist: "Find the K-th smallest element in an unsorted array in O(N) average time.",
    trigger: "Quickselect via C++ STL std::nth_element (or Max-Heap of size K).",
    intuition: [
      "std::nth_element(a.begin(), a.begin() + k - 1, a.end()) partitions around the (k-1)-th index in O(N) average time.",
      "Alternatively, maintain a max-heap priority_queue<int> of size K in O(N log K)."
    ],
    tc: "O(N) avg",
    sc: "O(1)",
    trap: "K-th smallest is at 0-based index `k - 1`, not `k`.",
    code: `int kthSmallest(vector<int>& a, int k) {
  nth_element(a.begin(),
              a.begin() + k - 1,
              a.end());
  return a[k - 1];
}`
  },

  "lc-sort-colors": {
    gist: "Sort an array of 0s, 1s, and 2s in a single pass and O(1) space.",
    trigger: "Dutch National Flag 3-way partition: low (0s), mid (1s), high (2s).",
    intuition: [
      "Invariant: [0..lo-1] are 0s, [lo..mid-1] are 1s, [mid..hi] unknown, [hi+1..n-1] are 2s.",
      "If a[mid] == 0: swap(a[lo++], a[mid++]). If a[mid] == 1: mid++.",
      "If a[mid] == 2: swap(a[mid], a[hi--]) — do NOT increment mid yet!"
    ],
    tc: "O(N) — 1 pass",
    sc: "O(1)",
    trap: "Incrementing `mid` after swapping with `hi` skips inspecting the newly swapped value from `hi`.",
    code: `void sortColors(vector<int>& a) {
  int lo = 0, mid = 0, hi = (int)a.size() - 1;
  while (mid <= hi) {
    if (a[mid] == 0) swap(a[lo++], a[mid++]);
    else if (a[mid] == 1) mid++;
    else swap(a[mid], a[hi--]);
  }
}`
  },

  "gfg-move-negative-numbers-beginning-positive-end-constant-extra-space": {
    gist: "Move all negative numbers to the beginning and positive numbers to the end in O(1) space.",
    trigger: "Two-pointer partition (Lomuto/Hoare) or std::partition.",
    intuition: [
      "If relative order doesn't matter: maintain write pointer `j = 0`; whenever `a[i] < 0`, `swap(a[i], a[j++])`.",
      "In STL: `partition(a.begin(), a.end(), [](int x){ return x < 0; });`",
      "If order matters: use `stable_partition`."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Clarify with interviewer whether relative order of elements must be preserved.",
    code: `void moveNegatives(vector<int>& a) {
  int j = 0;
  for (int i = 0; i < (int)a.size(); i++) {
    if (a[i] < 0) swap(a[i], a[j++]);
  }
}`
  },

  "gfg-union-of-two-arrays": {
    gist: "Find count of elements in the union of two arrays (distinct elements across both).",
    trigger: "Unordered_set for unsorted arrays O(N+M), or Two Pointers for sorted arrays.",
    intuition: [
      "For unsorted arrays: insert all elements of both arrays into `unordered_set<int>` and return `st.size()`.",
      "For sorted arrays: advance two pointers `i` and `j`, skipping duplicates."
    ],
    tc: "O(N + M)",
    sc: "O(N + M)",
    trap: "When arrays are already sorted, using a hash set wastes O(N+M) space compared to two pointers.",
    code: `int doUnion(vector<int>& a, vector<int>& b) {
  unordered_set<int> st(a.begin(), a.end());
  st.insert(b.begin(), b.end());
  return st.size();
}`
  },

  "gfg-cyclically-rotate-an-array-by-one": {
    gist: "Rotate an array clockwise by 1 position (or k positions) in-place.",
    trigger: "3-Reversal algorithm or std::rotate.",
    intuition: [
      "To rotate right by k: k %= n; reverse all -> reverse first k -> reverse remaining n-k.",
      "In C++ STL: `rotate(a.rbegin(), a.rbegin() + (k % n), a.rend());` rotates right by k in-place."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Forgetting `k %= n` when rotating by `k >= n` causes out-of-bounds iterator errors.",
    code: `void rotateRight(vector<int>& a, int k = 1) {
  int n = a.size();
  k %= n;
  reverse(a.begin(), a.end());
  reverse(a.begin(), a.begin() + k);
  reverse(a.begin() + k, a.end());
}`
  },

  "lc-maximum-subarray": {
    gist: "Find contiguous subarray with the largest sum (Kadane's Algorithm).",
    trigger: "Running sum `cur = max(x, cur + x)`; track global `best = max(best, cur)`.",
    intuition: [
      "At each element x, either extend the previous subarray (`cur + x`) or start fresh at `x`.",
      "If previous running sum `cur < 0`, it can only hurt future sums, so reset to `x`.",
      "Update `best = max(best, cur)` at every step."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Initializing `best = 0` fails when all numbers in the array are negative; initialize `best = a[0]`.",
    code: `int maxSubArray(const vector<int>& a) {
  int cur = a[0], best = a[0];
  for (size_t i = 1; i < a.size(); i++) {
    cur = max(a[i], cur + a[i]);
    best = max(best, cur);
  }
  return best;
}`
  },

  "gfg-minimize-the-heights": {
    gist: "Add or subtract K from each tower height once (heights >= 0) to minimize (max - min).",
    trigger: "Sort array + try every split point i where [0..i-1] get +K and [i..n-1] get -K.",
    intuition: [
      "Sort array first. Baseline answer is `a[n-1] - a[0]`.",
      "In optimal config, smaller elements get `+K` and larger elements get `-K`. Try split before index `i`:",
      "New min is `min(a[0] + k, a[i] - k)`, new max is `max(a[i-1] + k, a[n-1] - k)`."
    ],
    tc: "O(N log N)",
    sc: "O(1)",
    trap: "Skip any split `i` where `a[i] - k < 0` when negative heights are disallowed.",
    code: `int getMinDiff(vector<int>& a, int k) {
  int n = a.size();
  sort(a.begin(), a.end());
  int ans = a[n - 1] - a[0];
  for (int i = 1; i < n; i++) {
    if (a[i] - k < 0) continue;
    int mn = min(a[0] + k, a[i] - k);
    int mx = max(a[i - 1] + k, a[n - 1] - k);
    ans = min(ans, mx - mn);
  }
  return ans;
}`
  },

  "gfg-minimum-number-of-jumps": {
    gist: "Minimum jumps to reach end of array where a[i] is max jump length from i.",
    trigger: "Greedy BFS-on-array: track `curEnd` of current jump and `farthest` reachable.",
    intuition: [
      "Scan `i` from `0` to `n - 2`, updating `farthest = max(farthest, i + a[i])`.",
      "When `i == curEnd`, we MUST take a jump: `jumps++`, `curEnd = farthest`.",
      "If `curEnd <= i`, we are stuck and cannot move forward -> return -1."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Using O(N^2) DP when O(N) Greedy interval expansion solves it in one pass.",
    code: `int minJumps(const vector<int>& a) {
  int n = a.size();
  if (n <= 1) return 0;
  if (a[0] == 0) return -1;
  int jumps = 0, curEnd = 0, far = 0;
  for (int i = 0; i < n - 1; i++) {
    far = max(far, i + a[i]);
    if (i == curEnd) {
      jumps++;
      curEnd = far;
      if (curEnd <= i) return -1;
    }
  }
  return jumps;
}`
  },

  "lc-merge-sorted-array": {
    gist: "Merge two sorted arrays in-place without extra space.",
    trigger: "Backwards 3-pointer merge from the end (or swap boundary + sort for separate arrays).",
    intuition: [
      "For LeetCode 88 (`a` has buffer at end): fill from index `k = m + n - 1` backwards comparing `a[i]` and `b[j]`.",
      "For GFG two separate arrays: swap `a[n-1-i]` with `b[i]` while `a[n-1-i] > b[i]`, then sort both."
    ],
    tc: "O(M + N)",
    sc: "O(1)",
    trap: "Merging left-to-right overwrites elements in `a` before they are read.",
    code: `void merge(vector<int>& a, int m,
           vector<int>& b, int n) {
  int i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 && a[i] > b[j]) a[k--] = a[i--];
    else a[k--] = b[j--];
  }
}`
  },

  "lc-merge-intervals": {
    gist: "Merge all overlapping intervals and return non-overlapping intervals.",
    trigger: "Sort by start time ASC; merge if `cur.start <= res.back().end`.",
    intuition: [
      "Sort intervals by `start` time.",
      "Push first interval. For each subsequent `[s, e]`, if `s <= res.back()[1]`, update `res.back()[1] = max(res.back()[1], e)`.",
      "Otherwise append `[s, e]` as a new disjoint interval."
    ],
    tc: "O(N log N)",
    sc: "O(1) aux",
    trap: "Setting `res.back()[1] = e` instead of `max(res.back()[1], e)` breaks when one interval is completely inside another (e.g. [1,6] and [2,4]).",
    code: `vector<vector<int>> merge(
    vector<vector<int>>& iv) {
  sort(iv.begin(), iv.end());
  vector<vector<int>> res;
  for (auto& cur : iv) {
    if (res.empty() || res.back()[1] < cur[0])
      res.push_back(cur);
    else
      res.back()[1] = max(res.back()[1], cur[1]);
  }
  return res;
}`
  },

  "lc-count-the-number-of-inversions": {
    gist: "Count pairs (i, j) such that i < j and a[i] > a[j].",
    trigger: "Divide & Conquer Merge Sort: when `a[right] < a[left]`, add `(mid - left + 1)` inversions.",
    intuition: [
      "During Merge Sort, left half `[l..mid]` and right half `[mid+1..r]` are both sorted.",
      "If `a[i] > a[j]` (with `i` in left, `j` in right), then ALL remaining elements `a[i..mid]` are also `> a[j]`.",
      "Add `(mid - i + 1)` to total inversions."
    ],
    tc: "O(N log N)",
    sc: "O(N)",
    trap: "Total inversions can be N*(N-1)/2 (~5*10^9 for N=10^5), which overflows 32-bit `int`; use `long long`.",
    code: `long long mergeCnt(vector<int>& a, int l, int r){
  if (l >= r) return 0;
  int m = l + (r - l) / 2;
  long long cnt = mergeCnt(a, l, m)
                + mergeCnt(a, m + 1, r);
  vector<int> tmp;
  int i = l, j = m + 1;
  while (i <= m && j <= r) {
    if (a[i] <= a[j]) tmp.push_back(a[i++]);
    else {
      cnt += (m - i + 1);
      tmp.push_back(a[j++]);
    }
  }
  while (i <= m) tmp.push_back(a[i++]);
  while (j <= r) tmp.push_back(a[j++]);
  copy(tmp.begin(), tmp.end(), a.begin() + l);
  return cnt;
}`
  },

  "lc-best-time-to-buy-and-sell-stock": {
    gist: "Maximize profit by choosing a single day to buy and a future day to sell.",
    trigger: "Track running minimum price `minP` and max profit `max(ans, p - minP)`.",
    intuition: [
      "As we scan prices left-to-right, the best day to buy before today is the minimum price seen so far.",
      "Update `minP = min(minP, p)` and `profit = max(profit, p - minP)`."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Confusing Stock I (single transaction) with Stock II (unlimited transactions, which sums all `max(0, p[i] - p[i-1])`).",
    code: `int maxProfit(const vector<int>& prices) {
  int minP = INT_MAX, best = 0;
  for (int p : prices) {
    minP = min(minP, p);
    best = max(best, p - minP);
  }
  return best;
}`
  },

  "lc-trapping-rain-water": {
    gist: "Compute how much water can be trapped between bars of height[i] after raining.",
    trigger: "Inward Two Pointers tracking `lMax` and `rMax` in O(1) space.",
    intuition: [
      "Water at index i is `min(maxLeft, maxRight) - h[i]`.",
      "Maintain `l = 0, r = n - 1` and `lMax = 0, rMax = 0`.",
      "Always advance the side with the smaller height: its water level is bottlenecked by its own side's max."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Using O(N) prefix/suffix arrays or monotonic stack when two pointers uses O(1) auxiliary memory.",
    code: `int trap(const vector<int>& h) {
  int l = 0, r = (int)h.size() - 1;
  int lMax = 0, rMax = 0, ans = 0;
  while (l < r) {
    if (h[l] <= h[r]) {
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

  "lc-maximum-product-subarray": {
    gist: "Find contiguous subarray within an array that has the largest product.",
    trigger: "Track both `curMax` and `curMin` (swap on negative) or prefix/suffix product scan.",
    intuition: [
      "A negative number flips the smallest (most negative) product into the largest product.",
      "At each `x`: if `x < 0`, `swap(mx, mn)`. Then `mx = max(x, mx * x)`, `mn = min(x, mn * x)`.",
      "Alternative: max of prefix product (L->R) and suffix product (R->L), resetting 0s to 1."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Updating `mx` first and then using the NEW `mx` to compute `mn` without saving old `mx` or swapping first.",
    code: `int maxProduct(const vector<int>& a) {
  int mx = a[0], mn = a[0], ans = a[0];
  for (size_t i = 1; i < a.size(); i++) {
    if (a[i] < 0) swap(mx, mn);
    mx = max(a[i], mx * a[i]);
    mn = min(a[i], mn * a[i]);
    ans = max(ans, mx);
  }
  return ans;
}`
  },

  "lc-longest-substring-without-repeating-characters": {
    gist: "Find the length of the longest substring without duplicate characters.",
    trigger: "Sliding Window with last-seen index lookup table `last[128]`.",
    intuition: [
      "Store the last seen index of every ASCII char in `int last[128]` initialized to `-1`.",
      "When `last[s[r]] >= l`, jump left pointer directly to `l = last[s[r]] + 1`.",
      "Update `last[s[r]] = r` and `ans = max(ans, r - l + 1)`."
    ],
    tc: "O(N)",
    sc: "O(1) — 128 ints",
    trap: "Moving `l = last[s[r]] + 1` without `max(l, ...)` can move `l` backwards onto an older duplicate!",
    code: `int lengthOfLongestSubstring(string s) {
  vector<int> last(128, -1);
  int l = 0, ans = 0;
  for (int r = 0; r < (int)s.size(); r++) {
    l = max(l, last[s[r]] + 1);
    last[s[r]] = r;
    ans = max(ans, r - l + 1);
  }
  return ans;
}`
  },

  "lc-subarray-sum-equals-k": {
    gist: "Count total number of contiguous subarrays whose sum equals K.",
    trigger: "Prefix Sum + Hash Map counting occurrences of `(curSum - K)`.",
    intuition: [
      "Subarray `a[i..j]` sums to `K` iff `pref[j] - pref[i-1] == K`, i.e., `pref[i-1] == pref[j] - K`.",
      "Seed `unordered_map<int,int> freq` with `freq[0] = 1`.",
      "At each element: `sum += x`, `ans += freq[sum - k]`, `freq[sum]++`."
    ],
    tc: "O(N)",
    sc: "O(N)",
    trap: "Using Sliding Window fails when array contains negative numbers! Always use Prefix Sum + Hash Map if negatives exist.",
    code: `int subarraySum(vector<int>& a, int k) {
  unordered_map<int, int> mp = {{0, 1}};
  int sum = 0, ans = 0;
  for (int x : a) {
    sum += x;
    if (mp.count(sum - k)) ans += mp[sum - k];
    mp[sum]++;
  }
  return ans;
}`
  },

  "lc-majority-element": {
    gist: "Find element appearing more than floor(n / 2) times in O(N) time and O(1) space.",
    trigger: "Boyer-Moore Voting Algorithm: cancel out distinct pairs.",
    intuition: [
      "Maintain `cand` and `cnt = 0`. When `cnt == 0`, set `cand = x`.",
      "If `x == cand`, `cnt++`; else `cnt--`.",
      "Since majority element occurs > N/2 times, it survives all pairwise cancellations."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "If majority element is NOT guaranteed to exist, you must do a 2nd pass to verify `count(cand) > n/2`.",
    code: `int majorityElement(const vector<int>& a) {
  int cand = 0, cnt = 0;
  for (int x : a) {
    if (cnt == 0) cand = x;
    cnt += (x == cand) ? 1 : -1;
  }
  return cand;
}`
  },

  "lc-powx-n": {
    gist: "Compute x raised to the power n (x^n) in O(log |n|) time.",
    trigger: "Binary Exponentiation: square base `x *= x` and halve exponent `n >>= 1`.",
    intuition: [
      "Convert `n` to `long long exp = n` before negating to prevent `INT_MIN` overflow.",
      "If `exp < 0`, set `x = 1.0 / x` and `exp = -exp`.",
      "Whenever `exp & 1`, multiply `res *= x`; then `x *= x; exp >>= 1`."
    ],
    tc: "O(log |N|)",
    sc: "O(1)",
    trap: "Doing `-n` when `n == INT_MIN (-2147483648)` overflows 32-bit signed `int`.",
    code: `double myPow(double x, int n) {
  long long e = n;
  if (e < 0) { x = 1.0 / x; e = -e; }
  double res = 1.0;
  while (e > 0) {
    if (e & 1) res *= x;
    x *= x;
    e >>= 1;
  }
  return res;
}`
  },

  "lc-3sum": {
    gist: "Find all unique triplets [a[i], a[j], a[k]] summing to 0.",
    trigger: "Sort + fix i + inward Two Pointers (L, R) with duplicate skipping.",
    intuition: [
      "Sort array ASC. If a[i] > 0, break early (remaining elements > 0).",
      "Skip duplicate i: if (i > 0 && a[i] == a[i-1]) continue;",
      "Use L = i+1, R = n-1; on sum == 0, push triplet and advance L, R past duplicates."
    ],
    tc: "O(N²)",
    sc: "O(1) aux",
    trap: "Forgetting to skip duplicates on L and R after recording a valid triplet.",
    code: `vector<vector<int>> threeSum(vector<int>& a){
  sort(a.begin(), a.end());
  vector<vector<int>> res;
  int n = a.size();
  for (int i = 0; i < n && a[i] <= 0; i++){
    if (i > 0 && a[i] == a[i-1]) continue;
    int l = i + 1, r = n - 1;
    while (l < r) {
      int s = a[i] + a[l] + a[r];
      if (s < 0) l++;
      else if (s > 0) r--;
      else {
        res.push_back({a[i], a[l++], a[r--]});
        while (l<r && a[l]==a[l-1]) l++;
      }
    }
  }
  return res;
}`
  },

  "lc-next-permutation": {
    gist: "Rearrange array into lexicographically next greater permutation in-place.",
    trigger: "Find rightmost dip i (a[i] < a[i+1]), swap with smallest > a[i] on right, reverse suffix.",
    intuition: [
      "1) Scan from right for first 'dip' index i where a[i] < a[i+1].",
      "2) If i >= 0, scan from right for first j where a[j] > a[i], and swap(a[i], a[j]).",
      "3) Reverse the strictly decreasing suffix [i+1 .. n-1] to make it minimal."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Using < instead of <= when scanning from right, or forgetting STL has next_permutation(a.begin(), a.end()).",
    code: `void nextPermutation(vector<int>& a) {
  int n = a.size(), i = n - 2;
  while (i >= 0 && a[i] >= a[i + 1]) i--;
  if (i >= 0) {
    int j = n - 1;
    while (a[j] <= a[i]) j--;
    swap(a[i], a[j]);
  }
  reverse(a.begin() + i + 1, a.end());
}`
  },

  "lc-longest-consecutive-sequence": {
    gist: "Find length of longest consecutive elements sequence in O(N) time.",
    trigger: "Unordered_set lookup — only start counting from sequence head (!st.count(x - 1)).",
    intuition: [
      "Insert all elements into an unordered_set<int> st.",
      "Only start a while-loop at x if (x - 1) is NOT in st (guarantees x is start of a streak).",
      "Count x, x+1, x+2... in O(1) amortized per element."
    ],
    tc: "O(N) average",
    sc: "O(N)",
    trap: "Iterating over the input vector `a` (which may have duplicates) instead of iterating over the deduplicated `unordered_set`.",
    code: `int longestConsecutive(vector<int>& a) {
  unordered_set<int> st(a.begin(), a.end());
  int ans = 0;
  for (int x : st) {
    if (!st.count(x - 1)) {
      int cur = x;
      while (st.count(cur + 1)) cur++;
      ans = max(ans, cur - x + 1);
    }
  }
  return ans;
}`
  },

  "lc-find-the-duplicate-number": {
    gist: "n+1 integers in [1..n]; find the duplicate in O(1) space without modifying array.",
    trigger: "Floyd's Tortoise & Hare cycle detection on functional graph i -> a[i].",
    intuition: [
      "Treat array values as next pointers: slow = a[slow], fast = a[a[fast]].",
      "Index 0 is never pointed to (values in 1..n), so 0 is outside the cycle.",
      "After slow == fast, reset slow = a[0] (or 0) and advance both 1 step to find cycle entry."
    ],
    tc: "O(N)",
    sc: "O(1)",
    trap: "Starting slow=0, fast=0 with `while (slow != fast)` immediately exits unless you use a `do-while` loop.",
    code: `int findDuplicate(vector<int>& a) {
  int s = a[0], f = a[0];
  do {
    s = a[s];
    f = a[a[f]];
  } while (s != f);
  s = a[0];
  while (s != f) {
    s = a[s];
    f = a[f];
  }
  return s;
}`
  },

  "lc-search-a-2d-matrix": {
    gist: "Row-sorted matrix where first element of row i > last element of row i-1.",
    trigger: "Treat R x C matrix as a flat sorted 1D array of size R*C; index mid -> [mid/C][mid%C].",
    intuition: [
      "Binary search in [0 .. R*C - 1].",
      "Row index = mid / C, Column index = mid % C.",
      "For Search 2D Matrix II (rows & cols sorted independently): start at top-right (r=0, c=C-1) in O(R+C)."
    ],
    tc: "O(log(R * C))",
    sc: "O(1)",
    trap: "Dividing/modding by R instead of C (always use number of columns C: mid / C, mid % C)!",
    code: `bool searchMatrix(vector<vector<int>>& m,
                  int target) {
  int R = m.size(), C = m[0].size();
  int lo = 0, hi = R * C - 1;
  while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    int v = m[mid / C][mid % C];
    if (v == target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}`
  },

  "lc-spiral-matrix": {
    gist: "Return all elements of an m x n matrix in clockwise spiral order.",
    trigger: "4 shrinking boundaries: top, bot, left, right.",
    intuition: [
      "Traverse: Top row (L->R), top++ -> Right col (T->B), right--.",
      "Check `if (top <= bot)` before Bottom row (R->L), bot--.",
      "Check `if (left <= right)` before Left col (B->T), left++."
    ],
    tc: "O(R * C)",
    sc: "O(1) aux",
    trap: "Skipping the `if (top <= bot)` / `if (left <= right)` guards duplicates the middle row/col on non-square matrices.",
    code: `vector<int> spiralOrder(
    vector<vector<int>>& m) {
  int T=0, B=m.size()-1, L=0, R=m[0].size()-1;
  vector<int> res;
  while (T <= B && L <= R) {
    for (int c=L; c<=R; c++) res.push_back(m[T][c]);
    T++;
    for (int r=T; r<=B; r++) res.push_back(m[r][R]);
    R--;
    if (T <= B) {
      for (int c=R; c>=L; c--) res.push_back(m[B][c]);
      B--;
    }
    if (L <= R) {
      for (int r=B; r>=T; r--) res.push_back(m[r][L]);
      L++;
    }
  }
  return res;
}`
  },

  "lc-minimum-window-substring": {
    gist: "Smallest substring of s containing all characters of t (including duplicates).",
    trigger: "Variable Sliding Window with need[128] frequency counter + missing char counter.",
    intuition: [
      "Initialize need[c]++ for c in t, and `rem = t.size()`.",
      "Expand r: if `need[s[r]]-- > 0`, decrement `rem`.",
      "While `rem == 0`: update best window (start, len), and shrink l (`if (++need[s[l++]] > 0) rem++`)."
    ],
    tc: "O(|S| + |T|)",
    sc: "O(1) — 128 ASCII array",
    trap: "Calling `s.substr()` inside the inner loop on every update causes O(N^2) MLE/TLE; store `(bestStart, minLen)` and slice once at return.",
    code: `string minWindow(string s, string t) {
  int need[128] = {};
  for (char c : t) need[c]++;
  int rem = t.size(), l = 0, st = 0, len = 1e9;
  for (int r = 0; r < s.size(); r++) {
    if (need[s[r]]-- > 0) rem--;
    while (rem == 0) {
      if (r - l + 1 < len) {
        st = l; len = r - l + 1;
      }
      if (++need[s[l++]] > 0) rem++;
    }
  }
  return len == 1e9 ? "" : s.substr(st, len);
}`
  },

  "lc-median-of-two-sorted-arrays": {
    gist: "Find median of two sorted arrays of sizes n1 and n2 in O(log(min(n1, n2))).",
    trigger: "Binary search the partition cut `i` on the smaller array so left half has (n1+n2+1)/2 elements.",
    intuition: [
      "Ensure a.size() <= b.size(). Binary search cut `c1` in [0..n1]; `c2 = half - c1`.",
      "Valid partition when `l1 <= r2 && l2 <= r1`.",
      "If `l1 > r2`: move left (`hi = c1 - 1`); else move right (`lo = c1 + 1`)."
    ],
    tc: "O(log(min(N, M)))",
    sc: "O(1)",
    trap: "Off-by-one when total length is odd vs even; with `half = (n1 + n2 + 1) / 2`, odd median is simply `max(l1, l2)`.",
    code: `double findMedianSortedArrays(
    vector<int>& a, vector<int>& b) {
  if (a.size() > b.size()) swap(a, b);
  int n1 = a.size(), n2 = b.size();
  int lo = 0, hi = n1, half = (n1+n2+1)/2;
  while (lo <= hi) {
    int c1 = (lo + hi) / 2, c2 = half - c1;
    int l1 = c1 ? a[c1-1] : INT_MIN;
    int r1 = c1 < n1 ? a[c1] : INT_MAX;
    int l2 = c2 ? b[c2-1] : INT_MIN;
    int r2 = c2 < n2 ? b[c2] : INT_MAX;
    if (l1 <= r2 && l2 <= r1) {
      if ((n1 + n2) % 2) return max(l1, l2);
      return (max(l1,l2) + min(r1,r2)) / 2.0;
    }
    if (l1 > r2) hi = c1 - 1;
    else lo = c1 + 1;
  }
  return 0.0;
}`
  },

  "lc-rotting-oranges": {
    gist: "Min minutes until no fresh orange (1) remains; rotten (2) spreads 4-directionally each minute.",
    trigger: "Multi-Source BFS: push all initial 2s into queue, count fresh 1s, process level by level.",
    intuition: [
      "Count `fresh` oranges and push all initial rotten `(r, c)` cells into `queue`.",
      "If `fresh == 0`, return 0 immediately!",
      "Each BFS level increments `mins` and decrements `fresh` when infecting a neighbor."
    ],
    tc: "O(R * C)",
    sc: "O(R * C)",
    trap: "Returning `mins` without checking `fresh == 0` (unreachable fresh oranges must return -1).",
    code: `int orangesRotting(vector<vector<int>>& g) {
  int R = g.size(), C = g[0].size(), fresh = 0;
  queue<pair<int,int>> q;
  for (int r = 0; r < R; r++)
    for (int c = 0; c < C; c++)
      if (g[r][c] == 2) q.push({r, c});
      else if (g[r][c] == 1) fresh++;
  int mins = 0, d[5] = {-1, 0, 1, 0, -1};
  while (!q.empty() && fresh > 0) {
    mins++;
    for (int sz = q.size(); sz--; ) {
      auto [r, c] = q.front(); q.pop();
      for (int k = 0; k < 4; k++) {
        int nr = r+d[k], nc = c+d[k+1];
        if (nr>=0 && nc>=0 && nr<R && nc<C
            && g[nr][nc] == 1) {
          g[nr][nc] = 2; fresh--;
          q.push({nr, nc});
        }
      }
    }
  }
  return fresh == 0 ? mins : -1;
}`
  },

  "lc-cheapest-flights-within-k-stops": {
    gist: "Find cheapest price from src to dst with at most K stops.",
    trigger: "Bellman-Ford (K+1 iterations) or BFS by stops (level-wise relaxation).",
    intuition: [
      "At most K stops = at most K + 1 edges.",
      "Run K + 1 rounds of Bellman-Ford using a `tmp = dist` copy so each round uses at most 1 new edge.",
      "Standard Dijkstra on `dist[u]` fails if you prune a slightly costlier path that used fewer stops!"
    ],
    tc: "O((K + 1) * E)",
    sc: "O(V)",
    trap: "Relaxing `dist[]` in-place without a `tmp` copy allows chaining multiple edges in a single stop iteration.",
    code: `int findCheapestPrice(int n,
    vector<vector<int>>& flights,
    int src, int dst, int k) {
  vector<int> dist(n, 1e9);
  dist[src] = 0;
  for (int i = 0; i <= k; i++) {
    vector<int> nxt = dist;
    for (auto& e : flights) {
      int u = e[0], v = e[1], w = e[2];
      if (dist[u] != 1e9)
        nxt[v] = min(nxt[v], dist[u] + w);
    }
    dist = move(nxt);
  }
  return dist[dst] == 1e9 ? -1 : dist[dst];
}`
  },

  "lc-word-ladder": {
    gist: "Shortest transformation sequence from beginWord to endWord changing 1 letter at a time.",
    trigger: "Unweighted Shortest Path -> Level-order BFS trying 'a'..'z' at each character position.",
    intuition: [
      "Put `wordList` into an `unordered_set<string> dict`. If `endWord` not in `dict`, return 0.",
      "In BFS: for each word, mutate each position `i` from `'a'` to `'z'`.",
      "If mutated word is in `dict`, push to queue and `dict.erase(w)` immediately (acts as visited)."
    ],
    tc: "O(N * L * 26)",
    sc: "O(N * L)",
    trap: "Checking all pairs of words O(N^2 * L) instead of mutating 26 letters O(N * 26 * L) causes TLE.",
    code: `int ladderLength(string b, string e,
                 vector<string>& list) {
  unordered_set<string> st(list.begin(),list.end());
  if (!st.count(e)) return 0;
  queue<string> q({b});
  int steps = 1;
  while (!q.empty()) {
    for (int sz = q.size(); sz--; ) {
      string w = q.front(); q.pop();
      if (w == e) return steps;
      for (char& ch : w) {
        char orig = ch;
        for (char c = 'a'; c <= 'z'; c++) {
          ch = c;
          if (st.erase(w)) q.push(w);
        }
        ch = orig;
      }
    }
    steps++;
  }
  return 0;
}`
  }
};
