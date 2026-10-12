import json
import os
import re
from collections import defaultdict

def extract_lc_slug(text):
    m = re.search(r"leetcode\.com/problems/([a-z0-9\-]+)", text)
    return m.group(1) if m else None

def extract_gfg_slug(text):
    m = re.search(r"geeksforgeeks\.org/(?:problems/)?([a-z0-9\-]+)", text)
    if not m:
        return None
    slug = m.group(1)
    return re.sub(r"-?\d+$", "", slug)

def extract_main_link_and_title(cell):
    m = re.match(r"\[(.*?)\]\((.*?)\)", cell.strip())
    if m:
        title, url = m.group(1), m.group(2)
    else:
        title, url = cell.strip(), ""
    title_clean = re.sub(r"^\d+\.\s+", "", title).strip()
    return title_clean, url

ALIASES = {
    "sort0s1sand2s": "sortcolors",
    "sortarrayof0s1sand2s": "sortcolors",
    "sortanarrayof0s1sand2s": "sortcolors",
    "kadanesalgorithm": "maximumsubarray",
    "stockbuyandsell": "besttimetobuyandsellstock",
    "merge2sortedarraywithoutextraspace": "mergesortedarray",
    "mergewithoutextraspace": "mergesortedarray",
    "mergeoverlappingintervals": "mergeintervals",
    "searchin2dmatrix": "searcha2dmatrix",
    "majorityelementi": "majorityelement",
    "majorityelementn2": "majorityelement",
    "majorityelementn3": "majorityelementii",
    "tripletsuminarray": "3sum",
    "findtheduplicateinanarrayofn1integers": "findtheduplicatenumber",
    "longestconsecutivesubsequence": "longestconsecutivesequence",
    "longestconsecutivesequenceinanarray": "longestconsecutivesequence",
    "rotatematrixby90degrees": "rotateimage",
    "rotateby90degree": "rotateimage",
    "printthematrixinspiralmanner": "spiralmatrix",
    "spirallytraversingamatrix": "spiralmatrix",
    "inversionofarray": "countinversions",
    "detectloopinlinkedlist": "linkedlistcycle",
    "detectacycleinalinkedlist": "linkedlistcycle",
    "reversealinkedlist": "reverselinkedlist",
    "findmiddleelementinalinkedlist": "middleofthelinkedlist",
    "diameterofabinarytree": "diameterofbinarytree",
    "heightofbinarytree": "maximumdepthofbinarytree",
    "maximumdepthinbt": "maximumdepthofbinarytree",
    "rightviewofbinarytree": "binarytreerightsideview",
    "zigzagtreenodetraversal": "binarytreezigzaglevelordertraversal",
    "zigzagtraversalofbinarytree": "binarytreezigzaglevelordertraversal",
    "lowestcommonancestorinabinarytree": "lowestcommonancestorofabinarytree",
    "lcaofbt": "lowestcommonancestorofabinarytree",
    "checkforbst": "validatebinarysearchtree",
    "01knapsackproblem": "01knapsack",
}

def norm_key(t):
    t = t.lower()
    t = re.sub(r"^\d+\.\s+", "", t)
    t = t.replace("&", "and")
    t = re.sub(r"[^a-z0-9]+", "", t)
    return ALIASES.get(t, t)

