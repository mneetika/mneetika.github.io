---
layout: single
comments: true
title: Topological Sort and SCC
date: 2026-02-26 10:00:00-0000
categories: C++
tags: [cpp, algorithms, graph, topo-sort, scc]
---

## Kahn's Topological Sort (BFS)
Topological sort orders DAG nodes so every directed edge goes left to right.
Core idea: start from nodes with indegree 0.
How it works: pop zero-indegree nodes, remove their outgoing edges, repeat.

Dry-run:
- Edges: `5->2, 5->0, 4->0, 4->1, 2->3, 3->1`.
- Initial indegree-0 nodes: `4,5`.
- Process `4,5`, then `2,0`, then `3`, then `1`.
- One valid topological order: `[4, 5, 2, 0, 3, 1]`.

Complexity:
- Time `O(V + E)`.
- Space `O(V)` for indegree + queue.

Edge-case checklist:
- Graph with cycle should return empty/invalid order.
- Multiple valid topological orders are normal.

{% highlight c++ %}
#include <queue>
#include <vector>

std::vector<int> topoSortKahn(int n, const std::vector<std::vector<int>>& adj) {
  std::vector<int> indegree(n, 0);
  for (int u = 0; u < n; ++u) {
    for (int v : adj[u]) {
      ++indegree[v];
    }
  }

  std::queue<int> q;
  for (int i = 0; i < n; ++i) {
    if (indegree[i] == 0) {
      q.push(i);
    }
  }

  std::vector<int> order;
  while (!q.empty()) {
    int u = q.front();
    q.pop();
    order.push_back(u);

    for (int v : adj[u]) {
      --indegree[v];
      if (indegree[v] == 0) {
        q.push(v);
      }
    }
  }

  if (static_cast<int>(order.size()) != n) {
    return {};
  }
  return order;
}
{% endhighlight %}

## DFS Topological Sort
DFS topological sort builds order by finish times.
Core idea: push node after all descendants are processed.
How it works: reverse postorder gives topological order for DAGs.

Dry-run:
- DFS from each unvisited node.
- Append node on return (finish time order).
- If finish order is `[1,3,2,0,5,4]`, reverse gives topo order `[4,5,0,2,3,1]`.

Complexity:
- Time `O(V + E)`.
- Space `O(V)` + recursion stack.

Edge-case checklist:
- Must track 3-state visitation to detect back-edge cycles.
- Deep recursion risk on long chains.

{% highlight c++ %}
#include <algorithm>
#include <vector>

bool topoDfs(int u, const std::vector<std::vector<int>>& adj,
             std::vector<int>& state, std::vector<int>& order) {
  state[u] = 1;
  for (int v : adj[u]) {
    if (state[v] == 1) {
      return false;
    }
    if (state[v] == 0 && !topoDfs(v, adj, state, order)) {
      return false;
    }
  }
  state[u] = 2;
  order.push_back(u);
  return true;
}

std::vector<int> topoSortDfs(int n, const std::vector<std::vector<int>>& adj) {
  std::vector<int> state(n, 0);
  std::vector<int> order;

  for (int i = 0; i < n; ++i) {
    if (state[i] == 0 && !topoDfs(i, adj, state, order)) {
      return {};
    }
  }

  std::reverse(order.begin(), order.end());
  return order;
}
{% endhighlight %}

## Kosaraju SCC
SCC groups nodes that can all reach each other.
Core idea: process nodes by finish order, then DFS on reversed graph.
How it works:
- First pass gets finish order on original graph.
- Second pass on reverse graph extracts SCCs one by one.

Dry-run:
- Edges: `0->1, 1->2, 2->0, 1->3, 3->4, 4->3`.
- First pass finish order prioritizes SCC roots.
- Reverse graph DFS in that order gives SCCs: `{0,1,2}` and `{3,4}`.

Complexity:
- Time `O(V + E)`.
- Space `O(V + E)` due to reverse graph and stacks.

Edge-case checklist:
- Single-node SCCs are valid.
- Isolated nodes also form SCCs of size 1.

{% highlight c++ %}
#include <algorithm>
#include <vector>

void dfsOrder(int u, const std::vector<std::vector<int>>& adj,
              std::vector<bool>& seen, std::vector<int>& order) {
  seen[u] = true;
  for (int v : adj[u]) {
    if (!seen[v]) {
      dfsOrder(v, adj, seen, order);
    }
  }
  order.push_back(u);
}

void dfsCollect(int u, const std::vector<std::vector<int>>& radj,
                std::vector<bool>& seen, std::vector<int>& comp) {
  seen[u] = true;
  comp.push_back(u);
  for (int v : radj[u]) {
    if (!seen[v]) {
      dfsCollect(v, radj, seen, comp);
    }
  }
}

std::vector<std::vector<int>> kosarajuScc(int n,
                                          const std::vector<std::vector<int>>& adj) {
  std::vector<std::vector<int>> radj(n);
  for (int u = 0; u < n; ++u) {
    for (int v : adj[u]) {
      radj[v].push_back(u);
    }
  }

  std::vector<bool> seen(n, false);
  std::vector<int> order;
  for (int i = 0; i < n; ++i) {
    if (!seen[i]) {
      dfsOrder(i, adj, seen, order);
    }
  }

  std::fill(seen.begin(), seen.end(), false);
  std::reverse(order.begin(), order.end());

  std::vector<std::vector<int>> sccs;
  for (int u : order) {
    if (seen[u]) {
      continue;
    }
    std::vector<int> comp;
    dfsCollect(u, radj, seen, comp);
    sccs.push_back(comp);
  }
  return sccs;
}
{% endhighlight %}