def map_unified_topic(raw_topic):
    rt = raw_topic.lower()
    if any(k in rt for k in ["beginner", "fundamental", "language", "pattern"]):
        return "20. Beginner & Fundamentals"
    if "matrix" in rt or "grid" in rt:
        if "dp" in rt:
            return "14. Dynamic Programming"
        return "2. Matrix / Grid"
    if "array" in rt:
        return "1. Arrays"
    if "sliding window" in rt or "two pointer" in rt or "2 pointer" in rt:
        return "4. Sliding Window & Two Pointers"
    if "string" in rt:
        return "3. Strings"
    if "binary search tree" in rt or "bst" in rt:
        return "11. Binary Search Trees (BST)"
    if "binary search" in rt or "searching" in rt or "sorting" in rt:
        return "5. Searching, Sorting & Binary Search"
    if "hash" in rt:
        return "6. Hashing & Prefix Sum"
    if "linked" in rt:
        return "7. Linked List"
    if "recursion" in rt or "backtrack" in rt:
        return "8. Recursion & Backtracking"
    if "stack" in rt or "queue" in rt:
        return "9. Stacks & Queues"
    if "tree" in rt and "segment" not in rt:
        return "10. Binary Trees"
    if "heap" in rt:
        return "12. Heaps & Priority Queue"
    if "greedy" in rt:
        return "13. Greedy Algorithms"
    if any(k in rt for k in ["dp", "dynamic programming", "knapsack", "lcs", "catalan", "mcm", "stock"]):
        return "14. Dynamic Programming"
    if "graph" in rt:
        return "15. Graphs"
    if "trie" in rt:
        return "16. Tries"
    if "segment" in rt or "fenwick" in rt:
        return "17. Segment Tree & BIT"
    if "bit" in rt:
        return "18. Bit Manipulation"
    return "19. Math & Miscellaneous"

def map_apna_broad_topic(day_topic):
    # e.g. "Day 1 : Array (Part 1)" -> "Arrays"
    if ":" in day_topic:
        rhs = day_topic.split(":", 1)[1].strip()
    else:
        rhs = day_topic.strip()
    rhs_clean = re.sub(r"\s*\(Part\s*\d+\)\s*", "", rhs, flags=re.I).strip()
    mapping = {
        "Array": "Arrays",
        "Strings": "Strings",
        "Binary Search": "Binary Search",
        "Recursion & Backtracking": "Recursion & Backtracking",
        "Linked List": "Linked List",
        "Stacks & Queues": "Stacks & Queues",
        "Binary Trees": "Binary Trees",
        "BST": "Binary Search Trees (BST)",
        "Heaps": "Heaps",
        "Tries": "Tries",
        "Graphs": "Graphs",
        "DP": "Dynamic Programming",
        "Greedy": "Greedy",
        "Miscellaneous": "Miscellaneous",
    }
    return mapping.get(rhs_clean, rhs_clean)

def assign_pattern_id(title, unified_topic, patterns):
    text = (title + " " + " ".join(patterns) + " " + unified_topic).lower()
    if any(k in text for k in ["kadane", "maximum subarray", "maximum product subarray", "circular subarray"]):
        return "pat-kadane"
    if any(k in text for k in ["sort colors", "0s, 1s", "0's 1's", "dutch", "partition array"]):
        return "pat-dutch-flag"
    if any(k in text for k in ["interval", "overlapping", "meeting", "arrows to burst", "video stitching"]):
        return "pat-merge-intervals"
    if any(k in text for k in ["majority element", "boyer", "more than n/k"]):
        return "pat-boyer-moore"
    if any(k in text for k in ["subarray sum", "prefix sum", "divisible by k", "divisible by p", "contiguous array", "0 sum", "zero sum", "xor"]):
        if "trie" in text or "maximum xor" in text:
            return "pat-trie-xor"
        if "prefix" in text or "subarray" in text:
            return "pat-prefix-hash"
    if any(k in text for k in ["3sum", "4sum", "two sum", "container with most water", "trapping rain", "boats to save", "two pointer", "2 pointer", "next permutation", "remove duplicates"]):
        return "pat-two-pointers"
    if any(k in text for k in ["sliding window", "longest substring", "character replacement", "anagrams in a string", "minimum window", "consecutive ones iii", "k different integers", "subarrays with"]):
        return "pat-sliding-window"
    if any(k in text for k in ["koko", "ship packages", "bouquets", "magnetic force", "aggressive cows", "allocate", "book", "split array largest", "smallest divisor", "minimize max", "painters", "median of two sorted", "kth smallest", "on answers"]):
        if "bst" not in text and "heap" not in unified_topic.lower():
            return "pat-bs-answer"
    if any(k in text for k in ["rotated sorted", "peak element", "single element in a sorted", "lower bound", "upper bound", "search a 2d", "search in 2d", "binary search"]):
        return "pat-binary-search"
    if any(k in text for k in ["next greater", "next smaller", "histogram", "maximal rectangle", "132 pattern", "asteroid", "remove k digits", "daily temperatures", "stock span", "subarray minimum", "min-product", "visible people", "monotonic"]):
        return "pat-monotonic-stack"
    if any(k in text for k in ["sliding window maximum", "shortest subarray with sum at least k", "jump game vi", "constrained subsequence"]):
        return "pat-monotonic-deque"
    if any(k in text for k in ["parenthes", "valid string", "min stack", "lru cache", "lfu cache", "stack", "queue"]):
        return "pat-stack-design"
    if any(k in text for k in ["cycle", "middle of", "intersection of two linked", "palindrome linked", "happy number", "duplicate number"]):
        if "linked" in text or "duplicate number" in text:
            return "pat-fast-slow"
    if any(k in text for k in ["reverse linked", "reverse nodes in k", "flatten", "add two numbers", "merge two sorted", "copy list", "linked list"]):
        return "pat-linked-list-rev"
    if any(k in text for k in ["n-queens", "sudoku", "word search", "rat in a maze", "m-coloring", "knight"]):
        return "pat-grid-backtrack"
    if any(k in text for k in ["subset", "permutation", "combination", "palindrome partitioning", "generate parentheses", "backtrack", "recursion"]):
        if "dp" not in unified_topic.lower():
            return "pat-subsets-backtrack"
    if any(k in text for k in ["diameter", "maximum path sum", "balanced binary", "height of binary", "maximum depth", "distribute coins", "house robber iii", "longest univalue", "longest zigzag", "cameras"]):
        return "pat-tree-dp"
    if any(k in text for k in ["lowest common ancestor", "lca", "distance k", "burn", "nodes at distance", "ancestor"]):
        return "pat-tree-lca"
    if any(k in text for k in ["level order", "zigzag", "right side view", "left view", "top view", "bottom view", "vertical order", "boundary"]):
        return "pat-tree-bfs"
    if any(k in text for k in ["binary search tree", "bst", "kth smallest in bst", "validate", "recover", "inorder successor"]):
        return "pat-bst"
    if any(k in text for k in ["tree", "inorder", "preorder", "postorder", "serialize", "construct binary"]):
        return "pat-tree-traversal"
    if any(k in text for k in ["median from data stream", "sliding window median", "ipo"]):
        return "pat-two-heaps"
    if any(k in text for k in ["kth largest", "k closest", "top k", "reorganize string", "task scheduler", "furthest building", "merge k", "smallest range", "heap", "priority queue"]):
        return "pat-top-k-heap"
    if any(k in text for k in ["course schedule", "topological", "alien dictionary", "eventual safe", "parallel courses", "largest color value", " prerequisite"]):
        return "pat-topo-sort"
    if any(k in text for k in ["dijkstra", "cheapest flights", "network delay", "minimum effort", "swim in rising", "ways to arrive", "shortest path", "bellman", "floyd", "city with the smallest"]):
        return "pat-dijkstra"
    if any(k in text for k in ["union find", "disjoint set", "provinces", "accounts merge", "redundant connection", "stones removed", "make network connected", "kruskal", "spanning tree", "connect all points", "equality equations", "smallest string with swaps"]):
        return "pat-dsu-mst"
    if any(k in text for k in ["critical connections", "bridge", "articulation", "kosaraju", "strongly connected", "bipartite", "possible bipartition"]):
        return "pat-graph-advanced"
    if any(k in text for k in ["island", "rotting oranges", "word ladder", "01 matrix", "surrounded regions", "pacific atlantic", "clone graph", "graph", "bfs", "dfs"]):
        return "pat-graph-bfs-dfs"
    if any(k in text for k in ["knapsack", "subset sum", "partition equal", "target sum", "coin change", "rod cutting", "last stone weight ii", "ones and zeroes", "profitable schemes"]):
        return "pat-knapsack-dp"
    if any(k in text for k in ["longest common subsequence", "lcs", "edit distance", "palindromic subsequence", "distinct subsequences", "shortest common supersequence", "wildcard", "regular expression", "delete operation", "interleaving"]):
        return "pat-lcs-string-dp"
    if any(k in text for k in ["longest increasing subsequence", "lis", "russian doll", "largest divisible subset", "longest string chain", "mountain array", "pair chain", "bridges"]):
        return "pat-lis-dp"
    if any(k in text for k in ["matrix chain", "mcm", "burst balloons", "minimum cost to cut", "palindrome partitioning ii", "palindrome partitioning iii", "boolean parenthesization", "egg dropping", "merge stones", "strange printer", "remove boxes"]):
        return "pat-mcm-partition-dp"
    if any(k in text for k in ["buy and sell stock", "cooldown", "transaction fee"]):
        return "pat-stock-dp"
    if any(k in text for k in ["unique paths", "minimum path sum", "dungeon game", "cherry pickup", "maximal square", "square submatrices", "triangle", "grid"]):
        return "pat-grid-dp"
    if any(k in text for k in ["house robber", "climbing stairs", "decode ways", "word break", "jump game", "frog jump", "catalan", "unique binary search", "dp", "dynamic programming"]):
        return "pat-1d-dp"
    if any(k in text for k in ["trie", "prefix tree", "word break ii", "concatenated words", "search suggestions"]):
        return "pat-trie"
    if any(k in text for k in ["segment tree", "fenwick", "range sum query - mutable", "smaller numbers after self", "reverse pairs", "create sorted array"]):
        return "pat-segment-bit"
    if any(k in text for k in ["bit", "single number", "power of two", "set bits", "xor"]):
        return "pat-bit-manip"
    if any(k in text for k in ["greedy", "gas station", "candy", "fractional knapsack", "job sequencing", "activity selection", "jump"]):
        return "pat-greedy"
    if any(k in text for k in ["spiral", "rotate image", "set matrix zeroes", "matrix"]):
        return "pat-matrix-traversal"
    if any(k in text for k in ["kmp", "rabin", "z-function", "longest happy prefix", "shortest palindrome", "repeated string match", "first occurrence", "pattern searching", "boyer moore"]):
        return "pat-string-algo"
    if any(k in text for k in ["reverse", "palindrome", "rotate", "move all", "segregate", "rearrange", "pair with given", "triplet"]):
        if "linked" not in text and "tree" not in text and "bits" not in text:
            return "pat-two-pointers"
    if any(k in text for k in ["anagram", "isomorphic", "longest common prefix", "roman", "atoi", "count and say", "parentheses", "string"]):
        return "pat-sliding-window"
    return "pat-stl-essentials"

items = []

# 1. Love Babbar
with open("love-babbar-sheet.md", encoding="utf-8") as f:
    topic = ""
    order_in_sheet = 0
    for line in f:
        s = line.strip()
        if s.startswith("## ") and "." in s:
            topic = s.split(".", 1)[1].strip()
        elif s.startswith("|") and "[ ]" in s:
            order_in_sheet += 1
            p = [x.strip() for x in s.split("|")[1:-1]]
            title, url = extract_main_link_and_title(p[3])
            items.append({
                "sheet_key": "babbar",
                "sheet_label": "Love Babbar",
                "raw_topic": topic,
                "sub_topic": "",
                "order": order_in_sheet,
                "title": title,
                "clean_title": title,
                "url": url,
                "lc_slug": extract_lc_slug(url),
                "gfg_slug": extract_gfg_slug(url),
                "diff": p[4],
                "companies": [c.strip() for c in p[6].split(",") if c.strip() and c.strip() != "-"],
                "links": {"GFG" if "geeksforgeeks" in url else "LC" if "leetcode" in url else "Link": url} if url else {},
                "patterns": []
            })

# 2. Apna College (DSA + DP)
with open("apna-college-sheet.md", encoding="utf-8") as f:
    sheet_key = "apna_dsa"
    sheet_label = "Apna College DSA"
    topic = ""
    order_in_sheet = 0
    for line in f:
        s = line.strip()
        if s.startswith("# Part 2"):
            sheet_key = "apna_dp"
            sheet_label = "Apna College DP"
            order_in_sheet = 0
        elif s.startswith("## ") and "." in s:
            topic = s.split(".", 1)[1].strip()
        elif s.startswith("|") and "[ ]" in s:
            order_in_sheet += 1
            p = [x.strip() for x in s.split("|")[1:-1]]
            title, url = extract_main_link_and_title(p[3])
            _, vid_url = extract_main_link_and_title(p[6])
            links = {}
            if url:
                links["LC" if "leetcode" in url else "GFG" if "geeksforgeeks" in url else "Link"] = url
            if vid_url:
                links["YT"] = vid_url
            broad_topic = map_apna_broad_topic(topic) if sheet_key == "apna_dsa" else topic
            sub_topic = topic if sheet_key == "apna_dsa" else ""
            items.append({
                "sheet_key": sheet_key,
                "sheet_label": sheet_label,
                "raw_topic": broad_topic,
                "sub_topic": sub_topic,
                "order": order_in_sheet,
                "title": title,
                "clean_title": title,
                "url": url,
                "lc_slug": extract_lc_slug(url),
                "gfg_slug": extract_gfg_slug(url),
                "diff": p[4],
                "companies": [c.strip() for c in p[7].split(",") if c.strip() and c.strip() != "-"],
                "links": links,
                "patterns": []
            })

# 3. Striver A2Z
with open("striver-a2z-sheet.md", encoding="utf-8") as f:
    step_topic = ""
    sub_topic = ""
    order_in_sheet = 0
    for line in f:
        s = line.strip()
        if s.startswith("## Step "):
            step_topic = s[3:].strip() # e.g. "Step 3: Arrays"
        elif s.startswith("### "):
            sub_topic = re.sub(r"^\d+\.\d+\s+", "", s[4:]).rsplit("(", 1)[0].strip()
        elif s.startswith("|") and "[ ]" in s:
            order_in_sheet += 1
            p = [x.strip() for x in s.split("|")[1:-1]]
            title, url = extract_main_link_and_title(p[3])
            links_raw = p[6]
            links = {}
            for lbl, lurl in re.findall(r"\[([A-Za-z]+)\]\((.*?)\)", links_raw):
                links[lbl] = lurl
            lc_slug = extract_lc_slug(links.get("LC", "")) or extract_lc_slug(url)
            pats = [x.strip() for x in p[5].split(",") if x.strip() and x.strip() != "-"]
            items.append({
                "sheet_key": "striver",
                "sheet_label": "Striver A2Z",
                "raw_topic": step_topic,
                "sub_topic": sub_topic,
                "order": order_in_sheet,
                "title": title,
                "clean_title": title,
                "url": links.get("LC") or url,
                "lc_slug": lc_slug,
                "gfg_slug": extract_gfg_slug(url),
                "diff": p[4],
                "companies": [],
                "links": links,
                "patterns": pats
            })

# 4. Medium SDE
with open("medium.md", encoding="utf-8") as f:
    topic = ""
    order_in_sheet = 0
    for line in f:
        s = line.strip()
        if s.startswith("## ") and "." in s:
            topic = s.split(".", 1)[1].rsplit("(", 1)[0].strip()
        elif s.startswith("|") and "[ ]" in s:
            order_in_sheet += 1
            p = [x.strip() for x in s.split("|")[1:-1]]
            title, url = extract_main_link_and_title(p[4])
            pats = [x.strip() for x in p[6].split(",") if x.strip() and x.strip() != "-"]
            items.append({
                "sheet_key": "med_sde",
                "sheet_label": "Medium SDE",
                "raw_topic": topic,
                "sub_topic": "",
                "order": order_in_sheet,
                "title": f"{p[2]}. {title}",
                "clean_title": title,
                "url": url,
                "lc_slug": extract_lc_slug(url),
                "gfg_slug": None,
                "diff": p[5],
                "companies": [],
                "links": {"LC": url} if url else {},
                "patterns": pats
            })

# 5. Hard SDE
with open("hard.md", encoding="utf-8") as f:
    topic = ""
    order_in_sheet = 0
    for line in f:
        s = line.strip()
        if s.startswith("## ") and "." in s:
            topic = s.split(".", 1)[1].rsplit("(", 1)[0].strip()
        elif s.startswith("|") and "[ ]" in s:
            order_in_sheet += 1
            p = [x.strip() for x in s.split("|")[1:-1]]
            title, url = extract_main_link_and_title(p[4])
            pats = [x.strip() for x in p[6].split(",") if x.strip() and x.strip() != "-"]
            items.append({
                "sheet_key": "hard_sde",
                "sheet_label": "Hard SDE",
                "raw_topic": topic,
                "sub_topic": "",
                "order": order_in_sheet,
                "title": f"{p[2]}. {title}",
                "clean_title": title,
                "url": url,
                "lc_slug": extract_lc_slug(url),
                "gfg_slug": None,
                "diff": p[5],
                "companies": [],
                "links": {"LC": url} if url else {},
                "patterns": pats
            })

n = len(items)
parent = list(range(n))
def find(i):
    while parent[i] != i:
        parent[i] = parent[parent[i]]
        i = parent[i]
    return i
def union(i, j):
    ri, rj = find(i), find(j)
    if ri != rj:
        if ri < rj:
            parent[rj] = ri
        else:
            parent[ri] = rj

key_map = {}
for idx, it in enumerate(items):
    keys = []
    ct = it.get("clean_title") or it["title"]
    nk = norm_key(ct)
    rt = it["raw_topic"]
    if nk in ("easyandmedium", "hard") or nk.startswith("pattern"):
        keys.append(f"tuf_special:{rt}:{nk}")
    else:
        keys.append(f"title:{nk}")
        lc_s = it["lc_slug"]
        if lc_s and lc_s != "rotate-array":
            keys.append(f"lc:{lc_s}")
            keys.append("title:" + norm_key(lc_s.replace("-", " ")))
        gfg_s = it["gfg_slug"]
        if gfg_s:
            keys.append(f"gfg:{gfg_s}")
    for k in keys:
        if k in key_map:
            union(idx, key_map[k])
        else:
            key_map[k] = idx

groups = defaultdict(list)
for idx in range(n):
    groups[find(idx)].append(items[idx])

SHEET_KEYS_ORDER = ["babbar", "apna_dsa", "apna_dp", "striver", "med_sde", "hard_sde"]
DIFF_MAP = {
    "Easy": "Easy", "Basic": "Easy", "Learning": "Easy",
    "Medium": "Medium", "Core": "Medium",
    "Hard": "Hard", "Pro": "Hard"
}

questions_out = []
used_ids = set()

for gid, g in groups.items():
    best_title = g[0]["title"]
    for x in g:
        if x["sheet_key"] in ("med_sde", "hard_sde"):
            best_title = x["title"]
            break

    # Generate stable ID
    lc_slug = next((x["lc_slug"] for x in g if x["lc_slug"]), None)
    gfg_slug = next((x["gfg_slug"] for x in g if x["gfg_slug"]), None)
    base_id = f"lc-{lc_slug}" if lc_slug else (f"gfg-{gfg_slug}" if gfg_slug else f"q-{norm_key(best_title)[:32]}")
    qid = base_id
    counter = 2
    while qid in used_ids:
        qid = f"{base_id}-{counter}"
        counter += 1
    used_ids.add(qid)

    placements = {}
    present_sheets = []
    for sk in SHEET_KEYS_ORDER:
        matches = [x for x in g if x["sheet_key"] == sk]
        if matches:
            m0 = matches[0]
            present_sheets.append(sk)
            placements[sk] = {
                "topic": m0["raw_topic"],
                "subtopic": m0["sub_topic"],
                "order": m0["order"]
            }

    distinct_families = len(set("apna" if s.startswith("apna") else s for s in present_sheets))

    merged_links = {}
    for lbl in ["LC", "GFG", "YT", "Blog", "TUF", "Link"]:
        for x in g:
            if lbl in x["links"] and lbl not in merged_links:
                merged_links[lbl] = x["links"][lbl]

    diff = "Medium"
    for x in g:
        if x["diff"] in ("Easy", "Medium", "Hard"):
            diff = x["diff"]
            break
    else:
        diff = DIFF_MAP.get(g[0]["diff"], "Medium")

    pats = []
    seen_p = set()
    for x in g:
        for pt in x["patterns"]:
            if pt.lower() not in seen_p:
                seen_p.add(pt.lower())
                pats.append(pt)

    comps = []
    seen_c = set()
    for x in g:
        for c in x["companies"]:
            if c.lower() not in seen_c:
                seen_c.add(c.lower())
                comps.append(c)

    u_topic = map_unified_topic(g[0]["raw_topic"])
    # Prefer non-beginner topic if question also appears in a specific topic sheet
    for x in g:
        cand_t = map_unified_topic(x["raw_topic"])
        if not cand_t.startswith("20."):
            u_topic = cand_t
            if x["sheet_key"] in ("striver", "babbar", "apna_dsa", "apna_dp"):
                break

    pattern_id = assign_pattern_id(best_title, u_topic, pats)

    questions_out.append({
        "id": qid,
        "title": best_title,
        "diff": diff,
        "overlap": distinct_families,
        "sheets": present_sheets,
        "unifiedTopic": u_topic,
        "placements": placements,
        "patternId": pattern_id,
        "patterns": pats[:5],
        "companies": comps[:12],
        "links": merged_links
    })

# Attach problem statements, examples, and constraints from data/problems_meta.json
problems_meta = {}
if os.path.exists("data/problems_meta.json"):
    with open("data/problems_meta.json", encoding="utf-8") as pmf:
        problems_meta = json.load(pmf)

for q in questions_out:
    pm = problems_meta.get(q["id"]) or {}
    q["desc"] = pm.get("desc") or ""
    q["examples"] = pm.get("examples") or []
    q["constraints"] = pm.get("constraints") or []

# Sort questions globally by unifiedTopic number, then overlap desc, then diff
diff_rank = {"Easy": 1, "Medium": 2, "Hard": 3}
questions_out.sort(key=lambda q: (
    int(q["unifiedTopic"].split(".")[0]),
    -q["overlap"],
    diff_rank.get(q["diff"], 2),
    q["title"]
))

# Build topic lists per sheet preserving original topic order
sheet_topics = {}
for sk in SHEET_KEYS_ORDER:
    seen_t = []
    seen_set = set()
    sk_qs = [q for q in questions_out if sk in q["placements"]]
    sk_qs.sort(key=lambda q: q["placements"][sk]["order"])
    for q in sk_qs:
        t = q["placements"][sk]["topic"]
        if t not in seen_set:
            seen_set.add(t)
            seen_t.append(t)
    sheet_topics[sk] = seen_t

master_topics = sorted(
    list({q["unifiedTopic"] for q in questions_out}),
    key=lambda k: int(k.split(".")[0])
)

sheets_meta = {
    "master":       {"label": "All Combined (1,136)", "short": "All (1136)", "topics": master_topics},
    "must_do":      {"label": "3S+ Must-Do (95)", "short": "3S+ (95)", "topics": master_topics},
    "high_overlap": {"label": "2S+ Overlap (239)", "short": "2S+ (239)", "topics": master_topics},
    "babbar":       {"label": "LB · Love Babbar (445)", "short": "LB (445)", "topics": sheet_topics["babbar"]},
    "apna_dsa":     {"label": "AC · Apna DSA (192)", "short": "AC (192)", "topics": sheet_topics["apna_dsa"]},
    "apna_dp":      {"label": "AC-DP · Apna DP (50)", "short": "AC-DP (50)", "topics": sheet_topics["apna_dp"]},
    "striver":      {"label": "STR · Striver A2Z (495)", "short": "STR (495)", "topics": sheet_topics["striver"]},
    "med_sde":      {"label": "LC-M · Medium SDE (230)", "short": "LC-M (230)", "topics": sheet_topics["med_sde"]},
    "hard_sde":     {"label": "LC-H · Hard SDE (154)", "short": "LC-H (154)", "topics": sheet_topics["hard_sde"]},
}

os.makedirs("data", exist_ok=True)
with open("data/questions_data.js", "w", encoding="utf-8") as f:
    f.write("// Auto-generated master DSA dataset across all 5 sheets\n")
    f.write("window.SHEETS_META = " + json.dumps(sheets_meta, ensure_ascii=False, indent=2) + ";\n\n")
    f.write("window.QUESTIONS_DATA = " + json.dumps(questions_out, ensure_ascii=False) + ";\n")

print(f"Generated data/questions_data.js with {len(questions_out)} unique questions!")
for sk, meta in sheets_meta.items():
    print(f"  {sk:14s}: {len(meta['topics'])} topics -> {meta['topics'][:4]}...")
